import { createClient } from "@/lib/supabase/server";
import { getTenantId } from "@/lib/tenant";
import LeadStatusSelect from "@/components/admin/LeadStatusSelect";

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
    .select("id, name, email, phone, source, status, message, appointment_date, appointment_time, created_at, properties(title)")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });

  return (
    <div className="p-8">
      <h1 className="font-heading text-3xl text-ivory mb-8">Leads</h1>

      <div className="glass-card rounded-2xl overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-ivory/40 border-b border-ivory/10">
              <th className="px-6 py-3 font-medium">Nombre</th>
              <th className="px-6 py-3 font-medium">Contacto</th>
              <th className="px-6 py-3 font-medium">Origen</th>
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

              return (
                <tr key={lead.id} className="border-b border-ivory/5 last:border-0 align-top">
                  <td className="px-6 py-3 text-ivory">
                    {lead.name}
                    {lead.message && <p className="text-ivory/40 text-xs mt-1 max-w-xs">{lead.message}</p>}
                  </td>
                  <td className="px-6 py-3 text-ivory/60">
                    <p>{lead.email}</p>
                    {lead.phone && <p className="text-ivory/40">{lead.phone}</p>}
                  </td>
                  <td className="px-6 py-3 text-ivory/60 capitalize">{lead.source}</td>
                  <td className="px-6 py-3 text-ivory/60">{propertyTitle ?? "—"}</td>
                  <td className="px-6 py-3 text-ivory/60">
                    {new Date(lead.created_at).toLocaleDateString("es-AR")}
                    {lead.appointment_date && (
                      <p className="text-ivory/40 text-xs">
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
