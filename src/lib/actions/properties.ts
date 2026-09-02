"use server";

import { z } from "zod";
import sharp from "sharp";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getCurrentAgent } from "@/lib/dal";
import { translateToAllLocales, SUPPORTED_LOCALES, type SupportedLocale } from "@/lib/translate";

const PropertySchema = z.object({
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "El slug solo puede tener minúsculas, números y guiones."),
  operation: z.enum(["venta", "alquiler"]),
  type: z.enum(["departamento", "casa", "ph", "terreno", "oficina", "local"]),
  zone: z.string().min(1),
  address: z.string().min(1),
  price: z.coerce.number().positive(),
  currency: z.enum(["USD", "ARS"]),
  bedrooms: z.coerce.number().int().min(0),
  bathrooms: z.coerce.number().int().min(0),
  area: z.coerce.number().positive(),
  garage: z.coerce.number().int().min(0),
  year: z.coerce.number().int().optional(),
  featured: z.coerce.boolean(),
  hasVirtualTour: z.coerce.boolean(),
  hasDroneVideo: z.coerce.boolean(),
  title: z.string().min(1),
  description: z.string().min(1),
  features: z.string().optional(),
  videoUrl: z.string().optional(),
  tourUrl: z.string().optional(),
});

type ParsedProperty = z.infer<typeof PropertySchema>;

export type PropertyFormState = { success: boolean; error?: string } | undefined;

async function toRow(data: ParsedProperty, tenantId: string, images: string[], sourceLocale: SupportedLocale) {
  const [title, description] = await Promise.all([
    translateToAllLocales(data.title, sourceLocale),
    translateToAllLocales(data.description, sourceLocale),
  ]);

  return {
    tenant_id: tenantId,
    slug: data.slug,
    operation: data.operation,
    type: data.type,
    zone: data.zone,
    address: data.address,
    price: data.price,
    currency: data.currency,
    bedrooms: data.bedrooms,
    bathrooms: data.bathrooms,
    area: data.area,
    garage: data.garage,
    year: data.year ?? null,
    featured: data.featured,
    has_virtual_tour: data.hasVirtualTour,
    has_drone_video: data.hasDroneVideo,
    title,
    description,
    features: data.features
      ? data.features.split(",").map((f) => f.trim()).filter(Boolean)
      : [],
    images,
    video_url: data.videoUrl || null,
    tour_url: data.tourUrl || null,
  };
}

/**
 * Las fotos que suben los agentes salen de celular/cámara sin comprimir (varios MB cada una).
 * Servirlas así satura al optimizador de imágenes de Next cuando la galería pide varias en
 * simultáneo (devuelve 500 intermitente en las más pesadas), así que se reduce acá antes de subir.
 */
async function compressImage(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return sharp(Buffer.from(arrayBuffer))
    .rotate()
    .resize({ width: 2400, withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
}

async function uploadNewImages(
  files: File[],
  tenantId: string,
  slug: string,
  supabase: SupabaseClient
): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    const buffer = await compressImage(file);
    const baseName = file.name.replace(/\.[^.]+$/, "");
    const path = `${tenantId}/${slug}/${Date.now()}-${baseName}.jpg`;
    const { error } = await supabase.storage.from("property-images").upload(path, buffer, {
      contentType: "image/jpeg",
      upsert: true,
    });
    if (error) throw new Error(`Error subiendo imagen: ${error.message}`);
    const { data } = supabase.storage.from("property-images").getPublicUrl(path);
    urls.push(data.publicUrl);
  }
  return urls;
}

/**
 * ImageManager (admin) manda el orden final (existentes + nuevas, ya con la portada
 * elegida por el usuario primero) como tokens "existing:<url>" / "new:<indice>" en el
 * campo oculto `imageOrder`, en paralelo a los archivos crudos en el input `images`
 * (en el mismo orden que los tokens "new:N"). Acá se resuelve a la lista final de URLs.
 */
async function resolveImages(
  formData: FormData,
  tenantId: string,
  slug: string,
  supabase: SupabaseClient
): Promise<string[]> {
  const newFiles = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  const uploadedUrls = await uploadNewImages(newFiles, tenantId, slug, supabase);

  let order: string[];
  try {
    order = JSON.parse(String(formData.get("imageOrder") ?? "[]"));
  } catch {
    order = [];
  }

  return order
    .map((token) => {
      if (token.startsWith("existing:")) return token.slice("existing:".length);
      if (token.startsWith("new:")) return uploadedUrls[Number(token.slice("new:".length))] ?? null;
      return null;
    })
    .filter((url): url is string => Boolean(url));
}

function parseForm(formData: FormData) {
  return PropertySchema.safeParse(Object.fromEntries(formData.entries()));
}

function resolveSourceLocale(locale: string): SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(locale) ? (locale as SupportedLocale) : "es";
}

export async function createPropertyAction(
  locale: string,
  _prevState: PropertyFormState,
  formData: FormData
): Promise<PropertyFormState> {
  const agent = await getCurrentAgent(locale);
  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Revisá los datos del formulario." };
  }

  const supabase = await createClient();
  let images: string[];
  try {
    images = await resolveImages(formData, agent.tenant_id, parsed.data.slug, supabase);
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Error subiendo imágenes." };
  }

  const row = await toRow(parsed.data, agent.tenant_id, images, resolveSourceLocale(locale));
  const { error } = await supabase.from("properties").insert(row);
  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/${locale}/propiedades`);
  redirect(`/${locale}/admin/propiedades`);
}

export async function updatePropertyAction(
  locale: string,
  propertyId: string,
  _prevState: PropertyFormState,
  formData: FormData
): Promise<PropertyFormState> {
  const agent = await getCurrentAgent(locale);
  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Revisá los datos del formulario." };
  }

  const supabase = await createClient();
  let images: string[];
  try {
    images = await resolveImages(formData, agent.tenant_id, parsed.data.slug, supabase);
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Error subiendo imágenes." };
  }

  const row = await toRow(parsed.data, agent.tenant_id, images, resolveSourceLocale(locale));

  const { error } = await supabase
    .from("properties")
    .update(row)
    .eq("id", propertyId)
    .eq("tenant_id", agent.tenant_id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/${locale}/propiedades`);
  revalidatePath(`/${locale}/propiedades/${parsed.data.slug}`);
  redirect(`/${locale}/admin/propiedades`);
}

export async function deletePropertyAction(locale: string, propertyId: string): Promise<void> {
  const agent = await getCurrentAgent(locale);
  const supabase = await createClient();

  await supabase.from("properties").delete().eq("id", propertyId).eq("tenant_id", agent.tenant_id);

  revalidatePath(`/${locale}/propiedades`);
  redirect(`/${locale}/admin/propiedades`);
}
