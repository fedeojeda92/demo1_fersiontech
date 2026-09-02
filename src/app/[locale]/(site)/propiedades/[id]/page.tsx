import { notFound } from "next/navigation";
import { after } from "next/server";
import { headers } from "next/headers";
import { getPropertyBySlugOrId, getSimilarProperties } from "@/lib/data/properties";
import { recordPropertyView } from "@/lib/analytics";
import { getTenantId } from "@/lib/tenant";
import PropertyDetailClient from "@/components/PropertyDetailClient";

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;
  const property = await getPropertyBySlugOrId(id);

  if (!property) {
    notFound();
  }

  const similarProperties = await getSimilarProperties(property);
  const referrer = (await headers()).get("referer");

  after(async () => {
    const tenantId = await getTenantId();
    await recordPropertyView({ tenantId, propertyId: property.id, locale, referrer });
  });

  return <PropertyDetailClient property={property} similarProperties={similarProperties} />;
}
