import "server-only";
import { z } from "zod";
import type { FunctionDeclaration } from "@google/genai";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getPropertiesForTenant } from "@/lib/data/properties";
import {
  attachAppointmentToLead,
  mergeDuplicateWebLeads,
  rememberLeadProperty,
  updateLeadContact,
  updateLeadProfile,
} from "@/lib/data/whatsappLeads";
import { LEAD_TEMPERATURES, type LeadQualification } from "@/lib/leads";
import { createGoogleCalendarEvent, isGoogleCalendarConfigured } from "@/lib/googleCalendar";
import { getAvailability, VISIT_DURATION_MINUTES, type Availability } from "@/lib/availability";
import { sendWhatsAppTemplate } from "@/lib/whatsapp";

export const SearchPropertiesInput = z.object({
  operation: z.enum(["venta", "alquiler"]).optional(),
  type: z.enum(["departamento", "casa", "ph", "terreno", "oficina", "local"]).optional(),
  zone: z.string().optional(),
  minRooms: z.number().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  query: z.string().optional(),
});

export const ScheduleVisitInput = z.object({
  propertyId: z.string(),
  date: z.string().describe("Fecha en formato YYYY-MM-DD"),
  time: z.string().describe("Hora en formato HH:MM"),
});

export const CheckAvailabilityInput = z.object({
  date: z.string().describe("Fecha en formato YYYY-MM-DD"),
});

export const EscalateToHumanInput = z.object({
  reason: z.string().describe("Por qué se deriva la conversación a un humano"),
});

export const SaveContactInput = z.object({
  name: z.string().describe("Nombre del interesado, tal como lo dijo"),
  phone: z.string().optional().describe("Teléfono de contacto, si lo dio"),
  email: z.string().optional().describe("Email de contacto, si lo dio"),
});

export const UpdateLeadProfileInput = z.object({
  need: z.string().optional(),
  household: z.string().optional(),
  must_haves: z.string().optional(),
  timeline: z.string().optional(),
  budget: z.string().optional(),
  payment: z.string().optional(),
  decision_makers: z.string().optional(),
  opportunity: z.string().optional(),
  temperature: z.enum(LEAD_TEMPERATURES).optional(),
  summary: z.string().optional(),
  next_step: z.string().optional(),
});

