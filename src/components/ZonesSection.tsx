"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import AnimatedSection from "./AnimatedSection";
import { MapPin, Building2, TrendingUp } from "lucide-react";
import { Link } from "@/i18n/navigation";

const zones = [
  { name: "Palermo", image: "https://images.unsplash.com/photo-1703043997458-2736adc1e4e9?w=600&h=400&fit=crop", properties: 45 },
  { name: "Recoleta", image: "https://plus.unsplash.com/premium_photo-1754262156577-51c700533550?w=600&h=400&fit=crop", properties: 32 },
  { name: "Puerto Madero", image: "https://plus.unsplash.com/premium_photo-1754344833880-a23161cf6ce8?w=600&h=400&fit=crop", properties: 28 },
  { name: "Belgrano", image: "https://plus.unsplash.com/premium_photo-1754258464921-30f70fcf81c9?w=600&h=400&fit=crop", properties: 38 },
];

export default function ZonesSection() {
  const t = useTranslations("zones");
  return (
    <section className="py-32 bg-obsidian relative overflow-hidden">
      <div className="absolute inset-0 bg-mesh" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-champagne/20 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-6">
        <AnimatedSection className="text-center mb-20">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-16 h-px bg-gradient-to-r from-transparent to-champagne/40" />
            <span className="text-champagne/70 text-xs font-medium tracking-[0.35em] uppercase">{t("badge")}</span>
            <div className="w-16 h-px bg-gradient-to-l from-transparent to-champagne/40" />
          </div>
          <h2 className="font-heading text-[clamp(2.5rem,5vw,4rem)] text-ivory mb-4">
            {t("title_1")}{" "}
            <span className="text-gradient-gold">{t("title_highlight")}</span>
          </h2>
          <p className="text-ivory/40 text-lg max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </AnimatedSection>

        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 overflow-x-auto snap-x snap-mandatory -mx-6 px-6 md:mx-0 md:px-0 md:overflow-visible pb-4 md:pb-0">
          {zones.map((zone, i) => (
            <AnimatedSection key={zone.name} delay={i * 0.1} className="shrink-0 w-[78vw] sm:w-80 md:w-auto snap-center">
              <Link
                href={`/propiedades?zone=${zone.name}`}
                className="group relative block h-72 md:h-96 rounded-2xl overflow-hidden glass-card"
              >
                <motion.img
                  src={zone.image}
                  alt={zone.name}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.08 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/30 to-transparent" />
                <div className="absolute inset-0 bg-champagne/0 group-hover:bg-champagne/5 transition-colors duration-500" />

                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin size={14} className="text-champagne" />
                    <span className="font-heading text-xl text-ivory">{zone.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-ivory/40 text-sm">
                    <Building2 size={12} />
                    <span>{zone.properties} {t("properties_suffix")}</span>
                  </div>
                </div>

                <div className="absolute top-4 right-4 px-3 py-1.5 bg-champagne/0 group-hover:bg-champagne/20 backdrop-blur-sm rounded-full text-champagne text-[10px] font-medium tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-all duration-300 border border-champagne/0 group-hover:border-champagne/30">
                  <TrendingUp size={12} className="inline mr-1" />
                  {t("explore")}
                </div>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
