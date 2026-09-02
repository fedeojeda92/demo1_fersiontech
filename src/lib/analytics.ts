import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function recordPropertyView(args: {
  tenantId: string;
  propertyId: string;
  locale: string;
  referrer?: string | null;
}): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("property_views").insert({
    tenant_id: args.tenantId,
    property_id: args.propertyId,
    locale: args.locale,
    referrer: args.referrer ?? null,
  });

  if (error) {
    console.error("recordPropertyView:", error.message);
  }
}

export interface PropertyAnalyticsRow {
  propertyId: string;
  title: string;
  views: number;
  leads: number;
  conversionRate: number;
}

/** Vistas y leads agregados por propiedad, para el dashboard del admin. */
export async function getPropertyAnalytics(): Promise<PropertyAnalyticsRow[]> {
  const supabase = await createClient();

  const [{ data: properties, error: propertiesError }, { data: views, error: viewsError }, { data: leads, error: leadsError }] =
    await Promise.all([
      supabase.from("properties").select("id, title"),
      supabase.from("property_views").select("property_id"),
      supabase.from("leads").select("property_id").not("property_id", "is", null),
    ]);

  if (propertiesError || viewsError || leadsError || !properties) {
    console.error("getPropertyAnalytics:", propertiesError?.message, viewsError?.message, leadsError?.message);
    return [];
  }

  const viewCounts = new Map<string, number>();
  for (const row of views ?? []) {
    viewCounts.set(row.property_id, (viewCounts.get(row.property_id) ?? 0) + 1);
  }

  const leadCounts = new Map<string, number>();
  for (const row of leads ?? []) {
    if (!row.property_id) continue;
    leadCounts.set(row.property_id, (leadCounts.get(row.property_id) ?? 0) + 1);
  }

  return properties
    .map((p) => {
      const propertyViews = viewCounts.get(p.id) ?? 0;
      const propertyLeads = leadCounts.get(p.id) ?? 0;
      return {
        propertyId: p.id,
        title: (p.title as { es: string })?.es ?? p.id,
        views: propertyViews,
        leads: propertyLeads,
        conversionRate: propertyViews > 0 ? (propertyLeads / propertyViews) * 100 : 0,
      };
    })
    .sort((a, b) => b.views - a.views);
}