export const AGENT_TOOLS: FunctionDeclaration[] = [
  {
    name: "search_properties",
    description:
      "Busca propiedades reales en el catálogo de la inmobiliaria según zona, tipo de operación, tipo de propiedad, ambientes o presupuesto. Usar antes de afirmar cualquier dato de una propiedad — nunca inventar resultados.",
    parametersJsonSchema: {
      type: "object",
      properties: {
        operation: { type: "string", enum: ["venta", "alquiler"] },
        type: { type: "string", enum: ["departamento", "casa", "ph", "terreno", "oficina", "local"] },
        zone: { type: "string" },
        minRooms: { type: "number" },
        minPrice: { type: "number" },
        maxPrice: { type: "number" },
        query: { type: "string", description: "Búsqueda libre por zona, dirección o título" },
      },
    },
  },
  {
    name: "check_availability",
    description:
      "Devuelve los horarios libres y ocupados para visitas en una fecha, según el horario de atención, los turnos ya agendados y el calendario del agente. Usar siempre antes de proponer o confirmar un horario de visita.",
    parametersJsonSchema: {
      type: "object",
      properties: {
        date: { type: "string", description: "Fecha en formato YYYY-MM-DD" },
      },
      required: ["date"],
    },
  },
  {
    name: "schedule_visit",
    description:
      "Agenda una visita a una propiedad puntual del catálogo, en el calendario del agente. Usar solo después de que el interesado eligió una propiedad concreta y confirmó un día y hora que check_availability devolvió como libre. Si el horario está ocupado, la herramienta no agenda y devuelve alternativas. En el chat de la web hay que haber guardado antes el contacto con save_contact: si no, la herramienta rechaza el pedido.",
    parametersJsonSchema: {
      type: "object",
      properties: {
        propertyId: { type: "string", description: "ID de la propiedad (obtenido de search_properties)" },
        date: { type: "string", description: "Fecha en formato YYYY-MM-DD" },
        time: { type: "string", description: "Hora en formato HH:MM" },
      },
      required: ["propertyId", "date", "time"],
    },
  },
  {
    name: "save_contact",
    description:
      "Guarda el nombre y el contacto (teléfono o email) del interesado en su ficha. Usar SOLO en el chat de la web, apenas el interesado los dé — en WhatsApp el teléfono ya se conoce y no hace falta. Pedirlos antes de agendar una visita: sin un contacto, el equipo no tiene cómo comunicarse con él.",
    parametersJsonSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Nombre del interesado" },
        phone: { type: "string", description: "Teléfono de contacto" },
        email: { type: "string", description: "Email de contacto" },
      },
      required: ["name"],
    },
  },
  {
    name: "update_lead_profile",
    description:
      "Guarda en la ficha del cliente lo que se va sabiendo de su búsqueda, para que el asesor humano lo tenga calificado en el panel. Usar en el mismo turno en que el cliente cuenta algo nuevo, sin decírselo. Mandar solo los campos nuevos o que cambiaron: lo anterior se conserva. Escribir cada campo en una frase corta y concreta.",
    parametersJsonSchema: {
      type: "object",
      properties: {
        need: { type: "string", description: "Qué busca y para qué (ej: 'casa para vivir todo el año')" },
        household: { type: "string", description: "Quiénes van a vivir (ej: 'familia de 4, dos chicos')" },
        must_haves: { type: "string", description: "Lo que no puede faltar (ej: '3 dormitorios, jardín')" },
        timeline: { type: "string", description: "Para cuándo (ej: 'mudarse antes de marzo')" },
        budget: { type: "string", description: "Presupuesto, con moneda (ej: 'hasta USD 180.000')" },
        payment: { type: "string", description: "Cómo paga (ej: 'USD 80.000 + venta de depto en Lanús')" },
        decision_makers: { type: "string", description: "Quién decide (ej: 'él y su esposa')" },
        opportunity: { type: "string", description: "Oportunidad para la inmobiliaria (ej: 'captación: depto en Lanús para tasar')" },
        temperature: {
          type: "string",
          enum: [...LEAD_TEMPERATURES],
          description: "caliente: necesidad clara + 3 meses o menos + forma de pago definida; tibio: falta alguna; frio: solo mira o no puede pagar",
        },
        summary: { type: "string", description: "Una o dos frases para entender al cliente de un vistazo" },
        next_step: { type: "string", description: "Qué conviene hacer con este cliente" },
      },
    },
  },
  {
    name: "escalate_to_human",
    description:
      "Deriva la conversación a un agente humano (asesoría legal/impositiva, negociación de precio, pedido explícito de hablar con una persona, o cualquier caso fuera de lo que el agente puede resolver). Avisa al agente humano por WhatsApp.",
    parametersJsonSchema: {
      type: "object",
      properties: {
        reason: { type: "string", description: "Por qué se deriva la conversación" },
      },
      required: ["reason"],
    },
  },
];

function getSiteUrl(): string {
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return "http://localhost:3000";
}

/**
 * De dónde viene la conversación. El agente es el mismo en los dos canales; lo que cambia
 * es qué efectos se permiten:
 * - "whatsapp": conversación real, agenda en el Google Calendar del agente.
 * - "web": chat abierto de la demo (cualquiera puede entrar). Guarda el lead y el turno
 *   para que se vean en /admin/leads, y si hay un calendario conectado agenda ahí también,
 *   marcado "(demo web)" — es la forma de mostrarle la integración a un prospecto. Antes se
 *   salteaba para no llenar la agenda de turnos falsos; se decidió priorizar la demo.
 */
export type AgentChannel = "whatsapp" | "web";

