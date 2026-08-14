"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import AnimatedSection, { StaggerContainer, StaggerItem } from "./AnimatedSection";
import { MapPin, Phone, Mail, Clock, ArrowUp } from "lucide-react";
import { useState } from "react";

function InstagramIcon({ size = 18 }: { size?: number }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>);
}
function FacebookIcon({ size = 18 }: { size?: number }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>);
}
function LinkedinIcon({ size = 18 }: { size?: number }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>);
}
function YoutubeIcon({ size = 18 }: { size?: number }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" /><path d="m10 15 5-3-5-3z" /></svg>);
}

export default function Footer() {
  const t = useTranslations("footer");
  const tCommon = useTranslations("common");
  const tNav = useTranslations("nav");
  const tContact = useTranslations("contact");
  const [email, setEmail] = useState("");
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const socialLinks = [
    { icon: InstagramIcon, href: "#", label: "Instagram" },
    { icon: FacebookIcon, href: "#", label: "Facebook" },
    { icon: LinkedinIcon, href: "#", label: "LinkedIn" },
    { icon: YoutubeIcon, href: "#", label: "YouTube" },
  ];

  return (
    <footer className="bg-obsidian relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-champagne/20 to-transparent" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-champagne/[0.02] rounded-full blur-[150px]" />

      {/* Newsletter */}
      <div className="border-b border-ivory/5">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <AnimatedSection>
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div>
                <h3 className="font-heading text-2xl md:text-3xl text-ivory mb-2">{t("newsletter_title")}</h3>
                <p className="text-ivory/40">{t("newsletter_desc")}</p>
              </div>
              <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-2 sm:gap-0">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("newsletter_placeholder")}
                  className="flex-1 min-w-0 lg:w-80 px-6 py-4 bg-ivory/5 border border-ivory/10 rounded-xl sm:rounded-l-xl sm:rounded-r-none text-ivory placeholder:text-ivory/30 focus:outline-none focus:border-champagne/50 transition-colors text-sm"
                />
                <button className="px-8 py-4 bg-gradient-to-r from-champagne-dark via-champagne to-champagne-light text-obsidian font-semibold rounded-xl sm:rounded-l-none sm:rounded-r-xl hover:luxury-glow-strong transition-all duration-300 text-sm uppercase tracking-wider shrink-0">
                  {t("newsletter_btn")}
                </button>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <StaggerItem>
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 bg-gradient-to-br from-champagne-dark via-champagne to-champagne-light rounded-lg flex items-center justify-center">
                  <span className="text-obsidian font-heading text-xl font-bold">FS</span>
                </div>
                <div>
                  <h4 className="font-heading text-lg text-ivory tracking-widest">FS</h4>
                  <p className="text-[9px] uppercase tracking-[0.4em] text-champagne/60">{tCommon("brand_suffix")}</p>
                </div>
              </div>
              <p className="text-ivory/40 text-sm leading-relaxed mb-6">{t("description")}</p>
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <a key={social.label} href={social.href} aria-label={social.label}
                    className="w-10 h-10 rounded-lg bg-ivory/5 flex items-center justify-center text-ivory/40 hover:bg-champagne/10 hover:text-champagne transition-all duration-300 border border-ivory/5 hover:border-champagne/20">
                    <social.icon size={16} />
                  </a>
                ))}
              </div>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div>
              <h4 className="font-heading text-lg text-ivory mb-6">{t("quick_links")}</h4>
              <ul className="space-y-3">
                {[
                  { href: "/propiedades", label: t("buy") },
                  { href: "/propiedades?op=alquiler", label: t("rent_property") },
                  { href: "/turnos", label: t("sell_property") },
                  { href: "/nosotros", label: tNav("about") },
                  { href: "/contacto", label: tNav("contact") },
                ].map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-ivory/40 hover:text-champagne text-sm transition-colors duration-300 flex items-center gap-2 group">
                      <span className="w-0 group-hover:w-3 h-px bg-champagne transition-all duration-300" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div>
              <h4 className="font-heading text-lg text-ivory mb-6">{t("services")}</h4>
              <ul className="space-y-3">
                {[t("valuation"), t("administration"), t("legal_advice")].map((service, i) => (
                  <li key={i}>
                    <span className="text-ivory/40 text-sm flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-champagne/60" />
                      {service}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div>
              <h4 className="font-heading text-lg text-ivory mb-6">{tNav("contact")}</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <MapPin size={16} className="text-champagne/60 mt-0.5 shrink-0" />
                  <span className="text-ivory/40 text-sm">{tContact("info.address_value")}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={16} className="text-champagne/60 shrink-0" />
                  <a href="tel:+541155550100" className="text-ivory/40 text-sm hover:text-champagne transition-colors">+54 11 5555-0100</a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={16} className="text-champagne/60 shrink-0" />
                  <a href="mailto:info@fsinmobiliaria.com.ar" className="text-ivory/40 text-sm hover:text-champagne transition-colors">info@fsinmobiliaria.com.ar</a>
                </li>
                <li className="flex items-start gap-3">
                  <Clock size={16} className="text-champagne/60 mt-0.5 shrink-0" />
                  <span className="text-ivory/40 text-sm">{t("hours_value")}</span>
                </li>
              </ul>
            </div>
          </StaggerItem>
        </StaggerContainer>
      </div>

      {/* Bottom */}
      <div className="border-t border-ivory/5">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-ivory/20 text-xs tracking-wider">{t("copyright")}</p>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-ivory/20 text-xs hover:text-champagne transition-colors">{t("terms")}</Link>
            <Link href="#" className="text-ivory/20 text-xs hover:text-champagne transition-colors">{t("privacy")}</Link>
          </div>
        </div>
      </div>

      {/* Back to top */}
      <motion.button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 w-12 h-12 bg-champagne/20 backdrop-blur-sm text-champagne rounded-full flex items-center justify-center z-40 hover:bg-champagne/30 transition-all border border-champagne/20"
        whileHover={{ scale: 1.1, y: -4 }}
        whileTap={{ scale: 0.95 }}
      >
        <ArrowUp size={18} />
      </motion.button>
    </footer>
  );
}
