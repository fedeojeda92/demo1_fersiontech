import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentAgent } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { exchangeGoogleAuthCode, decodeGoogleIdTokenEmail, GOOGLE_OAUTH_STATE_COOKIE } from "@/lib/googleCalendar";

const DEFAULT_LOCALE = "es";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  // Layout de (protected) ya exige sesión, pero esta es una navegación nueva (volviendo de
  // Google) así que la volvemos a validar acá para saber a qué agente conectarle el token.
  const agent = await getCurrentAgent(DEFAULT_LOCALE);

  const cookieStore = await cookies();
  const expectedState = cookieStore.get(GOOGLE_OAUTH_STATE_COOKIE)?.value;
  cookieStore.delete(GOOGLE_OAUTH_STATE_COOKIE);

  const agendaUrl = new URL(`/${DEFAULT_LOCALE}/admin/agenda`, request.url);

  if (oauthError || !code || !state || state !== expectedState) {
    agendaUrl.searchParams.set("google", "error");
    return NextResponse.redirect(agendaUrl);
  }

  try {
    const redirectUri = new URL("/api/auth/google/callback", request.url).toString();
    const tokens = await exchangeGoogleAuthCode(code, redirectUri);

    if (!tokens.refresh_token) {
      // No debería pasar con access_type=offline + prompt=consent, pero por las dudas.
      agendaUrl.searchParams.set("google", "error");
      return NextResponse.redirect(agendaUrl);
    }

    const email = tokens.id_token ? decodeGoogleIdTokenEmail(tokens.id_token) : null;
    const supabase = await createClient();
    await supabase
      .from("agents")
      .update({
        google_refresh_token: tokens.refresh_token,
        google_email: email,
        google_connected_at: new Date().toISOString(),
      })
      .eq("id", agent.id);

    agendaUrl.searchParams.set("google", "connected");
    return NextResponse.redirect(agendaUrl);
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    agendaUrl.searchParams.set("google", "error");
    return NextResponse.redirect(agendaUrl);
  }
}