export interface ToolContext {
  supabase: SupabaseClient;
  tenantId: string;
  phone: string;
  channel: AgentChannel;
  /**
   * Devuelve el id del lead, creándolo si todavía no existe.
   *
   * Es perezoso por el chat web, que es público: si el lead se creara al primer mensaje,
   * cada visitante que escribe "hola" y se va dejaría una fila vacía en `leads`. Así la
   * ficha nace recién cuando hay algo que registrar — un contacto, una propiedad concreta
   * o un turno. En WhatsApp no cambia nada: ahí el lead ya se creó al recibir el mensaje
   * (quien escribe a un WhatsApp comercial ya es un lead) y esto solo devuelve su id.
   */
  ensureLeadId: () => Promise<string>;
}

export async function executeTool(name: string, input: unknown, ctx: ToolContext): Promise<string> {
  switch (name) {
    case "search_properties":
      return executeSearchProperties(SearchPropertiesInput.parse(input), ctx);
    case "check_availability":
      return executeCheckAvailability(CheckAvailabilityInput.parse(input), ctx);
    case "save_contact":
      return executeSaveContact(SaveContactInput.parse(input), ctx);
    case "schedule_visit":
      return executeScheduleVisit(ScheduleVisitInput.parse(input), ctx);
    case "update_lead_profile":
      return executeUpdateLeadProfile(UpdateLeadProfileInput.parse(input), ctx);
    case "escalate_to_human":
      return executeEscalateToHuman(EscalateToHumanInput.parse(input), ctx);
    default:
      throw new Error(`Herramienta desconocida: ${name}`);
  }
}

async function executeSearchProperties(
  input: z.infer<typeof SearchPropertiesInput>,
  ctx: ToolContext
): Promise<string> {
  const properties = await getPropertiesForTenant(ctx.supabase, ctx.tenantId, input);

  if (properties.length === 0) {
    return "No se encontraron propiedades que coincidan con esa búsqueda en el catálogo.";
  }

  if (properties.length === 1) {
    await rememberLeadProperty(ctx.supabase, await ctx.ensureLeadId(), properties[0].id);
  }

  return properties
    .slice(0, 5)
    .map((p) => {
      const caracteristicas = [
        // bedrooms son dormitorios; los ambientes suman el living. Antes se le pasaba
        // "3 amb." por una casa de 3 dormitorios, y el agente contradecía al cliente.
        p.bedrooms
          ? `${p.bedrooms + 1} ambientes (${p.bedrooms} dormitorios)`
          : p.type === "departamento" ? "monoambiente" : null,
        p.bathrooms ? `${p.bathrooms} baños` : null,
        `${p.area} m²`,
        p.garage ? `${p.garage} cochera(s)` : null,
        ...p.features,
      ]
        .filter(Boolean)
        .join(", ");
      const enLaWeb = p.hasVirtualTour ? "fotos y tour virtual 360°" : "fotos";
      return [
        `- ID ${p.id}: ${p.type} en ${p.operation} en ${p.zone}, ${p.currency} ${p.price}`,
        `  Características de la propiedad: ${caracteristicas}`,
        `  Disponible en la web (no es una característica de la propiedad): ${enLaWeb} en ${getSiteUrl()}/es/propiedades/${p.slug}`,
      ].join("\n");
    })
    .join("\n");
}

/**
 * ¿Sabemos ya cómo contactar a este interesado?
 *
 * En el chat web `phone` arranca siendo el id de sesión (`web-...`), que no es un contacto:
 * cuenta solo si el visitante dejó un teléfono de verdad o un email. Si el lead todavía no
 * existe tampoco hay contacto, y no se lo crea para averiguarlo.
 */
async function hasRealContact(ctx: ToolContext): Promise<boolean> {
  const leadId = await ctx.ensureLeadId();
  const { data } = await ctx.supabase.from("leads").select("phone, email").eq("id", leadId).maybeSingle();
  if (!data) return false;

  const phone = (data.phone as string | null)?.trim();
  const email = (data.email as string | null)?.trim();
  return Boolean((phone && !phone.startsWith("web-")) || email);
}

