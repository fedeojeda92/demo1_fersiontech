"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { Menu, X, Phone, Mail, ChevronDown, Globe } from "lucide-react";

const localeLabels: Record<string, string> = { es: "ES", en: "EN", ru: "RU" };

export default function Navbar() {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = useLocale();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    return scrollY.on("change", (latest) => {
      setIsScrolled(latest > 50);
    });
  }, [scrollY]);

  const navLinks = [
    { href: "/", label: t("home") },
    { href: "/propiedades", label: t("properties") },
    { href: "/turnos", label: t("appointments") },
    { href: "/nosotros", label: t("about") },
    { href: "/contacto", label: t("contact") },
  ];

  const switchLocale = (locale: string) => {
    const pathParts = pathname.split("/");
    let pathWithoutLocale = pathname;
    if (pathParts.length > 1 && routing.locales.includes(pathParts[1] as any)) {
      pathWithoutLocale = "/" + pathParts.slice(2).join("/");
    }
    router.push(pathWithoutLocale, { locale });
    setIsLangOpen(false);
  };

  return (
    <>
      {/* Top bar - only visible when not scrolled */}
      <motion.div
        className="bg-obsidian border-b border-champagne/10 hidden md:block"
        initial={{ y: 0 }}
        animate={{ y: isScrolled ? -40 : 0, opacity: isScrolled ? 0 : 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-2 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <a href="tel:+541155550100" className="flex items-center gap-2 text-ivory/50 hover:text-champagne transition-colors text-xs tracking-wider">
              <Phone size={12} />
              <span>+54 11 5555-0100</span>
            </a>
            <a href="mailto:info@fsinmobiliaria.com.ar" className="flex items-center gap-2 text-ivory/50 hover:text-champagne transition-colors text-xs tracking-wider">
              <Mail size={12} />
              <span>info@fsinmobiliaria.com.ar</span>
            </a>
          </div>
          <div className="text-ivory/30 text-xs tracking-wider">{t("hours")}</div>
        </div>
      </motion.div>

      {/* Main navbar */}
      <motion.header
        className={`sticky top-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "glass-luxury shadow-2xl shadow-black/30"
            : "bg-transparent"
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-11 h-11 bg-gradient-to-br from-champagne-dark via-champagne to-champagne-light rounded-lg flex items-center justify-center transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-500">
                  <span className="text-obsidian font-heading text-xl font-bold">FS</span>
                </div>
                <div className="absolute -inset-2 bg-champagne/10 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <div className="hidden sm:block">
                <h1 className="font-heading text-lg text-ivory tracking-widest">FS</h1>
                <p className="text-[9px] uppercase tracking-[0.4em] text-champagne/70">{tCommon("brand_suffix")}</p>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-4 py-2 text-[13px] font-medium tracking-wide uppercase transition-colors duration-300 ${
                      isActive ? "text-champagne" : "text-ivory/60 hover:text-ivory"
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <motion.div
                        className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-champagne to-transparent"
                        layoutId="navActive"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right section */}
            <div className="flex items-center gap-4">
              {/* Language switcher */}
              <div className="relative">
                <button
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-ivory/60 hover:text-champagne transition-colors border border-ivory/10 rounded-lg hover:border-champagne/30"
                >
                  <Globe size={14} />
                  <span>{localeLabels[currentLocale]}</span>
                  <ChevronDown size={12} className={`transition-transform ${isLangOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {isLangOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full mt-2 glass-luxury rounded-xl shadow-2xl overflow-hidden z-50 min-w-[120px]"
                    >
                      {routing.locales.map((locale) => (
                        <button
                          key={locale}
                          onClick={() => switchLocale(locale)}
                          className={`w-full px-4 py-2.5 text-sm text-left transition-colors ${
                            currentLocale === locale
                              ? "bg-champagne/10 text-champagne"
                              : "text-ivory/70 hover:bg-ivory/5"
                          }`}
                        >
                          {locale === "es" && "🇪🇸 Español"}
                          {locale === "en" && "🇬🇧 English"}
                          {locale === "ru" && "🇷🇺 Русский"}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* CTA */}
              <Link
                href="/turnos"
                className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-champagne-dark via-champagne to-champagne-light text-obsidian text-xs font-semibold uppercase tracking-wider rounded-lg hover:luxury-glow-strong transition-all duration-300 hover:scale-105"
              >
                {t("sell")}
              </Link>

              {/* Mobile toggle */}
              <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="lg:hidden p-2 text-ivory hover:text-champagne transition-colors"
              >
                {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 top-20 md:top-[calc(5rem+2.5rem)] z-40 bg-obsidian/98 backdrop-blur-2xl border-t border-champagne/10 shadow-2xl shadow-black/60 lg:hidden max-h-[calc(100dvh-5rem)] overflow-y-auto"
          >
            <nav className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-1">
              {navLinks.map((link, i) => {
                const isActive = pathname === link.href;
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={`flex items-center px-5 py-4 rounded-xl text-lg tracking-wide transition-all ${
                        isActive
                          ? "bg-champagne/10 text-champagne border-l-2 border-champagne"
                          : "text-ivory/70 hover:text-ivory hover:bg-ivory/5"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                );
              })}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: navLinks.length * 0.06 }}
                className="mt-6 pt-6 border-t border-ivory/10"
              >
                <Link
                  href="/turnos"
                  onClick={() => setIsMobileOpen(false)}
                  className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-gradient-to-r from-champagne-dark via-champagne to-champagne-light text-obsidian font-semibold uppercase tracking-wider rounded-xl"
                >
                  {t("sell")}
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
