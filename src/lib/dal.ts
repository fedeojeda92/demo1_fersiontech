import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface Agent {
  id: string;
  tenant_id: string;
  full_name: string | null;
  role: "admin" | "agent";
  whatsapp_number: string | null;
  google_email: string | null;
  google_connected_at: string | null;
}

// Revalida contra el servidor de Auth (no solo lee la cookie) en cada verificacion sensible,
// cacheado con react.cache() para no repetir la llamada dentro del mismo render.
export const verifySession = cache(async (locale: string) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/admin/login`);
  }

  return user;
});

export const getCurrentAgent = cache(async (locale: string): Promise<Agent> => {
  const user = await verifySession(locale);
  const supabase = await createClient();

  const { data: agent } = await supabase
    .from("agents")
    .select("id, tenant_id, full_name, role, whatsapp_number, google_email, google_connected_at")
    .eq("id", user.id)
    .single();

  if (!agent) {
    redirect(`/${locale}/admin/login`);
  }

  return agent as Agent;
});