async function executeScheduleVisit(
  input: z.infer<typeof ScheduleVisitInput>,
  ctx: ToolContext
): Promise<string> {
  const { data: property, error } = await ctx.supabase
    .from("properties")
    .select("title, address")
    .eq("id", input.propertyId)
    .eq("tenant_id", ctx.tenantId)
    .maybeSingle();

  if (error || !property) {
    return "No encontré esa propiedad en el catálogo, no se pudo agendar la visita.";
  }

  // En el chat web no se sabe quién es el interesado hasta que lo diga: sin contacto, el
  // turno queda imposible de confirmar o reprogramar. El prompt ya le pide al modelo que
  // use save_contact antes de agendar, pero un prompt es una sugerencia y no siempre la
  // cumple — el 2026-09-23 apareció en producción un turno sin nombre ni teléfono. Esto lo
  // hace una regla en vez de un pedido: la herramienta no agenda y le dice qué le falta.
  if (ctx.channel === "web" && !(await hasRealContact(ctx))) {
    return "No se agendó la visita: todavía no tenemos los datos del interesado. Pedile el nombre y un teléfono o email, guardalos con save_contact, y recién ahí volvé a intentar agendar.";
  }

  // En WhatsApp el calendario es obligatorio: es una visita real. En la web se agenda en el
  // calendario si está conectado (para mostrar la integración en la demo), pero si no lo está
  // el turno igual queda registrado en el lead.
  if (ctx.channel === "whatsapp" && !isGoogleCalendarConfigured()) {
    return "El calendario del agente no está configurado todavía — avisale que confirme la visita manualmente.";
  }

  const { data: agents } = await ctx.supabase
    .from("agents")
    .select("google_refresh_token")
    .eq("tenant_id", ctx.tenantId)
    .not("google_refresh_token", "is", null);

  if (ctx.channel === "whatsapp" && (!agents || agents.length === 0)) {
    return "Ningún agente tiene el calendario conectado todavía — avisale que confirme la visita manualmente.";
  }

  const availability = await getAvailability(ctx.supabase, ctx.tenantId, input.date);
  if (!availability.ok) return `No se agendó la visita: ${describeUnavailableDate(availability.reason)}`;
  const free = availability.slots.filter((s) => s.available).map((s) => s.time);
  if (!free.includes(input.time)) {
    const alternativas = free.length
      ? `Horarios libres ese día: ${free.join(", ")}.`
      : "Ese día no quedan horarios libres, proponé otro día.";
    return `No se agendó la visita: el horario ${input.time} del ${input.date} no está disponible. ${alternativas}`;
  }

  const title = (property.title as { es?: string })?.es ?? "Propiedad";
  const leadId = await ctx.ensureLeadId();

  if (isGoogleCalendarConfigured() && agents && agents.length > 0) {
    const event = await describeVisitEvent(ctx, leadId, title);
    await Promise.all(
      agents.map((a) =>
        createGoogleCalendarEvent({
          refreshToken: a.google_refresh_token as string,
          summary: event.summary,
          description: event.description,
          location: property.address as string,
          date: input.date,
          time: input.time,
        })
      )
    );
  }

  await attachAppointmentToLead(ctx.supabase, leadId, input.propertyId, input.date, input.time);

  return `Visita agendada para el ${input.date} a las ${input.time}.`;
}

/**
 * Título y descripción del evento de Google Calendar: que el asesor sepa a quién va a ver y
 * qué busca sin abrir el panel. Lo de la web se marca como demo, porque cualquiera puede
 * escribir en ese chat.
 */
