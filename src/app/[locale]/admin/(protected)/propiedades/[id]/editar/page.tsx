import { notFound } from "next/navigation";
import { zones, propertyTypes } from "@/lib/properties";
import { getPropertyBySlugOrId } from "@/lib/data/properties";
import { updatePropertyAction } from "@/lib/actions/properties";
import PropertyForm from "@/components/admin/PropertyForm";

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const property = await getPropertyBySlugOrId(id);

  if (!property) {
    notFound();
  }

  const boundAction = updatePropertyAction.bind(null, locale, property.id);

  return (
    <div className="p-8">
      <h1 className="font-heading text-3xl text-ivory mb-8">Editar propiedad</h1>
      <PropertyForm
        action={boundAction}
        property={property}
        zones={zones}
        propertyTypes={propertyTypes}
        locale={locale as "es" | "en" | "ru"}
      />
    </div>
  );
}
