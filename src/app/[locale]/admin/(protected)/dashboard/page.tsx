import { createClient } from "@/lib/supabase/server";
import { getTenantId } from "@/lib/tenant";
import { Link } from "@/i18n/navigation";
import { Building2, Users, Eye, Plus, Flame } from "lucide-react";
import { LEAD_SOURCE_LABELS, LEAD_STATUS_LABELS, type LeadStatus } from "@/lib/leads";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const tenantId = await getTenantId();

  const [{ count: propertiesCount }, { count: leadsCount }, { count: viewsCount }, { count: hotCount }, { data: recentLeads }] =
    await Promise.all([
      supabase.from("properties").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId),
      supabase.from("leads").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId),
      supabase.from("property_views").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId),
      supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .eq("tenant_id", tenantId)
        .eq("temperature", "caliente")
        .in("status", ["nuevo", "calificado", "visita", "negociacion"]),
      supabase
        .from("leads")
        .select("id, name, source, status, created_at")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const stats = [
    { label: "Propiedades", value: propertiesCount ?? 0, icon: Building2 },
    { label: "Leads totales", value: leadsCount ?? 0, icon: Users },
    { label: "Leads calientes activos", value: hotCount ?? 0, icon: Flame },
    { label: "Vistas totales", value: viewsCount ?? 0, icon: Eye },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-3xl text-ivory">Dashboard</h1>
        <Link
          href="/admin/propiedades/nueva"
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-champagne-dark via-champagne to-champagne-light text-obsidian font-medium rounded-xl text-sm"
        >
          <Plus size={16} />
          Nueva propiedad
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card rounded-2xl p-6">
            <stat.icon size={22} className="text-champagne mb-3" />
            <p className="font-heading text-3xl text-ivory">{stat.value}</p>
            <p className="text-ivory/40 text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h2 className="font-heading text-xl text-ivory mb-4">Últimos leads</h2>
        {recentLeads && recentLeads.length > 0 ? (
          <div className="space-y-2">
            {recentLeads.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between py-2 border-b border-ivory/5 last:border-0">
                <div>
                  <Link href={`/admin/leads/${lead.id}`} className="text-ivory text-sm hover:text-champagne">
                    {lead.name}
                  </Link>
                  <p className="text-ivory/40 text-xs">
                    {LEAD_SOURCE_LABELS[lead.source] ?? lead.source} · {new Date(lead.created_at).toLocaleDateString("es-AR")}
                  </p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-champagne/10 text-champagne">
                  {LEAD_STATUS_LABELS[lead.status as LeadStatus] ?? lead.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-ivory/40 text-sm">Todavía no hay leads.</p>
        )}
        <Link href="/admin/leads" className="inline-block mt-4 text-sm text-champagne hover:underline">
          Ver todos los leads →
        </Link>
      </div>
    </div>
  );
}