async function describeVisitEvent(
  ctx: ToolContext,
  leadId: string,
  propertyTitle: string
): Promise<{ summary: string; description: string }> {
  const { data: lead } = await ctx.supabase
    .from("leads")
    .select("name, phone, email, qualification")
    .eq("id", leadId)
    .maybeSingle();

  const q = (lead?.qualification as LeadQualification | null) ?? {};
  const phone = (lead?.phone as string | null)?.startsWith("web-") ? null : lead?.phone;
  const name = (lead?.name as string | undefined) ?? "Cliente";
  const lines = [
    `Cliente: ${name}`,
    [phone && `Tel: ${phone}`, lead?.email && `Email: ${lead.email}`].filter(Boolean).join(" · ") || null,
    q.need && `Busca: ${q.need}`,
    q.timeline && `Plazo: ${q.timeline}`,
    q.payment && `Forma de pago: ${q.payment}`,
    q.decision_makers && `Deciden: ${q.decision_makers}`,
    q.opportunity && `Oportunidad: ${q.opportunity}`,
    q.summary && `Resumen: ${q.summary}`,
    `Agendado por el agente (${ctx.channel === "web" ? "chat web" : "WhatsApp"}).`,
  ].filter(Boolean);

  return {
    summary: `Visita · ${propertyTitle} · ${name}${ctx.channel === "web" ? " (demo web)" : ""}`,
    description: lines.join("\n"),
  };
}

function describeUnavailableDate(reason: Extract<Availability, { ok: false }>["reason"]): string {
  switch (reason) {
    case "invalid_date":
      return "la fecha no es válida, pedile al interesado que la confirme.";
    case "closed":
      return "ese día la inmobiliaria no atiende (domingo). Proponé otro día.";
    case "past":
      return "esa fecha ya pasó. Proponé una fecha futura.";
  }
}

async function executeCheckAvailability(
  input: z.infer<typeof CheckAvailabilityInput>,
  ctx: ToolContext
): Promise<string> {
  const availability = await getAvailability(ctx.supabase, ctx.tenantId, input.date);
  if (!availability.ok) return describeUnavailableDate(availability.reason);

  const libres = availability.slots.filter((s) => s.available).map((s) => s.time);
  const ocupados = availability.slots.filter((s) => !s.available).map((s) => s.time);
  return `Disponibilidad para visitas el ${input.date} (turnos de ${VISIT_DURATION_MINUTES} min): libres ${libres.join(", ") || "ninguno"}; ocupados ${ocupados.join(", ") || "ninguno"}.`;
}

async function executeSaveContact(
  input: z.infer<typeof SaveContactInput>,
  ctx: ToolContext
): Promise<string> {
  const leadId = await ctx.ensureLeadId();
  await updateLeadContact(ctx.supabase, leadId, {
    name: input.name,
    phone: input.phone,
    email: input.email,
  });

  // El teléfono es lo primero que permite reconocer que dos sesiones del chat eran la misma
  // persona (la sesión va por cookie: dos pestañas = dos fichas). Ver mergeDuplicateWebLeads.
  if (ctx.channel === "web" && input.phone) {
    await mergeDuplicateWebLeads(ctx.supabase, ctx.tenantId, leadId, input.phone);
  }

  return "Datos de contacto guardados.";
}

async function executeUpdateLeadProfile(
  input: z.infer<typeof UpdateLeadProfileInput>,
  ctx: ToolContext
): Promise<string> {
  await updateLeadProfile(ctx.supabase, await ctx.ensureLeadId(), input);
  return "Ficha del cliente actualizada.";
}

async function executeEscalateToHuman(
  input: z.infer<typeof EscalateToHumanInput>,
  ctx: ToolContext
): Promise<string> {
  const agentNumber = process.env.WHATSAPP_AGENT_NUMBER;
  const template = process.env.WHATSAPP_AGENT_TEMPLATE;

  if (agentNumber && template) {
    // En el chat web el lead ya tiene nombre/teléfono si el visitante los dio (save_contact);
    // ctx.phone es solo el id de sesión, que no le sirve de nada al humano.
    const { data: lead } = await ctx.supabase
      .from("leads")
      .select("name, phone")
      .eq("id", await ctx.ensureLeadId())
      .maybeSingle();

    const quien =
      ctx.channel === "web"
        ? [lead?.name, lead?.phone].filter(Boolean).join(" · ") || "visitante de la web (sin datos)"
        : ctx.phone;

    await sendWhatsAppTemplate({
      to: agentNumber,
      templateName: template,
      bodyParams: { nombre: quien, tipo: ctx.channel === "web" ? "chat web" : "whatsapp", contacto: input.reason },
    });
  }

  return "Se avisó a un asesor humano, que va a continuar la conversación a la brevedad.";
}
