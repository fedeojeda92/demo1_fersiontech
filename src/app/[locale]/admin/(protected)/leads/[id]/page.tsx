import { notFound } from "next/navigation";
import { ArrowLeft, CalendarCheck, Lightbulb, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getTenantId } from "@/lib/tenant";
import { getCurrentAgent } from "@/lib/dal";
import LeadStatusSelect from "@/components/admin/LeadStatusSelect";
import TemperatureBadge from "@/components/admin/TemperatureBadge";
import { LEAD_SOURCE_LABELS, type LeadQualification } from "@/lib/leads";

function Field({ label, value, wide }: { label: string; value?: string | null; wide?: boolean }) {
  return (
    <div className={`rounded-xl bg-ivory/4 border border-ivory/10 px-4 py-3 ${wide ? "md:col-span-2" : ""}`}>
      <p className="text-[11px] uppercase tracking-wider text-champagne/80">{label}</p>
      <p className={`mt-1 text-sm ${value ? "text-ivory" : "text-ivory/30"}`}>{value || "Sin datos todavía"}</p>
    </div>
  );
}

export default async function AdminLeadDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  await getCurrentAgent(locale);
  const supabase = await createClient();
  const tenantId = await getTenantId();

  const { data: lead } = await supabase
    .from("leads")
    .select(
      "id, name, email, phone, source, status, temperature, qualification, session_id, message, appointment_date, appointment_time, created_at, properties(title, address)"
    )
    .eq("tenant_id", tenantId)
    .eq("id", id)
    .maybeSingle();

  if (!lead) notFound();

  const q = (lead.qualification as LeadQualification | null) ?? {};
  const property = (Array.isArray(lead.properties) ? lead.properties[0] : lead.properties) as
    | { title?: { es?: string }; address?: string }
    | null;
  const phone = lead.phone?.startsWith("web-") ? null : lead.phone;

  // La conversación vive en whatsapp_messages, que no tiene policies para el cliente con
  // cookies: se lee con service role, recién después de verificar al agente (arriba).
  const conversationKey = lead.source === "web_demo" ? lead.session_id ?? lead.phone : lead.phone;
  const { data: messages } = conversationKey
    ? await createAdminClient()
        .from("whatsapp_messages")
        .select("id, role, content, created_at")
        .eq("tenant_id", tenantId)
        .eq("phone", conversationKey)
        .order("created_at", { ascending: true })
        .limit(200)
    : { data: [] };

  const fmtTime = (iso: string) =>
    new Date(iso).toLocaleString("es-AR", {
      timeZone: "America/Argentina/Buenos_Aires",
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="p-8 max-w-5xl">
      <Link href="/admin/leads" className="inline-flex items-center gap-1.5 text-sm text-ivory/50 hover:text-champagne mb-6">
        <ArrowLeft size={15} /> Volver a leads
      </Link>

      <div className="glass-card rounded-2xl p-6 md:p-8">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-champagne-light to-champagne-dark text-obsidian font-heading text-2xl flex items-center justify-center">
            {lead.name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="flex-1 min-w-48">
            <h1 className="font-heading text-3xl text-ivory">{lead.name}</h1>
            <p className="text-ivory/50 text-sm mt-1">
              {LEAD_SOURCE_LABELS[lead.source] ?? lead.source} · {fmtTime(lead.created_at)}
              {[phone, lead.email].filter(Boolean).length > 0 && ` · ${[phone, lead.email].filter(Boolean).join(" · ")}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <TemperatureBadge temperature={lead.temperature} size="md" />
            <LeadStatusSelect locale={locale} leadId={lead.id} status={lead.status} />
          </div>
        </div>

        {q.summary && <p className="mt-6 text-ivory/80 leading-relaxed border-l-2 border-champagne/60 pl-4">{q.summary}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
          <Field label="Propiedad" value={property?.title?.es} wide />
          <Field label="Necesidad" value={q.need ?? lead.message} />
          <Field label="Quiénes van a vivir" value={q.household} />
          <Field label="Plazo" value={q.timeline} />
          <Field label="Presupuesto" value={q.budget} />
          <Field label="Forma de pago" value={q.payment} />
          <Field label="Deciden" value={q.decision_makers} />
          <Field label="No puede faltar" value={q.must_haves} wide />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
          <div className="rounded-xl px-4 py-3 border border-emerald-500/25 bg-emerald-500/10">
            <p className="text-[11px] uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <CalendarCheck size={13} /> Visita
            </p>
            <p className={`mt-1 text-sm ${lead.appointment_date ? "text-ivory" : "text-ivory/30"}`}>
              {lead.appointment_date
                ? `${lead.appointment_date} · ${lead.appointment_time ?? ""}${property?.address ? ` · ${property.address}` : ""}`
                : "Sin visita agendada"}
            </p>
          </div>
          <div className="rounded-xl px-4 py-3 border border-champagne/30 bg-champagne/10">
            <p className="text-[11px] uppercase tracking-wider text-champagne flex items-center gap-1.5">
              <Lightbulb size={13} /> Oportunidad
            </p>
            <p className={`mt-1 text-sm ${q.opportunity ? "text-ivory" : "text-ivory/30"}`}>{q.opportunity || "Ninguna detectada"}</p>
          </div>
          <div className="rounded-xl px-4 py-3 border border-ivory/15 bg-ivory/6">
            <p className="text-[11px] uppercase tracking-wider text-ivory/60 flex items-center gap-1.5">
              <ArrowRight size={13} /> Próximo paso sugerido
            </p>
            <p className={`mt-1 text-sm ${q.next_step ? "text-ivory" : "text-ivory/30"}`}>{q.next_step || "Sin datos todavía"}</p>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6 md:p-8 mt-6">
        <h2 className="font-heading text-xl text-ivory mb-4">Conversación</h2>
        {messages && messages.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                  m.role === "user"
                    ? "self-end bg-champagne/15 text-ivory rounded-tr-sm"
                    : "self-start bg-ivory/6 text-ivory/90 rounded-tl-sm"
                }`}
              >
                {m.content}
                <span className="block text-right text-[11px] text-ivory/40 mt-1">
                  {m.role === "user" ? "Cliente" : "Agente"} · {fmtTime(m.created_at)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-ivory/40 text-sm">
            {lead.source === "whatsapp" || lead.source === "web_demo"
              ? "No hay mensajes guardados para este lead."
              : "Este lead llegó por un formulario de la web, no por una conversación."}
          </p>
        )}
      </div>
    </div>
  );
}
