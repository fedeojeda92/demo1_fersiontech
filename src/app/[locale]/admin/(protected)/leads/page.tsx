import { createClient } from "@/lib/supabase/server";
import { getTenantId } from "@/lib/tenant";
import { Link } from "@/i18n/navigation";
import LeadStatusSelect from "@/components/admin/LeadStatusSelect";
import TemperatureBadge from "@/components/admin/TemperatureBadge";
import {
  LEAD_SOURCE_LABELS,
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
  type LeadQualification,
  type LeadStatus,
} from "@/lib/leads";

/** Etapas que se muestran en el embudo de arriba (perdido no suma: se ve en la tabla). */
const FUNNEL: LeadStatus[] = ["nuevo", "calificado", "visita", "negociacion", "cerrado"];

export default async function AdminLeadsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const tenantId = await getTenantId();

  const { data: leads } = await supabase
    .from("leads")
    .select(
      "id, name, email, phone, source, status, temperature, qualification, message, appointment_date, appointment_time, created_at, properties(title)"
    )
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });

  const counts = Object.fromEntries(LEAD_STATUSES.map((s) => [s, 0])) as Record<LeadStatus, number>;
  let hot = 0;
  for (const lead of leads ?? []) {
    if (lead.status in counts) counts[lead.status as LeadStatus]++;
    if (lead.temperature === "caliente") hot++;
  }

  return (
    <div className="p-8">
      <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
        <h1 className="font-heading text-3xl text-ivory">Leads</h1>
        <p className="text-ivory/40 text-sm">
          {leads?.length ?? 0} en total · <span className="text-ember">{hot} calientes</span>
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        {FUNNEL.map((s, i) => (
          <div key={s} className="glass-card rounded-2xl px-5 py-4 relative">
            <p className="text-ivory/40 text-xs uppercase tracking-wider">
              {i + 1}. {LEAD_STATUS_LABELS[s]}
            </p>
            <p className="font-heading text-3xl text-ivory mt-1">{counts[s]}</p>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-2xl overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-ivory/40 border-b border-ivory/10">
              <th className="px-6 py-3 font-medium">Cliente</th>
              <th className="px-6 py-3 font-medium">Temperatura</th>
              <th className="px-6 py-3 font-medium">Busca</th>
              <th className="px-6 py-3 font-medium">Propiedad</th>
              <th className="px-6 py-3 font-medium">Fecha</th>
              <th className="px-6 py-3 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {(leads ?? []).map((lead) => {
              const propertyTitle = Array.isArray(lead.properties)
                ? (lead.properties[0] as { title?: { es?: string } } | undefined)?.title?.es
                : (lead.properties as { title?: { es?: string } } | null)?.title?.es;
              const q = (lead.qualification as LeadQualification | null) ?? {};
              const contact = [lead.email, lead.phone?.startsWith("web-") ? null : lead.phone].filter(Boolean).join(" · ");

              return (
                <tr key={lead.id} className="border-b border-ivory/5 last:border-0 align-top hover:bg-ivory/2">
                  <td className="px-6 py-3">
                    <Link href={`/admin/leads/${lead.id}`} className="text-ivory hover:text-champagne font-medium">
                      {lead.name}
                    </Link>
                    <p className="text-ivory/40 text-xs mt-0.5">
                      {LEAD_SOURCE_LABELS[lead.source] ?? lead.source}
                      {contact && ` · ${contact}`}
                    </p>
                  </td>
                  <td className="px-6 py-3">
                    <TemperatureBadge temperature={lead.temperature} />
                    {!lead.temperature && <span className="text-ivory/30 text-xs">Sin calificar</span>}
                  </td>
                  <td className="px-6 py-3 text-ivory/70 max-w-xs">
                    {q.need ?? lead.message ?? <span className="text-ivory/30">—</span>}
                    {q.timeline && <p className="text-ivory/40 text-xs mt-0.5">{q.timeline}</p>}
                  </td>
                  <td className="px-6 py-3 text-ivory/60">{propertyTitle ?? "—"}</td>
                  <td className="px-6 py-3 text-ivory/60 whitespace-nowrap">
                    {new Date(lead.created_at).toLocaleDateString("es-AR")}
                    {lead.appointment_date && (
                      <p className="text-champagne/80 text-xs">
                        Visita: {lead.appointment_date} {lead.appointment_time}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    <LeadStatusSelect locale={locale} leadId={lead.id} status={lead.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {(!leads || leads.length === 0) && <p className="text-ivory/40 text-sm p-6">Todavía no hay leads.</p>}
      </div>
    </div>
  );
}
