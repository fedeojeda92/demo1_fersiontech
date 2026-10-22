import { LEAD_TEMPERATURE_LABELS, type LeadTemperature } from "@/lib/leads";

const STYLES: Record<LeadTemperature, string> = {
  caliente: "bg-ember/15 text-ember border-ember/30",
  tibio: "bg-champagne/10 text-champagne border-champagne/25",
  frio: "bg-sky-400/10 text-sky-300 border-sky-400/25",
};

/** Temperatura del lead según la calificación del agente; nada si todavía no se calificó. */
export default function TemperatureBadge({ temperature, size = "sm" }: { temperature: string | null; size?: "sm" | "md" }) {
  if (!temperature || !(temperature in STYLES)) return null;
  const t = temperature as LeadTemperature;
  return (
    <span
      className={`inline-block rounded-full border font-medium whitespace-nowrap ${STYLES[t]} ${
        size === "md" ? "text-sm px-3.5 py-1.5" : "text-xs px-2.5 py-1"
      }`}
    >
      {LEAD_TEMPERATURE_LABELS[t]}
    </span>
  );
}
