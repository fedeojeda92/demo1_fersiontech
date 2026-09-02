import { getProperties } from "@/lib/data/properties";
import { zones, propertyTypes } from "@/lib/properties";
import PropertyGridClient, { type PropertyFiltersState } from "@/components/PropertyGridClient";

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  const opRaw = firstValue(sp.op);
  const operation = opRaw === "venta" || opRaw === "alquiler" ? opRaw : undefined;
  const type = firstValue(sp.type);
  const zone = firstValue(sp.zone);
  const rooms = firstValue(sp.rooms);
  const minPrice = firstValue(sp.minPrice);
  const maxPrice = firstValue(sp.maxPrice);
  const query = firstValue(sp.q);

  const properties = await getProperties({
    operation,
    type,
    zone,
    minRooms: rooms ? parseInt(rooms, 10) : undefined,
    minPrice: minPrice ? parseInt(minPrice, 10) : undefined,
    maxPrice: maxPrice ? parseInt(maxPrice, 10) : undefined,
    query,
  });

  const initialFilters: PropertyFiltersState = {
    operation: operation ?? "",
    type: type ?? "",
    zone: zone ?? "",
    rooms: rooms ?? "",
    minPrice: minPrice ?? "",
    maxPrice: maxPrice ?? "",
    query: query ?? "",
  };

  return (
    <PropertyGridClient
      properties={properties}
      zones={zones}
      propertyTypes={propertyTypes}
      initialFilters={initialFilters}
    />
  );
}
