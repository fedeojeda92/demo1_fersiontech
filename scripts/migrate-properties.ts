/**
 * Script one-off: migra las propiedades hardcodeadas de src/lib/properties.ts (seedProperties)
 * a Supabase, subiendo los assets locales (/public/fotos_normales, /public/tour) a Storage.
 *
 * Uso: npm run migrate:properties
 * Requiere en .env.local: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
 * Antes de correrlo: crear el bucket "property-images" (público) en Supabase Storage
 * y correr supabase/schema.sql para tener la tabla `tenants` seedeada.
 */
import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { seedProperties, type Property, type Tour360 } from "../src/lib/properties";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TENANT_SLUG = process.env.TENANT_SLUG ?? "fs-inmobiliaria";
const BUCKET = "property-images";
const PUBLIC_DIR = path.resolve(__dirname, "..", "public");

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Faltan NEXT_PUBLIC_SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY en .env.local"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

function contentTypeFor(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  return "application/octet-stream";
}

/**
 * Las fotos de /fotos_normales son directo de cámara/dron (3-7MB cada una). Servirlas así
 * satura al optimizador de imágenes de Next cuando la galería pide varias en simultáneo
 * (devuelve 500 intermitente en las más pesadas). Las de /tour son panoramas 360 y se suben
 * sin tocar para no perder resolución del visor.
 */
async function compressIfPhoto(localPath: string, fileBuffer: Buffer): Promise<{ buffer: Buffer; contentType: string }> {
  if (!localPath.startsWith("/fotos_normales/")) {
    return { buffer: fileBuffer, contentType: contentTypeFor(localPath) };
  }
  const buffer = await sharp(fileBuffer)
    .rotate()
    .resize({ width: 2400, withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
  return { buffer, contentType: "image/jpeg" };
}

/** Sube un asset local (path relativo a /public, ej. "/tour/sala1.jpg") a Storage y devuelve la URL pública. */
async function uploadLocalAsset(localPath: string, tenantId: string, propertySlug: string): Promise<string> {
  const relativePath = localPath.replace(/^\//, "");
  const absolutePath = path.join(PUBLIC_DIR, relativePath);
  const rawBuffer = await readFile(absolutePath);
  const { buffer: fileBuffer, contentType } = await compressIfPhoto(localPath, rawBuffer);
  const storagePath = `${tenantId}/${propertySlug}/${relativePath}`;

  const { error } = await supabase.storage.from(BUCKET).upload(storagePath, fileBuffer, {
    contentType,
    upsert: true,
  });

  if (error) {
    throw new Error(`Error subiendo ${localPath}: ${error.message}`);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

function isLocalAsset(url: string): boolean {
  return url.startsWith("/fotos_normales/") || url.startsWith("/tour/");
}

async function resolveImages(images: string[], tenantId: string, slug: string): Promise<string[]> {
  const resolved: string[] = [];
  for (const img of images) {
    resolved.push(isLocalAsset(img) ? await uploadLocalAsset(img, tenantId, slug) : img);
  }
  return resolved;
}

async function resolveTour360(
  tour360: Tour360 | undefined,
  tenantId: string,
  slug: string
): Promise<Tour360 | undefined> {
  if (!tour360) return undefined;

  const scenes: Tour360["scenes"] = {};
  for (const [sceneId, scene] of Object.entries(tour360.scenes)) {
    const panorama = isLocalAsset(scene.panorama)
      ? await uploadLocalAsset(scene.panorama, tenantId, slug)
      : scene.panorama;
    scenes[sceneId] = { ...scene, panorama };
  }

  return { ...tour360, scenes };
}

async function main() {
  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .select("id")
    .eq("slug", TENANT_SLUG)
    .single();

  if (tenantError || !tenant) {
    console.error(
      `No se encontró el tenant "${TENANT_SLUG}". Corré supabase/schema.sql en el SQL editor de Supabase primero.`
    );
    process.exit(1);
  }

  const tenantId = tenant.id as string;
  console.log(`Migrando ${seedProperties.length} propiedades al tenant ${TENANT_SLUG} (${tenantId})...`);

  for (const property of seedProperties) {
    process.stdout.write(`  - ${property.slug}... `);

    const [images, tour360] = await Promise.all([
      resolveImages(property.images, tenantId, property.slug),
      resolveTour360(property.tour360, tenantId, property.slug),
    ]);

    const row = toRow(property, tenantId, images, tour360);

    const { error } = await supabase.from("properties").upsert(row, { onConflict: "tenant_id,slug" });

    if (error) {
      console.log("ERROR");
      throw new Error(`Insertando ${property.slug}: ${error.message}`);
    }

    console.log("OK");
  }

  console.log("Migración completa.");
}

function toRow(
  property: Property,
  tenantId: string,
  images: string[],
  tour360: Tour360 | undefined
) {
  return {
    tenant_id: tenantId,
    slug: property.slug,
    operation: property.operation,
    type: property.type,
    zone: property.zone,
    address: property.address,
    price: property.price,
    currency: property.currency,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    area: property.area,
    garage: property.garage,
    year: property.year,
    featured: property.featured,
    has_virtual_tour: property.hasVirtualTour,
    has_drone_video: property.hasDroneVideo,
    title: property.title,
    description: property.description,
    features: property.features,
    images,
    video_url: property.videoUrl ?? null,
    tour_url: property.tourUrl ?? null,
    tour_360: tour360 ?? null,
    lat: property.lat ?? null,
    lng: property.lng ?? null,
  };
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
