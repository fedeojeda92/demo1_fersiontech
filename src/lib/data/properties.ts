import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getTenantId } from "@/lib/tenant";
import type { Property } from "@/lib/properties";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type PropertyRow = {
  id: string;
  slug: string;
  operation: string;
  type: string;
  zone: string;
  address: string;
  price: number;
  currency: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  garage: number;
  year: number | null;
  featured: boolean;
  has_virtual_tour: boolean;
  has_drone_video: boolean;
  title: Property["title"];
  description: Property["description"];
  features: string[];
  images: string[];
  video_url: string | null;
  tour_url: string | null;
  tour_360: Property["tour360"] | null;
  lat: number | null;
  lng: number | null;
};

function mapRow(row: PropertyRow): Property {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    operation: row.operation as Property["operation"],
    type: row.type as Property["type"],
    zone: row.zone,
    address: row.address,
    price: Number(row.price),
    currency: row.currency as Property["currency"],
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    area: Number(row.area),
    garage: row.garage,
    year: row.year ?? 0,
    featured: row.featured,
    hasVirtualTour: row.has_virtual_tour,
    hasDroneVideo: row.has_drone_video,
    description: row.description,
    features: row.features ?? [],
    images: row.images ?? [],
    videoUrl: row.video_url ?? undefined,
    tourUrl: row.tour_url ?? undefined,
    tour360: row.tour_360 ?? undefined,
    lat: row.lat ?? undefined,
    lng: row.lng ?? undefined,
  };
}

export interface PropertyFilters {
  operation?: "venta" | "alquiler";
  type?: string;
  zone?: string;
  minRooms?: number;
  minPrice?: number;
  maxPrice?: number;
  query?: string;
}

export async function getProperties(filters: PropertyFilters = {}): Promise<Property[]> {
  const supabase = await createClient();
  const tenantId = await getTenantId();

  let query = supabase.from("properties").select("*").eq("tenant_id", tenantId);

  if (filters.operation) query = query.eq("operation", filters.operation);
  if (filters.type) query = query.eq("type", filters.type);
  if (filters.zone) query = query.eq("zone", filters.zone);
  if (filters.minRooms) query = query.gte("bedrooms", filters.minRooms);
  if (filters.minPrice) query = query.gte("price", filters.minPrice);
  if (filters.maxPrice) query = query.lte("price", filters.maxPrice);
  if (filters.query) {
    const term = `%${filters.query}%`;
    query = query.or(`zone.ilike.${term},address.ilike.${term},title->>es.ilike.${term}`);
  }

  const { data, error } = await query
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getProperties:", error.message);
    return [];
  }

  return (data as PropertyRow[]).map(mapRow);
}

export async function getFeaturedProperties(limit = 6): Promise<Property[]> {
  const supabase = await createClient();
  const tenantId = await getTenantId();

  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getFeaturedProperties:", error.message);
    return [];
  }

  return (data as PropertyRow[]).map(mapRow);
}

export async function getSimilarProperties(property: Property, limit = 3): Promise<Property[]> {
  const supabase = await createClient();
  const tenantId = await getTenantId();

  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("tenant_id", tenantId)
    .neq("id", property.id)
    .or(`zone.eq.${property.zone},type.eq.${property.type}`)
    .limit(limit);

  if (error) {
    console.error("getSimilarProperties:", error.message);
    return [];
  }

  return (data as PropertyRow[]).map(mapRow);
}

export async function getPropertyBySlugOrId(slugOrId: string): Promise<Property | null> {
  const supabase = await createClient();
  const tenantId = await getTenantId();

  let query = supabase.from("properties").select("*").eq("tenant_id", tenantId);
  query = UUID_RE.test(slugOrId)
    ? query.or(`slug.eq.${slugOrId},id.eq.${slugOrId}`)
    : query.eq("slug", slugOrId);

  const { data, error } = await query.maybeSingle();

  if (error || !data) return null;
  return mapRow(data as PropertyRow);
}
