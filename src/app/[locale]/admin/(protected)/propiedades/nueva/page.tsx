import { zones, propertyTypes } from "@/lib/properties";
import { createPropertyAction } from "@/lib/actions/properties";
import PropertyForm from "@/components/admin/PropertyForm";

export default async function NewPropertyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const boundAction = createPropertyAction.bind(null, locale);

  return (
    <div className="p-8">
      <h1 className="font-heading text-3xl text-ivory mb-8">Nueva propiedad</h1>
      <PropertyForm
        action={boundAction}
        zones={zones}
        propertyTypes={propertyTypes}
        locale={locale as "es" | "en" | "ru"}
      />
    </div>
  );
}
