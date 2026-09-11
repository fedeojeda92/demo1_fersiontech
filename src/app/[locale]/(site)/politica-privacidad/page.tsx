"use client";

import { useTranslations } from "next-intl";
import AnimatedSection, { StaggerContainer, StaggerItem } from "@/components/AnimatedSection";
import { ShieldCheck, Mail } from "lucide-react";

export default function PrivacyPolicyPage() {
  const t = useTranslations("privacy");
  const sections = t.raw("sections") as { title: string; body: string }[];

  return (
    <div className="min-h-screen bg-obsidian">
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-champagne/[0.03] rounded-full blur-[120px]" />
        </div>
        <div className="relative max-w-4xl mx-auto px-6">
          <AnimatedSection>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-champagne/10 border border-champagne/30 text-champagne text-sm font-medium rounded-full mb-6 uppercase tracking-wider">
              <ShieldCheck size={14} />
              {t("badge")}
            </span>
            <h1 className="font-heading text-4xl md:text-5xl text-ivory mb-4">{t("title")}</h1>
            <p className="text-ivory/30 text-sm mb-6">{t("updated")}</p>
            <p className="text-ivory/50 text-lg leading-relaxed">{t("intro")}</p>
          </AnimatedSection>
        </div>
      </section>

      {/* Sections */}
      <section className="py-8 pb-24">
        <div className="max-w-4xl mx-auto px-6">
          <StaggerContainer className="space-y-6">
            {sections.map((section, i) => (
              <StaggerItem key={i}>
                <div className="glass-card rounded-2xl p-8">
                  <h2 className="font-heading text-xl text-ivory mb-3">{section.title}</h2>
                  <p className="text-ivory/40 leading-relaxed">{section.body}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <AnimatedSection delay={0.2}>
            <div className="glass-card rounded-2xl p-8 mt-6 flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-champagne-dark via-champagne to-champagne-light rounded-xl flex items-center justify-center shrink-0">
                <Mail size={20} className="text-obsidian" />
              </div>
              <div>
                <h3 className="font-heading text-lg text-ivory mb-1">{t("contact_title")}</h3>
                <p className="text-ivory/40">{t("contact_body")}</p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
