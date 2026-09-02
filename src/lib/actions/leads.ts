"use server";

import { z } from "zod";
import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getTenantId } from "@/lib/tenant";
import { getCurrentAgent } from "@/lib/dal";
import { sendWhatsAppTemplate } from "@/lib/whatsapp";
import { createGoogleCalendarEvent, isGoogleCalendarConfigured } from "@/lib/googleCalendar";

const LeadSchema = z.object({
  name: z.string().min(2, "Ingresá tu nombre completo."),
  email: z.string().email("Ingresá un email válido."),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().optional(),
  propertyId: z.string().optional(),
  appointmentDate: z.string().optional(),
  appointmentTime: z.string().optional(),
});

export type LeadFormState = { success: boolean; error?: string } | undefined;

export async function createLeadAction(
  source: "turno" | "contacto",
  _prevState: LeadFormState,
  formData: FormData
): Promise<LeadFormState> {
  const parsed = LeadSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    subject: formData.get("subject") || undefined,
    message: formData.get("message") || undefined,
    propertyId: formData.get("propertyId") || undefined,
    appointmentDate: formData.get("appointmentDate") || undefined,
    appointmentTime: formData.get("appointmentTime") || undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Revisá los datos del formulario.",
    };
  }

  const data = parsed.data;

  if (source === "turno" && (!data.appointmentDate || !data.appointmentTime)) {
    return { success: false, error: "Elegí una fecha y un horario para agendar el turno." };
  }
  const message = data.subject ? `[${data.subject}] ${data.message ?? ""}`.trim() : data.message ?? null;

  const supabase = await createClient();
  const tenantId = await getTenantId();

  const { data: lead, error } = await supabase
    .from("leads")
    .insert({
      tenant_id: tenantId,
      property_id: data.propertyId || null,
      source,
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      message,
      appointment_date: data.appointmentDate || null,
      appointment_time: data.appointmentTime || null,
    })
    .select(
      "id, name, phone, email, property_id, appointment_date, appointment_time, properties(title, address)"
    )
    .single();

  if (error || !lead) {
    console.error("createLeadAction:", error?.message);
    return { success: false, error: "No pudimos guardar tu consulta. Probá de nuevo en unos minutos." };
  }

  after(async () => {
    await Promise.all([
      notifyAgentOfLead(lead, source),
      lead.phone ? sendWelcomeMessageToLead(lead) : Promise.resolve(),
      source === "turno" && lead.appointment_date && lead.appointment_time
        ? syncTurnoToGoogleCalendar(
            tenantId,
            lead as LeadWithAppointment,
            lead.appointment_date,
            lead.appointment_time
          )
        : Promise.resolve(),
    ]);
  });

  return { success: true };
}

export async function updateLeadStatusAction(
  locale: string,
  leadId: string,
  status: "nuevo" | "contactado" | "cerrado"
): Promise<void> {
  const agent = await getCurrentAgent(locale);
  const supabase = await createClient();

  await supabase
    .from("leads")
    .update({ status })
    .eq("id", leadId)
    .eq("tenant_id", agent.tenant_id);

  revalidatePath(`/${locale}/admin/leads`);
}

interface LeadNotificationPayload {
  id: string;
  name: string;
  phone: string | null;
  email: string;
}

async function notifyAgentOfLead(lead: LeadNotificationPayload, source: "turno" | "contacto") {
  const agentNumber = process.env.WHATSAPP_AGENT_NUMBER;
  const template = process.env.WHATSAPP_AGENT_TEMPLATE;
  if (!agentNumber || !template) return;

  await sendWhatsAppTemplate({
    to: agentNumber,
    templateName: template,
    bodyParams: {
      nombre: lead.name,
      tipo: source === "turno" ? "turno" : "contacto",
      contacto: lead.phone ?? lead.email,
    },
  });
}

async function sendWelcomeMessageToLead(lead: LeadNotificationPayload) {
  const template = process.env.WHATSAPP_WELCOME_TEMPLATE;
  if (!template || !lead.phone) return;

  await sendWhatsAppTemplate({
    to: lead.phone,
    templateName: template,
    bodyParams: { nombre: lead.name },
  });
}

interface LeadWithAppointment extends LeadNotificationPayload {
  properties: { title: { es?: string } | null; address: string | null } | { title: { es?: string } | null; address: string | null }[] | null;
}

/**
 * Crea el evento en el Google Calendar de cada agente del tenant que haya conectado su cuenta
 * (ver /admin/agenda). Best-effort: si nadie conectó Google Calendar todavía, o falla la
 * llamada a la API, no rompe nada — el lead ya quedó guardado en Supabase antes de esto.
 */
async function syncTurnoToGoogleCalendar(
  tenantId: string,
  lead: LeadWithAppointment,
  appointmentDate: string,
  appointmentTime: string
) {
  if (!isGoogleCalendarConfigured()) return;

  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const { data: agents } = await supabase
    .from("agents")
    .select("google_refresh_token")
    .eq("tenant_id", tenantId)
    .not("google_refresh_token", "is", null);

  if (!agents || agents.length === 0) return;

  const property = Array.isArray(lead.properties) ? lead.properties[0] : lead.properties;
  const summary = `Turno: ${lead.name}${property?.title?.es ? ` — ${property.title.es}` : ""}`;
  const description = `Tel: ${lead.phone ?? "-"}\nEmail: ${lead.email}`;

  await Promise.all(
    agents.map((a) =>
      createGoogleCalendarEvent({
        refreshToken: a.google_refresh_token as string,
        summary,
        description,
        location: property?.address ?? undefined,
        date: appointmentDate,
        time: appointmentTime,
      })
    )
  );
}
