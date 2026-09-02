"use client";

import { useActionState, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import AnimatedSection from "@/components/AnimatedSection";
import type { Property } from "@/lib/properties";
import { createLeadAction } from "@/lib/actions/leads";
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  MessageSquare,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const turnoAction = createLeadAction.bind(null, "turno");

export default function AppointmentForm({ properties }: { properties: Property[] }) {
  const t = useTranslations("appointments");
  const locale = useLocale() as "es" | "en" | "ru";
  const [state, formAction, pending] = useActionState(turnoAction, undefined);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    property: "",
    date: "",
    time: "",
    message: "",
  });
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const availableTimes = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00",
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const { firstDay, daysInMonth } = getDaysInMonth(selectedMonth);

  const prevMonth = () => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1));
  const nextMonth = () => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1));

  const monthNames = t.raw("calendar.months") as string[];
  const dayNames = t.raw("calendar.days") as string[];

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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Form */}
            <AnimatedSection direction="left">
              <div className="glass-card rounded-2xl p-8">
                {state?.success ? (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                      <CheckCircle size={40} className="text-emerald-400" />
                    </div>
                    <h3 className="font-heading text-2xl text-ivory mb-3">{t("success_title")}</h3>
                    <p className="text-ivory/40">{t("form.success")}</p>
                  </motion.div>
                ) : (
                  <form action={formAction} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-ivory/60 mb-2">
                        {t("form.name")} {t("form.required")}
                      </label>
                      <div className="relative">
                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ivory/30" />
                        <input
                          type="text" name="name" required value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full pl-12 pr-4 py-3 bg-ivory/5 border border-ivory/10 rounded-xl text-ivory placeholder:text-ivory/20 focus:outline-none focus:border-champagne/50 transition-colors"
                          placeholder={t("form.name_placeholder")}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-ivory/60 mb-2">
                          {t("form.email")} {t("form.required")}
                        </label>
                        <div className="relative">
                          <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ivory/30" />
                          <input
                            type="email" name="email" required value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full pl-12 pr-4 py-3 bg-ivory/5 border border-ivory/10 rounded-xl text-ivory placeholder:text-ivory/20 focus:outline-none focus:border-champagne/50 transition-colors"
                            placeholder="tu@email.com"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-ivory/60 mb-2">
                          {t("form.phone")} {t("form.required")}
                        </label>
                        <div className="relative">
                          <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ivory/30" />
                          <input
                            type="tel" name="phone" required value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full pl-12 pr-4 py-3 bg-ivory/5 border border-ivory/10 rounded-xl text-ivory placeholder:text-ivory/20 focus:outline-none focus:border-champagne/50 transition-colors"
                            placeholder="+54 11 1234-5678"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-ivory/60 mb-2">{t("form.property")}</label>
                      <select
                        name="propertyId"
                        value={formData.property}
                        onChange={(e) => setFormData({ ...formData, property: e.target.value })}
                        className="w-full px-4 py-3 bg-ivory/5 border border-ivory/10 rounded-xl text-ivory focus:outline-none focus:border-champagne/50 transition-colors appearance-none cursor-pointer"
                      >
                        <option value="" className="bg-obsidian">{t("form.select_property")}</option>
                        {properties.map((p) => (
                          <option key={p.id} value={p.id} className="bg-obsidian">{p.title[locale]} - {p.zone}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-ivory/60 mb-2">{t("form.message")}</label>
                      <div className="relative">
                        <MessageSquare size={18} className="absolute left-4 top-4 text-ivory/30" />
                        <textarea
                          name="message"
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          rows={4}
                          className="w-full pl-12 pr-4 py-3 bg-ivory/5 border border-ivory/10 rounded-xl text-ivory placeholder:text-ivory/20 focus:outline-none focus:border-champagne/50 transition-colors resize-none"
                          placeholder={t("form.message_placeholder")}
                        />
                      </div>
                    </div>

                    <input type="hidden" name="appointmentDate" value={formData.date} />
                    <input type="hidden" name="appointmentTime" value={formData.time} />

                    {!formData.date || !formData.time ? (
                      <p className="text-sm text-ivory/40">Elegí una fecha y un horario en el calendario para poder agendar.</p>
                    ) : null}

                    {state?.error && (
                      <p className="text-sm text-ember" role="alert">{state.error}</p>
                    )}

                    <button
                      type="submit"
                      disabled={pending || !formData.date || !formData.time}
                      className="w-full px-8 py-4 bg-gradient-to-r from-champagne-dark via-champagne to-champagne-light text-obsidian font-medium rounded-xl transition-all duration-300 flex items-center justify-center gap-2 hover:luxury-glow-strong disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Calendar size={18} />
                      {pending ? "Enviando..." : t("form.submit")}
                    </button>
                  </form>
                )}
              </div>
            </AnimatedSection>

            {/* Calendar */}
            <AnimatedSection direction="right" delay={0.2}>
              <div className="glass-card rounded-2xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <button onClick={prevMonth} className="p-2 hover:bg-ivory/5 rounded-lg transition-colors text-ivory/60">
                    <ChevronLeft size={20} />
                  </button>
                  <h3 className="font-heading text-xl text-ivory">
                    {monthNames[selectedMonth.getMonth()]} {selectedMonth.getFullYear()}
                  </h3>
                  <button onClick={nextMonth} className="p-2 hover:bg-ivory/5 rounded-lg transition-colors text-ivory/60">
                    <ChevronRight size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-2">
                  {dayNames.map((day) => (
                    <div key={day} className="text-center text-sm font-medium text-ivory/30 py-2">{day}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-10" />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const isSelected = formData.date === `${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const isToday = new Date().getDate() === day && new Date().getMonth() === selectedMonth.getMonth() && new Date().getFullYear() === selectedMonth.getFullYear();
                    const isPast = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), day) < new Date(new Date().setHours(0, 0, 0, 0));

                    return (
                      <button
                        key={day} disabled={isPast}
                        onClick={() => setFormData({ ...formData, date: `${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}` })}
                        className={`h-10 rounded-lg text-sm font-medium transition-all ${
                          isPast ? "text-ivory/10 cursor-not-allowed"
                          : isSelected ? "bg-gradient-to-r from-champagne-dark via-champagne to-champagne-light text-obsidian"
                          : isToday ? "bg-champagne/10 text-champagne border border-champagne/20"
                          : "text-ivory/60 hover:bg-ivory/5"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-8">
                  <h4 className="font-heading text-lg text-ivory mb-4 flex items-center gap-2">
                    <Clock size={18} className="text-champagne" />
                    {t("calendar.available_hours")}
                  </h4>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                    {availableTimes.map((time) => (
                      <button
                        key={time}
                        onClick={() => setFormData({ ...formData, time })}
                        className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                          formData.time === time
                            ? "bg-gradient-to-r from-champagne-dark via-champagne to-champagne-light text-obsidian"
                            : "bg-ivory/5 text-ivory/60 hover:bg-ivory/10 border border-ivory/10"
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </div>
  );
}
