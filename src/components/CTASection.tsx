"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import AnimatedSection from "./AnimatedSection";
import { ArrowRight, Phone } from "lucide-react";

export default function CTASection() {
  const t = useTranslations("cta");
  const stats = [
    { value: "98%", label: t("stat1_label"), desc: t("stat1_desc") },
    { value: "15%", label: t("stat2_label"), desc: t("stat2_desc") },
    { value: "360°", label: t("stat3_label"), desc: t("stat3_desc") },
    { value: "4K", label: t("stat4_label"), desc: t("stat4_desc") },
  ];
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-obsidian via-obsidian-light to-obsidian" />
      <div className="absolute inset-0 bg-mesh" />

      {/* Decorative orbs */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-champagne/[0.04] rounded-full blur-[150px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-champagne/[0.03] rounded-full blur-[120px]" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(212,175,55,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.3) 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <AnimatedSection direction="left">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-12 h-px bg-champagne/40" />
              <span className="text-champagne/70 text-xs font-medium tracking-[0.35em] uppercase">{t("badge")}</span>
            </div>
            <h2 className="font-heading text-[clamp(2.5rem,5vw,4rem)] text-ivory mb-8 leading-tight">
              {t("title_1")}{" "}
              <span className="text-gradient-gold-wide">{t("title_highlight")}</span>
            </h2>
            <p className="text-ivory/50 text-lg mb-10 leading-relaxed">
              {t("description")}
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/turnos"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-champagne-dark via-champagne to-champagne-light text-obsidian font-semibold rounded-xl hover:luxury-glow-strong transition-all duration-300 group text-sm uppercase tracking-wider"
              >
                {t("request_valuation")}
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="tel:+541155550100"
                className="inline-flex items-center gap-2 px-8 py-4 border border-champagne/30 text-champagne font-medium rounded-xl hover:bg-champagne/10 transition-all duration-300 text-sm uppercase tracking-wider"
              >
                <Phone size={16} />
                {t("call_us")}
              </a>
            </div>
          </AnimatedSection>

          {/* Right content - Stats */}
          <AnimatedSection direction="right" delay={0.2}>
            <div className="grid grid-cols-2 gap-5">
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  className="glass-card rounded-2xl p-6 text-center group hover:border-champagne/20 transition-all duration-300"
                  whileHover={{ scale: 1.03, y: -4 }}
                >
                  <p className="font-heading text-3xl text-gradient-gold mb-2">{stat.value}</p>
                  <p className="text-ivory font-medium text-sm mb-1">{stat.label}</p>
                  <p className="text-ivory/30 text-xs">{stat.desc}</p>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
