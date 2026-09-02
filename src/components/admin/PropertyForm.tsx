"use client";

import { useActionState, useState } from "react";
import type { Property, propertyTypes as PropertyTypesConst, zones as ZonesConst } from "@/lib/properties";
import type { PropertyFormState } from "@/lib/actions/properties";
import ImageManager from "@/components/admin/ImageManager";

const LOCALE_LABELS: Record<string, string> = { es: "español", en: "inglés", ru: "ruso" };

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function PropertyForm({
  action,
  property,
  zones,
  propertyTypes,
  locale,
}: {
  action: (state: PropertyFormState, formData: FormData) => Promise<PropertyFormState>;
  property?: Property;
  zones: typeof ZonesConst;
  propertyTypes: typeof PropertyTypesConst;
  locale: "es" | "en" | "ru";
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [slug, setSlug] = useState(property?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(property));

  return (
    <form action={formAction} className="space-y-8 max-w-4xl">
      <section className="glass-card rounded-2xl p-6 space-y-4">
        <h2 className="font-heading text-lg text-ivory">Datos generales</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Slug (URL)" hint="Es la parte de la dirección web de la propiedad. Se autocompleta a partir del título, pero podés editarlo (solo minúsculas, números y guiones, ej: depto-2-ambientes-palermo).">
            <input
              name="slug"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(slugify(e.target.value));
              }}
              required
              pattern="[a-z0-9-]+"
              placeholder="casa-en-palermo"
              className={inputClass}
            />
          </Field>
          <Field label="Dirección">
            <input name="address" defaultValue={property?.address} required className={inputClass} />
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Field label="Operación">
            <select name="operation" defaultValue={property?.operation ?? "venta"} className={inputClass}>
              <option value="venta" className={optionClass}>Venta</option>
              <option value="alquiler" className={optionClass}>Alquiler</option>
            </select>
          </Field>
          <Field label="Tipo">
            <select name="type" defaultValue={property?.type ?? "departamento"} className={inputClass}>
              {propertyTypes.map((pt) => (
                <option key={pt.value} value={pt.value} className={optionClass}>{pt.label.es}</option>
              ))}
            </select>
          </Field>
          <Field label="Zona">
            <select name="zone" defaultValue={property?.zone ?? zones[0]} className={inputClass}>
              {zones.map((z) => (
                <option key={z} value={z} className={optionClass}>{z}</option>
              ))}
            </select>
          </Field>
          <Field label="Año">
            <input name="year" type="number" defaultValue={property?.year} className={inputClass} />
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Field label="Precio">
            <input name="price" type="number" step="any" defaultValue={property?.price} required className={inputClass} />
          </Field>
          <Field label="Moneda">
            <select name="currency" defaultValue={property?.currency ?? "USD"} className={inputClass}>
              <option value="USD" className={optionClass}>USD</option>
              <option value="ARS" className={optionClass}>ARS</option>
            </select>
          </Field>
          <Field label="Dormitorios">
            <input name="bedrooms" type="number" defaultValue={property?.bedrooms ?? 0} className={inputClass} />
          </Field>
          <Field label="Baños">
            <input name="bathrooms" type="number" defaultValue={property?.bathrooms ?? 0} className={inputClass} />
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Field label="Superficie (m²)">
            <input name="area" type="number" step="any" defaultValue={property?.area} required className={inputClass} />
          </Field>
          <Field label="Cocheras">
            <input name="garage" type="number" defaultValue={property?.garage ?? 0} className={inputClass} />
          </Field>
        </div>

        <div className="flex flex-wrap gap-6 pt-2">
          <Checkbox name="featured" label="Destacada" defaultChecked={property?.featured} />
          <Checkbox name="hasVirtualTour" label="Tiene tour virtual 360°" defaultChecked={property?.hasVirtualTour} />
          <Checkbox name="hasDroneVideo" label="Tiene video con drone" defaultChecked={property?.hasDroneVideo} />
        </div>
      </section>

      <section className="glass-card rounded-2xl p-6 space-y-4">
        <h2 className="font-heading text-lg text-ivory">Título y descripción</h2>
        <p className="text-xs text-ivory/40">
          Escribilo en {LOCALE_LABELS[locale] ?? locale} (el idioma con el que estás usando el panel ahora). Al
          guardar se traduce automáticamente a los otros idiomas para las visitas que cambien de idioma en el sitio.
        </p>
        <Field label={`Título (${locale})`}>
          <input
            name="title"
            defaultValue={property?.title[locale]}
            required
            className={inputClass}
            onChange={(e) => {
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
          />
        </Field>
        <Field label={`Descripción (${locale})`}>
          <textarea name="description" defaultValue={property?.description[locale]} required rows={4} className={inputClass} />
        </Field>
      </section>

      <section className="glass-card rounded-2xl p-6 space-y-4">
        <h2 className="font-heading text-lg text-ivory">Características e imágenes</h2>
        <Field label="Características (separadas por coma)">
          <input
            name="features"
            defaultValue={property?.features.join(", ")}
            placeholder="Pileta, Parrilla, Balcón"
            className={inputClass}
          />
        </Field>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="URL de video (opcional)">
            <input name="videoUrl" defaultValue={property?.videoUrl} className={inputClass} />
          </Field>
          <Field label="URL de tour Matterport (opcional)">
            <input name="tourUrl" defaultValue={property?.tourUrl} className={inputClass} />
          </Field>
        </div>

        <Field label="Imágenes">
          <ImageManager initialImages={property?.images ?? []} />
        </Field>
      </section>

      {state?.error && <p className="text-sm text-ember">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="px-8 py-3.5 bg-gradient-to-r from-champagne-dark via-champagne to-champagne-light text-obsidian font-medium rounded-xl disabled:opacity-50"
      >
        {pending ? "Guardando..." : property ? "Guardar cambios" : "Crear propiedad"}
      </button>
    </form>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-ivory/40 uppercase tracking-wider mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-ivory/30 mt-1.5 normal-case tracking-normal">{hint}</p>}
    </div>
  );
}

function Checkbox({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center gap-2 text-sm text-ivory/70">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="accent-champagne" />
      {label}
    </label>
  );
}

const inputClass =
  "w-full px-4 py-2.5 bg-ivory/5 border border-ivory/10 rounded-lg text-sm text-ivory placeholder:text-ivory/20 focus:outline-none focus:border-champagne/50";

const optionClass = "bg-obsidian text-ivory";
