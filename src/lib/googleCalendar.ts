import "server-only";

const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const CALENDAR_EVENTS_ENDPOINT = "https://www.googleapis.com/calendar/v3/calendars/primary/events";
const SCOPE = "https://www.googleapis.com/auth/calendar.events openid email";
const TIMEZONE = "America/Argentina/Buenos_Aires";

export const GOOGLE_OAUTH_STATE_COOKIE = "google_oauth_state";

function getCredentials() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret };
}

export function isGoogleCalendarConfigured(): boolean {
  return Boolean(getCredentials());
}

/** access_type=offline + prompt=consent garantizan que Google mande refresh_token cada vez (si no, solo lo manda la primera vez que el usuario autoriza la app). */
export function buildGoogleAuthUrl(redirectUri: string, state: string): string {
  const creds = getCredentials();
  if (!creds) throw new Error("Google Calendar no está configurado (faltan GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET).");

  const params = new URLSearchParams({
    client_id: creds.clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPE,
    access_type: "offline",
    prompt: "consent",
    state,
  });
  return `${AUTH_ENDPOINT}?${params.toString()}`;
}

interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  id_token?: string;
}

export async function exchangeGoogleAuthCode(code: string, redirectUri: string): Promise<GoogleTokenResponse> {
  const creds = getCredentials();
  if (!creds) throw new Error("Google Calendar no está configurado.");

  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: creds.clientId,
      client_secret: creds.clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) {
    throw new Error(`Error intercambiando el código de Google: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

/** Decodifica el payload del id_token (JWT) sin verificar firma: viene directo del endpoint de token de Google por HTTPS, es de confianza. Solo se usa para mostrar qué cuenta quedó conectada, no para autenticar. */
export function decodeGoogleIdTokenEmail(idToken: string): string | null {
  try {
    const payload = idToken.split(".")[1];
    const json = Buffer.from(payload, "base64").toString("utf-8");
    return JSON.parse(json).email ?? null;
  } catch {
    return null;
  }
}

async function getAccessToken(refreshToken: string): Promise<string | null> {
  const creds = getCredentials();
  if (!creds) return null;

  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: creds.clientId,
      client_secret: creds.clientSecret,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    console.error("Google refresh_token inválido o revocado:", res.status, await res.text());
    return null;
  }

  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

/** Suma minutos a un date+time (YYYY-MM-DD, HH:MM) tratándolos como hora de Buenos Aires (offset fijo -03:00, sin horario de verano). */
function addMinutes(date: string, time: string, minutes: number): { date: string; time: string } {
  const start = new Date(`${date}T${time}:00-03:00`);
  const end = new Date(start.getTime() + minutes * 60 * 1000);
  const local = new Date(end.getTime() - 3 * 60 * 60 * 1000); // leer los campos UTC como si fueran -03:00
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    date: `${local.getUTCFullYear()}-${pad(local.getUTCMonth() + 1)}-${pad(local.getUTCDate())}`,
    time: `${pad(local.getUTCHours())}:${pad(local.getUTCMinutes())}`,
  };
}

export interface BusyInterval {
  /** Minutos desde las 00:00 (hora de Buenos Aires) del día consultado. */
  start: number;
  end: number;
}

interface GoogleEventTime {
  dateTime?: string;
  date?: string;
}

/**
 * Devuelve los intervalos ocupados de un día en el calendario primario del agente.
 * Ignora los eventos marcados como "Libre" (transparency: transparent) — por default así
 * quedan los eventos de día completo (feriados, cumpleaños), que no deberían bloquear visitas.
 * Si falla (token revocado, API caída) devuelve null para que el llamador decida qué hacer.
 */
export async function listGoogleCalendarBusy(refreshToken: string, date: string): Promise<BusyInterval[] | null> {
  const accessToken = await getAccessToken(refreshToken);
  if (!accessToken) return null;

  const dayStart = Date.parse(`${date}T00:00:00-03:00`);
  const dayEnd = dayStart + 24 * 60 * 60 * 1000;
  const params = new URLSearchParams({
    timeMin: new Date(dayStart).toISOString(),
    timeMax: new Date(dayEnd).toISOString(),
    singleEvents: "true",
    orderBy: "startTime",
  });

  const res = await fetch(`${CALENDAR_EVENTS_ENDPOINT}?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    console.error("Google Calendar events.list error:", res.status, await res.text());
    return null;
  }

  const data = (await res.json()) as {
    items?: { start?: GoogleEventTime; end?: GoogleEventTime; transparency?: string; status?: string }[];
  };

  const toMinutes = (time: GoogleEventTime | undefined, fallback: number) => {
    if (!time?.dateTime) return fallback;
    const minutes = (Date.parse(time.dateTime) - dayStart) / 60000;
    return Math.min(Math.max(minutes, 0), 24 * 60);
  };

  return (data.items ?? [])
    .filter((e) => e.status !== "cancelled" && e.transparency !== "transparent")
    .map((e) => ({ start: toMinutes(e.start, 0), end: toMinutes(e.end, 24 * 60) }));
}

interface CalendarEventArgs {
  refreshToken: string;
  summary: string;
  description: string;
  location?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  durationMinutes?: number;
}

/**
 * Crea el evento en el Google Calendar primario del agente. Best-effort: si falla (token
 * revocado, API caída) solo loguea, no bloquea nada — el lead ya quedó guardado en Supabase
 * antes de llamar acá (ver src/lib/actions/leads.ts).
 */
export async function createGoogleCalendarEvent({
  refreshToken,
  summary,
  description,
  location,
  date,
  time,
  durationMinutes = 30,
}: CalendarEventArgs): Promise<void> {
  const accessToken = await getAccessToken(refreshToken);
  if (!accessToken) return;

  const end = addMinutes(date, time, durationMinutes);

  const res = await fetch(CALENDAR_EVENTS_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      summary,
      description,
      location,
      start: { dateTime: `${date}T${time}:00`, timeZone: TIMEZONE },
      end: { dateTime: `${end.date}T${end.time}:00`, timeZone: TIMEZONE },
      reminders: { useDefault: true },
    }),
  });

  if (!res.ok) {
    console.error("Google Calendar events.insert error:", res.status, await res.text());
  }
}
