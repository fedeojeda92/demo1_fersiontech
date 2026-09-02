import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";
import { getCurrentAgent } from "@/lib/dal";
import { buildGoogleAuthUrl, isGoogleCalendarConfigured, GOOGLE_OAUTH_STATE_COOKIE } from "@/lib/googleCalendar";

export async function GET(request: Request) {
  const locale = new URL(request.url).searchParams.get("locale") ?? "es";

  // Exige sesión de admin — si no hay, getCurrentAgent redirige a /admin/login.
  await getCurrentAgent(locale);

  if (!isGoogleCalendarConfigured()) {
    return new NextResponse(
      "Google Calendar no está configurado en el servidor (faltan GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET en .env.local).",
      { status: 500 }
    );
  }

  const state = randomBytes(16).toString("hex");
  const cookieStore = await cookies();
  cookieStore.set(GOOGLE_OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  const redirectUri = new URL("/api/auth/google/callback", request.url).toString();
  return NextResponse.redirect(buildGoogleAuthUrl(redirectUri, state));
}
