"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { properties } from "@/lib/properties";
import PropertyCard from "./PropertyCard";
import AnimatedSection, { StaggerContainer, StaggerItem, ParallaxY } from "./AnimatedSection";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function FeaturedProperties() {
  const t = useTranslations("featured");
  const featuredProperties = properties.filter((p) => p.featured);

  return (
    <section className="py-32 bg-obsidian relative overflow-hidden">
      {/* Background mesh */}
      <div className="absolute inset-0 bg-mesh-subtle" />

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-champagne/20 to-transparent" />
      <div className="absolute top-1/3 right-0 w-[600px] h-[600px] bg-champagne/[0.02] rounded-full blur-[150px]" />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <AnimatedSection className="text-center mb-20">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-16 h-px bg-gradient-to-r from-transparent to-champagne/40" />
            <span className="text-champagne/70 text-xs font-medium tracking-[0.35em] uppercase">
              {t("badge")}
            </span>
            <div className="w-16 h-px bg-gradient-to-l from-transparent to-champagne/40" />
          </div>
          <h2 className="font-heading text-[clamp(2.5rem,5vw,4rem)] text-ivory mb-4">
            {t("title")}
          </h2>
          <p className="text-ivory/40 text-lg max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </AnimatedSection>

        {/* Properties grid */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" staggerDelay={0.15}>
          {featuredProperties.map((property, index) => (
            <StaggerItem key={property.id}>
              <PropertyCard property={property} index={index} />
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* CTA */}
        <AnimatedSection className="text-center mt-16">
          <Link
            href="/propiedades"
            className="inline-flex items-center gap-3 px-10 py-4 border border-champagne/30 text-champagne font-medium rounded-xl hover:bg-champagne/10 hover:border-champagne/50 transition-all duration-500 group text-sm uppercase tracking-wider"
          >
            {t("view_all")}
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </AnimatedSection>
      </div>
    </section>
  );
}
