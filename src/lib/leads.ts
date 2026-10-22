/**
 * Etapas del embudo, temperatura y ficha de calificación de un lead. Compartido entre el
 * agente (que califica y mueve el lead), las server actions y el panel (cliente y servidor),
 * por eso no importa nada de servidor.
 */

export const LEAD_STATUSES = ["nuevo", "calificado", "visita", "negociacion", "cerrado", "perdido"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  nuevo: "Nuevo",
  calificado: "Calificado",
  visita: "Visita agendada",
  negociacion: "Negociación",
  cerrado: "Cerrado",
  perdido: "Perdido",
};

export const LEAD_TEMPERATURES = ["caliente", "tibio", "frio"] as const;
export type LeadTemperature = (typeof LEAD_TEMPERATURES)[number];

export const LEAD_TEMPERATURE_LABELS: Record<LeadTemperature, string> = {
  caliente: "🔥 Caliente",
  tibio: "Tibio",
  frio: "Frío",
};

/** Lo que el agente va averiguando del cliente (tool update_lead_profile). Todo opcional. */
export interface LeadQualification {
  need?: string;
  household?: string;
  must_haves?: string;
  timeline?: string;
  budget?: string;
  payment?: string;
  decision_makers?: string;
  opportunity?: string;
  summary?: string;
  next_step?: string;
}

export const QUALIFICATION_FIELDS = [
  "need",
  "household",
  "must_haves",
  "timeline",
  "budget",
  "payment",
  "decision_makers",
  "opportunity",
  "summary",
  "next_step",
] as const satisfies readonly (keyof LeadQualification)[];

export const LEAD_SOURCE_LABELS: Record<string, string> = {
  turno: "Turno web",
  contacto: "Formulario de contacto",
  whatsapp: "WhatsApp",
  web_demo: "Chat web",
};
