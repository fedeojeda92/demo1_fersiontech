import "server-only";
import { z } from "zod";
import type { FunctionDeclaration } from "@google/genai";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getPropertiesForTenant } from "@/lib/data/properties";
import { attachAppointmentToLead } from "@/lib/data/whatsappLeads";
import { createGoogleCalendarEvent, isGoogleCalendarConfigured } from "@/lib/googleCalendar";
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
    name: "schedule_visit",
    description:
      "Agenda una visita a una propiedad puntual del catálogo, en el calendario del agente. Usar solo después de que el interesado eligió una propiedad concreta y confirmó día y hora.",
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

  return properties
    .slice(0, 5)
    .map((p) => {
      const ambientes = p.bedrooms ? `${p.bedrooms} amb.` : null;
      const cochera = p.garage ? "con cochera" : null;
      const tour = p.hasVirtualTour ? "con tour 360°" : null;
      const detalles = [ambientes, `${p.area} m²`, cochera, tour].filter(Boolean).join(", ");
      return `- ID ${p.id}: ${p.zone}, ${p.type} en ${p.operation}, ${p.currency} ${p.price} (${detalles}). Fotos y tour: ${getSiteUrl()}/es/propiedades/${p.slug}`;
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
