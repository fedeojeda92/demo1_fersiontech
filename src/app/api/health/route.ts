import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Endpoint liviano para el ping semanal de GitHub Actions (.github/workflows/supabase-ping.yml)
 * que evita que el proyecto Supabase Free se pause por 7 días de inactividad.
 */
export async function GET(request: Request) {
  const secret = request.headers.get("x-healthcheck-secret");
  if (process.env.HEALTHCHECK_SECRET && secret !== process.env.HEALTHCHECK_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { error } = await supabase.from("tenants").select("id").limit(1);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
