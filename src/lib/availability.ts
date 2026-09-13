import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isGoogleCalendarConfigured, listGoogleCalendarBusy, type BusyInterval } from "@/lib/googleCalendar";

export const VISIT_DURATION_MINUTES = 30;

// Mantener en sync con el horario de /contacto y de docs/agente-whatsapp-prompt.md.
// Índice = día de la semana (0 = domingo). null = cerrado.
const BUSINESS_HOURS: ({ open: string; close: string } | null)[] = [
  null,
  { open: "09:00", close: "18:00" },
  { open: "09:00", close: "18:00" },
  { open: "09:00", close: "18:00" },
  { open: "09:00", close: "18:00" },
  { open: "09:00", close: "18:00" },
  { open: "10:00", close: "14:00" },
];

export type Availability =
  | { ok: true; slots: { time: string; available: boolean }[] }
  | { ok: false; reason: "invalid_date" | "closed" | "past" };

const toMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

const toTime = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

/**
 * Horarios de visita de una fecha (hora de Buenos Aires), marcando cuáles están ocupados.
 * Cruza el horario de atención con los turnos ya guardados en `leads` (web y WhatsApp) y los
 * eventos del Google Calendar de cada agente conectado. Requiere un cliente con service role:
 * `leads` y `agents` no son legibles para visitantes anónimos.
 */
export async function getAvailability(
  supabase: SupabaseClient,
  tenantId: string,
  date: string
): Promise<Availability> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T12:00:00-03:00`))) {
    return { ok: false, reason: "invalid_date" };
  }

  const hours = BUSINESS_HOURS[new Date(`${date}T12:00:00-03:00`).getUTCDay()];
  if (!hours) return { ok: false, reason: "closed" };

  const nowBA = new Date(Date.now() - 3 * 60 * 60 * 1000);
  const todayBA = nowBA.toISOString().slice(0, 10);
  if (date < todayBA) return { ok: false, reason: "past" };
  const earliest = date === todayBA ? nowBA.getUTCHours() * 60 + nowBA.getUTCMinutes() : 0;

  const busy: BusyInterval[] = [];

  const { data: booked } = await supabase
    .from("leads")
    .select("appointment_time")
    .eq("tenant_id", tenantId)
    .eq("appointment_date", date)
    .not("appointment_time", "is", null);
  for (const row of booked ?? []) {
    const start = toMinutes(row.appointment_time as string);
    busy.push({ start, end: start + VISIT_DURATION_MINUTES });
  }

  if (isGoogleCalendarConfigured()) {
    const { data: agents } = await supabase
      .from("agents")
      .select("google_refresh_token")
      .eq("tenant_id", tenantId)
      .not("google_refresh_token", "is", null);
    const calendars = await Promise.all(
      (agents ?? []).map((a) => listGoogleCalendarBusy(a.google_refresh_token as string, date))
    );
    for (const intervals of calendars) busy.push(...(intervals ?? []));
  }

  const slots: { time: string; available: boolean }[] = [];
  for (
    let slot = toMinutes(hours.open);
    slot + VISIT_DURATION_MINUTES <= toMinutes(hours.close);
    slot += VISIT_DURATION_MINUTES
  ) {
    if (slot < earliest) continue;
    const overlaps = busy.some((b) => slot < b.end && slot + VISIT_DURATION_MINUTES > b.start);
    slots.push({ time: toTime(slot), available: !overlaps });
  }

  return { ok: true, slots };
}
