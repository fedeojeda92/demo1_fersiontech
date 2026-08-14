"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import AnimatedSection from "@/components/AnimatedSection";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, MessageSquare, User } from "lucide-react";

export default function ContactPage() {
  const t = useTranslations("contact");
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  const contactInfo = [
    { icon: MapPin, label: t("info.address"), value: t("info.address_value"), href: "https://maps.google.com" },
    { icon: Phone, label: t("info.phone"), value: t("info.phone_value"), href: "tel:+541155550100" },
    { icon: Mail, label: t("info.email"), value: t("info.email_value"), href: "mailto:info@fsinmobiliaria.com.ar" },
    { icon: Clock, label: t("info.hours"), value: t("info.hours_value"), href: null },
  ];

  return (
    <div className="min-h-screen bg-obsidian">
      {/* Hero */}
      <section className="bg-obsidian py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-champagne/[0.03] rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-champagne/[0.02] rounded-full blur-[120px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6">
          <AnimatedSection>
            <h1 className="font-heading text-4xl md:text-5xl text-ivory mb-4">{t("title")}</h1>
            <p className="text-ivory/50 text-lg max-w-2xl">{t("subtitle")}</p>
          </AnimatedSection>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact info */}
            <AnimatedSection direction="left">
              <div className="space-y-6">
                {contactInfo.map((info, i) => (
                  <motion.div key={i} className="glass-card rounded-2xl p-6 flex items-start gap-4" whileHover={{ y: -4 }}>
                    <div className="w-12 h-12 bg-gradient-to-br from-champagne-dark via-champagne to-champagne-light rounded-xl flex items-center justify-center shrink-0">
                      <info.icon size={22} className="text-obsidian" />
                    </div>
                    <div>
                      <p className="text-ivory/40 text-sm mb-1">{info.label}</p>
                      {info.href ? (
                        <a href={info.href} target={info.href.startsWith("http") ? "_blank" : undefined}
                          className="text-ivory font-medium hover:text-champagne transition-colors">
                          {info.value}
                        </a>
                      ) : (
                        <p className="text-ivory font-medium">{info.value}</p>
                      )}
                    </div>
                  </motion.div>
                ))}

                {/* Social */}
                <div className="glass-card rounded-2xl p-6">
                  <p className="text-ivory font-medium mb-4">{t("follow_us")}</p>
                  <div className="flex flex-wrap gap-3">
                    {["Instagram", "Facebook", "LinkedIn", "YouTube"].map((social) => (
                      <a key={social} href="#"
                        className="px-4 py-2 bg-ivory/5 text-ivory/60 text-sm rounded-lg hover:bg-champagne/10 hover:text-champagne transition-all border border-ivory/10">
                        {social}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </AnimatedSection>

            {/* Form */}
            <AnimatedSection direction="right" delay={0.2} className="lg:col-span-2">
              <div className="glass-card rounded-2xl p-8">
                {submitted ? (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16">
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                      <CheckCircle size={40} className="text-emerald-400" />
                    </div>
                    <h3 className="font-heading text-2xl text-ivory mb-3">{t("success_title")}</h3>
                    <p className="text-ivory/40">{t("form.success")}</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-ivory/60 mb-2">{t("form.name")} *</label>
                        <div className="relative">
                          <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ivory/30" />
                          <input type="text" required value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full pl-12 pr-4 py-3 bg-ivory/5 border border-ivory/10 rounded-xl text-ivory placeholder:text-ivory/20 focus:outline-none focus:border-champagne/50 transition-colors"
                            placeholder={t("form.name_placeholder")} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-ivory/60 mb-2">{t("form.email")} *</label>
                        <div className="relative">
                          <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ivory/30" />
                          <input type="email" required value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full pl-12 pr-4 py-3 bg-ivory/5 border border-ivory/10 rounded-xl text-ivory placeholder:text-ivory/20 focus:outline-none focus:border-champagne/50 transition-colors"
                            placeholder="tu@email.com" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-ivory/60 mb-2">{t("form.phone")}</label>
                        <div className="relative">
                          <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ivory/30" />
                          <input type="tel" value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full pl-12 pr-4 py-3 bg-ivory/5 border border-ivory/10 rounded-xl text-ivory placeholder:text-ivory/20 focus:outline-none focus:border-champagne/50 transition-colors"
                            placeholder="+54 11 1234-5678" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-ivory/60 mb-2">{t("form.subject")} *</label>
                        <select required value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          className="w-full px-4 py-3 bg-ivory/5 border border-ivory/10 rounded-xl text-ivory focus:outline-none focus:border-champagne/50 transition-colors appearance-none cursor-pointer">
                          <option value="" className="bg-obsidian">{t("form.subject_select")}</option>
                          <option value="compra" className="bg-obsidian">{t("form.subject_buy")}</option>
                          <option value="venta" className="bg-obsidian">{t("form.subject_sell")}</option>
                          <option value="alquiler" className="bg-obsidian">{t("form.subject_rent")}</option>
                          <option value="tasacion" className="bg-obsidian">{t("form.subject_valuation")}</option>
                          <option value="otro" className="bg-obsidian">{t("form.subject_other")}</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-ivory/60 mb-2">{t("form.message")} *</label>
                      <div className="relative">
                        <MessageSquare size={18} className="absolute left-4 top-4 text-ivory/30" />
                        <textarea required value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          rows={5}
                          className="w-full pl-12 pr-4 py-3 bg-ivory/5 border border-ivory/10 rounded-xl text-ivory placeholder:text-ivory/20 focus:outline-none focus:border-champagne/50 transition-colors resize-none"
                          placeholder={t("form.message_placeholder")} />
                      </div>
                    </div>

                    <button type="submit"
                      className="px-8 py-4 bg-gradient-to-r from-champagne-dark via-champagne to-champagne-light text-obsidian font-medium rounded-xl transition-all duration-300 flex items-center gap-2 hover:luxury-glow-strong">
                      <Send size={18} />
                      {t("form.submit")}
                    </button>
                  </form>
                )}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Map placeholder */}
      <section className="h-96 bg-ivory/[0.02] flex items-center justify-center border-t border-ivory/5">
        <AnimatedSection>
          <div className="text-center">
            <MapPin size={48} className="text-champagne mx-auto mb-4" />
            <p className="text-ivory/40 text-lg">{t("info.address_value")}</p>
          </div>
        </AnimatedSection>
      </section>
    </div>
  );
}
