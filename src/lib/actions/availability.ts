"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getTenantIdAdmin } from "@/lib/tenant";
import { getAvailability, type Availability } from "@/lib/availability";

/** Solo devuelve horarios (sin datos de leads), así que es seguro exponerlo al formulario público. */
export async function getAvailabilityAction(date: string): Promise<Availability> {
  const supabase = createAdminClient();
  const tenantId = await getTenantIdAdmin(supabase);
  return getAvailability(supabase, tenantId, date);
}
