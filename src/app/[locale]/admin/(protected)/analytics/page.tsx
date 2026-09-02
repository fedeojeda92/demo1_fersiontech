import { getPropertyAnalytics } from "@/lib/analytics";

export default async function AdminAnalyticsPage() {
  const rows = await getPropertyAnalytics();
  const totalViews = rows.reduce((sum, r) => sum + r.views, 0);
  const totalLeads = rows.reduce((sum, r) => sum + r.leads, 0);

  return (
    <div className="p-8">
      <h1 className="font-heading text-3xl text-ivory mb-8">Analítica</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card rounded-2xl p-6">
          <p className="font-heading text-3xl text-ivory">{totalViews}</p>
          <p className="text-ivory/40 text-sm">Vistas totales</p>
        </div>
        <div className="glass-card rounded-2xl p-6">
          <p className="font-heading text-3xl text-ivory">{totalLeads}</p>
          <p className="text-ivory/40 text-sm">Contactos generados</p>
        </div>
        <div className="glass-card rounded-2xl p-6">
          <p className="font-heading text-3xl text-ivory">
            {totalViews > 0 ? ((totalLeads / totalViews) * 100).toFixed(1) : "0"}%
          </p>
          <p className="text-ivory/40 text-sm">Conversión promedio</p>
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-ivory/40 border-b border-ivory/10">
              <th className="px-6 py-3 font-medium">Propiedad</th>
              <th className="px-6 py-3 font-medium">Vistas</th>
              <th className="px-6 py-3 font-medium">Contactos</th>
              <th className="px-6 py-3 font-medium">Conversión</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.propertyId} className="border-b border-ivory/5 last:border-0">
                <td className="px-6 py-3 text-ivory">{row.title}</td>
                <td className="px-6 py-3 text-ivory/60">{row.views}</td>
                <td className="px-6 py-3 text-ivory/60">{row.leads}</td>
                <td className="px-6 py-3 text-ivory/60">{row.conversionRate.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="text-ivory/40 text-sm p-6">Todavía no hay datos de analítica.</p>}
      </div>
    </div>
  );
}
