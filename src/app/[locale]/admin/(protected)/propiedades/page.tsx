import { getProperties } from "@/lib/data/properties";
import { Link } from "@/i18n/navigation";
import DeletePropertyButton from "@/components/admin/DeletePropertyButton";
import { Plus, Pencil } from "lucide-react";

export default async function AdminPropertiesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const properties = await getProperties();

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-3xl text-ivory">Propiedades</h1>
        <Link
          href="/admin/propiedades/nueva"
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-champagne-dark via-champagne to-champagne-light text-obsidian font-medium rounded-xl text-sm"
        >
          <Plus size={16} />
          Nueva propiedad
        </Link>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-ivory/40 border-b border-ivory/10">
              <th className="px-6 py-3 font-medium">Título</th>
              <th className="px-6 py-3 font-medium">Zona</th>
              <th className="px-6 py-3 font-medium">Operación</th>
              <th className="px-6 py-3 font-medium">Precio</th>
              <th className="px-6 py-3 font-medium">Destacada</th>
              <th className="px-6 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {properties.map((p) => (
              <tr key={p.id} className="border-b border-ivory/5 last:border-0">
                <td className="px-6 py-3 text-ivory">{p.title.es}</td>
                <td className="px-6 py-3 text-ivory/60">{p.zone}</td>
                <td className="px-6 py-3 text-ivory/60 capitalize">{p.operation}</td>
                <td className="px-6 py-3 text-ivory/60">
                  {p.currency === "USD" ? "U$S" : "$"} {p.price.toLocaleString("es-AR")}
                </td>
                <td className="px-6 py-3">
                  {p.featured && <span className="text-xs px-2 py-1 rounded-full bg-champagne/10 text-champagne">Sí</span>}
                </td>
                <td className="px-6 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/propiedades/${p.id}/editar`}
                      className="p-2 rounded-lg text-ivory/50 hover:text-champagne hover:bg-champagne/10 transition-colors"
                    >
                      <Pencil size={16} />
                    </Link>
                    <DeletePropertyButton locale={locale} propertyId={p.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {properties.length === 0 && (
          <p className="text-ivory/40 text-sm p-6">Todavía no hay propiedades cargadas.</p>
        )}
      </div>
    </div>
  );
}
