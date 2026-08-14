"use client";

import { useTranslations } from "next-intl";
import AnimatedSection, { StaggerContainer, StaggerItem } from "./AnimatedSection";
import { motion } from "framer-motion";
import { Eye, Camera, Shield, Award, Headphones, TrendingUp } from "lucide-react";

export default function WhyChooseUs() {
  const t = useTranslations("why");

  const icons = [Eye, Camera, Shield, Award, Headphones, TrendingUp];
  const reasons = (t.raw("reasons") as { title: string; description: string }[]).map((r, i) => ({
    icon: icons[i],
    title: r.title,
    description: r.description,
  }));

  return (
    <section className="py-32 bg-obsidian-light relative overflow-hidden">
      <div className="absolute inset-0 bg-mesh-subtle" />
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

        <StaggerContainer
          className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory -mx-6 px-6 md:mx-0 md:px-0 md:overflow-visible pb-4 md:pb-0"
          staggerDelay={0.1}
        >
          {reasons.map((reason, i) => (
            <StaggerItem key={i} className="shrink-0 w-[78vw] sm:w-80 md:w-auto snap-center">
              <motion.div
                className="glass-card rounded-2xl p-8 h-full group hover:border-champagne/20 transition-all duration-500 relative overflow-hidden"
                whileHover={{ y: -6 }}
              >
                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-champagne/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative">
                  <div className="w-14 h-14 bg-champagne/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-champagne/20 transition-colors duration-300 border border-champagne/10">
                    <reason.icon size={24} className="text-champagne" />
                  </div>
                  <h3 className="font-heading text-xl text-ivory mb-3">{reason.title}</h3>
                  <p className="text-ivory/40 text-sm leading-relaxed">{reason.description}</p>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
