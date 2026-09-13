import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente con service role, para contextos sin cookies/sesión (webhooks, cron jobs).
 * Antes este patrón estaba repetido en cada call site (health, agenda.ics, leads) —
 * se factoriza acá porque el agente de WhatsApp suma varios call sites más.
 */
export function createAdminClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
