"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import AnimatedSection from "./AnimatedSection";
import { Search, SlidersHorizontal } from "lucide-react";
import { zones, propertyTypes } from "@/lib/properties";

export default function PropertySearch() {
  const t = useTranslations("search");
  const locale = useLocale() as "es" | "en" | "ru";
  const [operation, setOperation] = useState<"venta" | "alquiler">("venta");
  const [type, setType] = useState("");
  const [zone, setZone] = useState("");
  const [rooms, setRooms] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <section className="py-32 bg-obsidian relative">
      <div className="absolute inset-0 bg-mesh" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-champagne/20 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-6">
        <AnimatedSection className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-16 h-px bg-gradient-to-r from-transparent to-champagne/40" />
            <span className="text-champagne/70 text-xs font-medium tracking-[0.35em] uppercase">{t("badge")}</span>
            <div className="w-16 h-px bg-gradient-to-l from-transparent to-champagne/40" />
          </div>
          <h2 className="font-heading text-[clamp(2.5rem,5vw,4rem)] text-ivory mb-4">
            {t("title")}
          </h2>
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          <div className="max-w-5xl mx-auto">
            <div className="glass-card rounded-3xl p-8 luxury-glow">
              {/* Operation tabs */}
              <div className="flex gap-2 mb-8 justify-center">
                {(["venta", "alquiler"] as const).map((op) => (
                  <button
                    key={op}
                    onClick={() => setOperation(op)}
                    className={`px-8 py-3 rounded-xl font-medium transition-all duration-300 text-sm uppercase tracking-wider ${
                      operation === op
                        ? "bg-gradient-to-r from-champagne-dark via-champagne to-champagne-light text-obsidian shadow-lg shadow-champagne/20"
                        : "bg-ivory/5 text-ivory/50 hover:bg-ivory/10 border border-ivory/10"
                    }`}
                  >
                    {op === "venta" ? t("sale") : t("rent")}
                  </button>
                ))}
              </div>

              {/* Search fields */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-xs text-ivory/40 uppercase tracking-wider mb-2">{t("type")}</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-4 py-3 bg-ivory/5 border border-ivory/10 rounded-xl text-ivory focus:outline-none focus:border-champagne/50 transition-all appearance-none cursor-pointer text-sm"
                  >
                    <option value="" className="bg-obsidian">{t("all_types")}</option>
                    {propertyTypes.map((pt) => (
                      <option key={pt.value} value={pt.value} className="bg-obsidian">{pt.label[locale]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-ivory/40 uppercase tracking-wider mb-2">{t("zone")}</label>
                  <select
                    value={zone}
                    onChange={(e) => setZone(e.target.value)}
                    className="w-full px-4 py-3 bg-ivory/5 border border-ivory/10 rounded-xl text-ivory focus:outline-none focus:border-champagne/50 transition-all appearance-none cursor-pointer text-sm"
                  >
                    <option value="" className="bg-obsidian">{t("all_zones")}</option>
                    {zones.map((z) => (
                      <option key={z} value={z} className="bg-obsidian">{z}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-ivory/40 uppercase tracking-wider mb-2">{t("rooms")}</label>
                  <select
                    value={rooms}
                    onChange={(e) => setRooms(e.target.value)}
                    className="w-full px-4 py-3 bg-ivory/5 border border-ivory/10 rounded-xl text-ivory focus:outline-none focus:border-champagne/50 transition-all appearance-none cursor-pointer text-sm"
                  >
                    <option value="" className="bg-obsidian">{t("all_rooms")}</option>
                    {[1, 2, 3, 4, 5].map((r) => (
                      <option key={r} value={r} className="bg-obsidian">{r}+</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <Link
                    href={`/propiedades?op=${operation}&type=${type}&zone=${zone}&rooms=${rooms}`}
                    className="w-full px-6 py-3 bg-gradient-to-r from-champagne-dark via-champagne to-champagne-light text-obsidian font-semibold rounded-xl hover:luxury-glow-strong transition-all duration-300 flex items-center justify-center gap-2 group text-sm uppercase tracking-wider"
                  >
                    <Search size={16} />
                    {t("search_btn")}
                  </Link>
                </div>
              </div>

              {/* Advanced filters */}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm text-ivory/40 hover:text-champagne transition-colors mx-auto"
              >
                <SlidersHorizontal size={14} />
                {t("filters")}
                <motion.span animate={{ rotate: showAdvanced ? 180 : 0 }} transition={{ duration: 0.3 }}>▾</motion.span>
              </button>

              <motion.div
                initial={false}
                animate={{ height: showAdvanced ? "auto" : 0, opacity: showAdvanced ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-6 mt-6 border-t border-ivory/10">
                  {[t("min_price"), t("max_price"), t("min_area"), t("max_area")].map((label, i) => (
                    <div key={i}>
                      <label className="block text-xs text-ivory/40 uppercase tracking-wider mb-2">{label}</label>
                      <input
                        type="number"
                        placeholder={i < 2 ? "USD" : "m²"}
                        className="w-full px-4 py-3 bg-ivory/5 border border-ivory/10 rounded-xl text-ivory placeholder:text-ivory/20 focus:outline-none focus:border-champagne/50 transition-all text-sm"
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
