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
  displayName?: string,
  source: "whatsapp" | "web_demo" = "whatsapp"
): Promise<{ id: string; isNew: boolean }> {
  const { data: existing, error: findError } = await supabase
    .from("leads")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("phone", phone)
    .eq("source", source)
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
      source,
      name: displayName || (source === "web_demo" ? "Visitante del chat web" : "Contacto WhatsApp"),
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

/**
 * Busca el lead de una conversación **sin crearlo**. Lo usa el chat web, donde la ficha se
 * crea recién cuando hay algo que registrar (ver ToolContext.ensureLeadId): al arrancar cada
 * turno hay que saber si ya existe, pero sin que el solo hecho de preguntar la cree.
 */
export async function findLeadIdByPhone(
  supabase: SupabaseClient,
  tenantId: string,
  phone: string,
  source: "whatsapp" | "web_demo"
): Promise<string | null> {
  const { data, error } = await supabase
    .from("leads")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("phone", phone)
    .eq("source", source)
    .maybeSingle();

  if (error) {
    console.error("findLeadIdByPhone:", error.message);
    return null;
  }
  return (data?.id as string) ?? null;
}

/**
 * Completa la ficha del lead con los datos que dio el interesado durante la conversación
 * (tool `save_contact`). Es lo que hace útil a un lead del chat web: ahí no hay teléfono
 * conocido como en WhatsApp — `phone` arranca siendo el id de sesión y recién se vuelve un
 * contacto real cuando el visitante lo dice. Solo pisa los campos que vinieron con valor.
 */
export async function updateLeadContact(
  supabase: SupabaseClient,
  leadId: string,
  contact: { name?: string; phone?: string; email?: string }
): Promise<void> {
  const patch: Record<string, string> = {};
  if (contact.name?.trim()) patch.name = contact.name.trim();
  if (contact.phone?.trim()) patch.phone = contact.phone.trim();
  if (contact.email?.trim()) patch.email = contact.email.trim();
  if (Object.keys(patch).length === 0) return;

  const { error } = await supabase.from("leads").update(patch).eq("id", leadId);
  if (error) {
    console.error("updateLeadContact:", error.message);
  }
}

/** Solo los dígitos, para comparar teléfonos escritos de cualquier forma ("11 2222 3333"). */
function phoneDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}

/**
 * Junta en un solo lead las fichas del chat web que resultaron ser la misma persona.
 *
 * La sesión del chat va por cookie, así que el mismo visitante abriendo el chat en dos
 * pestañas (o volviendo tras vencerse la cookie) genera una ficha por sesión. Recién cuando
 * deja su teléfono se puede saber que eran la misma — eso es lo que hace esto, llamado desde
 * `save_contact`. Sin esto, un prospecto aparece varias veces en /admin/leads.
 *
 * Se conserva **la ficha de la conversación en curso** y se absorben las viejas: son sesiones
 * abandonadas, y borrar la activa dejaría al resto del turno escribiendo sobre un id que ya
 * no existe. De las viejas se copia solo lo que la actual no tenga (un turno agendado, un
 * email), para no perder nada.
 *
 * Se limita a `web_demo` a propósito: un lead de WhatsApp con el mismo teléfono es una
 * conversación real, con su historial atado a ese número, y fusionarla sería corromperla.
 */
export async function mergeDuplicateWebLeads(
  supabase: SupabaseClient,
  tenantId: string,
  leadId: string,
  phone: string
): Promise<void> {
  const digits = phoneDigits(phone);
  if (digits.length < 6) return; // Muy corto para ser un teléfono: no arriesgar un merge.

  const { data, error } = await supabase
    .from("leads")
    .select("id, name, phone, email, property_id, appointment_date, appointment_time")
    .eq("tenant_id", tenantId)
    .eq("source", "web_demo");

  if (error || !data) return;

  const duplicates = data.filter(
    (row) => row.id !== leadId && row.phone && phoneDigits(row.phone as string) === digits
  );
  if (duplicates.length === 0) return;

  const current = data.find((row) => row.id === leadId);
  const patch: Record<string, unknown> = {};
  for (const field of ["name", "email", "property_id", "appointment_date", "appointment_time"] as const) {
    if (current?.[field]) continue;
    const donor = duplicates.find((row) => row[field]);
    if (donor) patch[field] = donor[field];
  }

  if (Object.keys(patch).length > 0) {
    await supabase.from("leads").update(patch).eq("id", leadId);
  }

  const { error: deleteError } = await supabase
    .from("leads")
    .delete()
    .in("id", duplicates.map((row) => row.id));

  if (deleteError) {
    console.error("mergeDuplicateWebLeads:", deleteError.message);
    return;
  }
  console.info(`mergeDuplicateWebLeads: ${duplicates.length} ficha(s) duplicada(s) unificadas en ${leadId}`);
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
