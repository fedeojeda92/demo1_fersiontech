import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Encuentra o crea el lead asociado a una conversación de WhatsApp, para que aparezca
 * en /admin/leads igual que los leads del formulario web (ver src/lib/actions/leads.ts).
 * Un lead de WhatsApp no tiene email (a diferencia de los del formulario) — requiere que
 * leads.email sea nullable, ver supabase/schema.sql.
 */
export async function upsertWhatsappLead(
  supabase: SupabaseClient,
  tenantId: string,
  phone: string,
  displayName?: string
): Promise<{ id: string; isNew: boolean }> {
  const { data: existing, error: findError } = await supabase
    .from("leads")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("phone", phone)
    .eq("source", "whatsapp")
    .maybeSingle();

  if (findError) {
    throw new Error(`upsertWhatsappLead: error buscando lead existente: ${findError.message}`);
  }

  if (existing) {
    return { id: existing.id as string, isNew: false };
  }

  const { data: created, error: insertError } = await supabase
    .from("leads")
    .insert({
      tenant_id: tenantId,
      source: "whatsapp",
      name: displayName || "Contacto WhatsApp",
      phone,
      email: null,
    })
    .select("id")
    .single();

  if (insertError || !created) {
    throw new Error(`upsertWhatsappLead: error creando lead: ${insertError?.message}`);
  }

  return { id: created.id as string, isNew: true };
}

/**
 * Recuerda la última propiedad puntual que le interesó al lead (cuando `search_properties`
 * devuelve un único resultado), para poder reconstruir el ID en el próximo mensaje. El
 * historial que se le manda a Gemini solo guarda el texto de las respuestas (ver
 * getRecentMessages), no las llamadas a herramientas — sin esto, el agente pierde el ID real
 * de la propiedad apenas termina el turno y puede confundirse al confirmar una visita.
 */
export async function rememberLeadProperty(
  supabase: SupabaseClient,
  leadId: string,
  propertyId: string
): Promise<void> {
  const { error } = await supabase.from("leads").update({ property_id: propertyId }).eq("id", leadId);
  if (error) {
    console.error("rememberLeadProperty:", error.message);
  }
}

/** Actualiza el lead de WhatsApp con la visita agendada, para que se vea en el panel. */
export async function attachAppointmentToLead(
  supabase: SupabaseClient,
  leadId: string,
  propertyId: string,
  date: string,
  time: string
): Promise<void> {
  const { error } = await supabase
    .from("leads")
    .update({ property_id: propertyId, appointment_date: date, appointment_time: time })
    .eq("id", leadId);

  if (error) {
    console.error("attachAppointmentToLead:", error.message);
  }
}
