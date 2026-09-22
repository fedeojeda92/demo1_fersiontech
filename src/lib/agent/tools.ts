import "server-only";
import { z } from "zod";
import type { FunctionDeclaration } from "@google/genai";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getPropertiesForTenant } from "@/lib/data/properties";
import { attachAppointmentToLead, rememberLeadProperty } from "@/lib/data/whatsappLeads";
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
      "Agenda una visita a una propiedad puntual del catálogo, en el calendario del agente. Usar solo después de que el interesado eligió una propiedad concreta y confirmó un día y hora que check_availability devolvió como libre. Si el horario está ocupado, la herramienta no agenda y devuelve alternativas.",
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

export interface ToolContext {
  supabase: SupabaseClient;
  tenantId: string;
  phone: string;
  leadId: string;
}

export async function executeTool(name: string, input: unknown, ctx: ToolContext): Promise<string> {
  switch (name) {
    case "search_properties":
      return executeSearchProperties(SearchPropertiesInput.parse(input), ctx);
    case "check_availability":
      return executeCheckAvailability(CheckAvailabilityInput.parse(input), ctx);
    case "schedule_visit":
      return executeScheduleVisit(ScheduleVisitInput.parse(input), ctx);
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
    await rememberLeadProperty(ctx.supabase, ctx.leadId, properties[0].id);
  }

  return properties
    .slice(0, 5)
    .map((p) => {
      const caracteristicas = [
        p.bedrooms ? `${p.bedrooms} amb.` : null,
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

  if (!isGoogleCalendarConfigured()) {
    return "El calendario del agente no está configurado todavía — avisale que confirme la visita manualmente.";
  }

  const { data: agents } = await ctx.supabase
    .from("agents")
    .select("google_refresh_token")
    .eq("tenant_id", ctx.tenantId)
    .not("google_refresh_token", "is", null);

  if (!agents || agents.length === 0) {
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
  await Promise.all(
    agents.map((a) =>
      createGoogleCalendarEvent({
        refreshToken: a.google_refresh_token as string,
        summary: `Visita WhatsApp: ${title}`,
        description: `Coordinado por el agente conversacional. Tel: ${ctx.phone}`,
        location: property.address as string,
        date: input.date,
        time: input.time,
      })
    )
  );

  await attachAppointmentToLead(ctx.supabase, ctx.leadId, input.propertyId, input.date, input.time);

  return `Visita agendada para el ${input.date} a las ${input.time}.`;
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

async function executeEscalateToHuman(
  input: z.infer<typeof EscalateToHumanInput>,
  ctx: ToolContext
): Promise<string> {
  const agentNumber = process.env.WHATSAPP_AGENT_NUMBER;
  const template = process.env.WHATSAPP_AGENT_TEMPLATE;

  if (agentNumber && template) {
    await sendWhatsAppTemplate({
      to: agentNumber,
      templateName: template,
      bodyParams: { nombre: ctx.phone, tipo: "whatsapp", contacto: input.reason },
    });
  }

  return "Se avisó a un asesor humano, que va a continuar la conversación a la brevedad.";
}
