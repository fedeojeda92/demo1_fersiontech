import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

const TENANT_SLUG = process.env.TENANT_SLUG ?? "fs-inmobiliaria";

export const getTenantId = cache(async (): Promise<string> => {
  const supabase = await createClient();
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
});
