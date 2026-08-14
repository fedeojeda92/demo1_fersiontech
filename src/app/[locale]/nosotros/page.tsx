"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import AnimatedSection, { StaggerContainer, StaggerItem } from "@/components/AnimatedSection";
import { Award, Target, Eye, Heart, Users, Building2, TrendingUp, Clock } from "lucide-react";

export default function AboutPage() {
  const t = useTranslations("about");

  const stats = [
    { icon: Building2, value: "200+", label: t("stats.properties") },
    { icon: Clock, value: "20+", label: t("stats.years") },
    { icon: Users, value: "500+", label: t("stats.clients") },
    { icon: TrendingUp, value: "450+", label: t("stats.transactions") },
  ];

  const values = [
    { icon: Award, title: t("values.0.title"), description: t("values.0.description") },
    { icon: Target, title: t("values.1.title"), description: t("values.1.description") },
    { icon: Eye, title: t("values.2.title"), description: t("values.2.description") },
    { icon: Heart, title: t("values.3.title"), description: t("values.3.description") },
  ];

  return (
    <div className="min-h-screen bg-obsidian">
      {/* Hero */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&h=1080&fit=crop')" }} />
          <div className="absolute inset-0 bg-obsidian/85" />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-obsidian/60" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <AnimatedSection>
            <span className="inline-block px-4 py-2 bg-champagne/10 border border-champagne/30 text-champagne text-sm font-medium rounded-full mb-6 uppercase tracking-wider">
              {t("badge")}
            </span>
            <h1 className="font-heading text-5xl md:text-6xl text-ivory mb-6">{t("title")}</h1>
            <p className="text-ivory/50 text-xl max-w-2xl mx-auto">{t("subtitle")}</p>
          </AnimatedSection>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-obsidian border-b border-ivory/5">
        <div className="max-w-7xl mx-auto px-6">
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <StaggerItem key={i}>
                <motion.div className="text-center p-6" whileHover={{ scale: 1.05 }}>
                  <div className="w-16 h-16 bg-gradient-to-br from-champagne-dark via-champagne to-champagne-light rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <stat.icon size={28} className="text-obsidian" />
                  </div>
                  <p className="font-heading text-4xl text-champagne mb-2">{stat.value}</p>
                  <p className="text-ivory/40">{stat.label}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 bg-obsidian">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <AnimatedSection direction="left">
              <div className="glass-card rounded-2xl p-10 h-full">
                <div className="w-14 h-14 bg-gradient-to-br from-champagne-dark via-champagne to-champagne-light rounded-xl flex items-center justify-center mb-6">
                  <Target size={28} className="text-obsidian" />
                </div>
                <h2 className="font-heading text-3xl text-ivory mb-4">{t("mission_title")}</h2>
                <p className="text-ivory/40 leading-relaxed text-lg">{t("mission_text")}</p>
              </div>
            </AnimatedSection>
            <AnimatedSection direction="right" delay={0.2}>
              <div className="glass-card rounded-2xl p-10 h-full">
                <div className="w-14 h-14 bg-gradient-to-br from-champagne-dark via-champagne to-champagne-light rounded-xl flex items-center justify-center mb-6">
                  <Eye size={28} className="text-obsidian" />
                </div>
                <h2 className="font-heading text-3xl text-ivory mb-4">{t("vision_title")}</h2>
                <p className="text-ivory/40 leading-relaxed text-lg">{t("vision_text")}</p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-obsidian border-t border-ivory/5">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <h2 className="font-heading text-4xl text-ivory mb-4">{t("values_title")}</h2>
          </AnimatedSection>

          <StaggerContainer className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 overflow-x-auto snap-x snap-mandatory -mx-6 px-6 md:mx-0 md:px-0 md:overflow-visible pb-4 md:pb-0">
            {values.map((value, i) => (
              <StaggerItem key={i} className="shrink-0 w-[75vw] sm:w-72 md:w-auto snap-center">
                <motion.div
                  className="glass-card rounded-2xl p-8 h-full text-center group hover:border-champagne/20 transition-all duration-500"
                  whileHover={{ y: -8 }}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-champagne-dark via-champagne to-champagne-light rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <value.icon size={28} className="text-obsidian" />
                  </div>
                  <h3 className="font-heading text-xl text-ivory mb-3">{value.title}</h3>
                  <p className="text-ivory/40">{value.description}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 bg-obsidian relative overflow-hidden border-t border-ivory/5">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-champagne/[0.02] rounded-full blur-[150px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <h2 className="font-heading text-4xl text-ivory mb-4">{t("team_title")}</h2>
            <p className="text-ivory/40 text-lg max-w-2xl mx-auto">
              {t("team_subtitle")}
            </p>
          </AnimatedSection>

          <StaggerContainer className="flex md:grid md:grid-cols-3 gap-4 md:gap-8 overflow-x-auto snap-x snap-mandatory -mx-6 px-6 md:mx-0 md:px-0 md:overflow-visible pb-4 md:pb-0">
            {[
              { name: "Martín González", role: t("team_role_ceo"), image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face" },
              { name: "Laura Fernández", role: t("team_role_sales"), image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face" },
              { name: "Carlos Rodríguez", role: t("team_role_ops"), image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face" },
            ].map((member, i) => (
              <StaggerItem key={i} className="shrink-0 w-[75vw] sm:w-72 md:w-auto snap-center">
                <motion.div
                  className="glass-card rounded-2xl overflow-hidden h-full group hover:border-champagne/20 transition-all duration-300"
                  whileHover={{ y: -8 }}
                >
                  <div className="h-64 overflow-hidden">
                    <img src={member.image} alt={member.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-6 text-center">
                    <h3 className="font-heading text-xl text-ivory mb-1">{member.name}</h3>
                    <p className="text-champagne text-sm">{member.role}</p>
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>
    </div>
  );
}
