import "server-only";
import { cache } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

const TENANT_SLUG = process.env.TENANT_SLUG ?? "fs-inmobiliaria";

export const getTenantId = cache(async (): Promise<string> => {
  const supabase = await createClient();
  return resolveTenantId(supabase);
});

/**
 * Igual que getTenantId, pero para contextos sin cookies/sesión (ej. el webhook de
 * WhatsApp) que ya tienen su propio cliente admin en mano. Sigue siendo single-tenant
 * por deployment vía TENANT_SLUG — no hay todavía un mapeo de WHATSAPP_PHONE_NUMBER_ID
 * a tenant (eso es multi-tenant real, ver BL-11, fuera de alcance acá).
 */
export async function getTenantIdAdmin(supabase: SupabaseClient): Promise<string> {
  return resolveTenantId(supabase);
}

async function resolveTenantId(supabase: SupabaseClient): Promise<string> {
  const { data, error } = await supabase
    .from("tenants")
    .select("id")
    .eq("slug", TENANT_SLUG)
    .single();

  if (error || !data) {
    throw new Error(
      `No se encontró el tenant "${TENANT_SLUG}". Corré supabase/schema.sql en el proyecto Supabase primero.`
    );
  }

  return data.id as string;
}
