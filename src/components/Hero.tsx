"use client";

import { Fragment, useState, useEffect, useMemo, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { RevealText } from "./AnimatedSection";
import { zones, propertyTypes, type Property } from "@/lib/properties";
import { Search, ArrowRight, Play, ChevronDown, MapPin, Sparkles, Building2 } from "lucide-react";

type Suggestion =
  | { kind: "property"; label: string; sub: string; href: string }
  | { kind: "zone"; label: string; href: string }
  | { kind: "type"; label: string; href: string };

const heroImages = [
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&h=1080&fit=crop",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&h=1080&fit=crop",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&h=1080&fit=crop",
];

export default function Hero({ properties }: { properties: Property[] }) {
  const t = useTranslations("hero");
  const locale = useLocale() as "es" | "en" | "ru";
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 0.3], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.25], [1, 1.1]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const suggestions = useMemo<Suggestion[]>(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const propertyMatches: Suggestion[] = properties
      .filter((p) => p.title[locale].toLowerCase().includes(q) || p.zone.toLowerCase().includes(q))
      .slice(0, 4)
      .map((p) => ({ kind: "property", label: p.title[locale], sub: p.zone, href: `/propiedades/${p.slug}` }));

    const zoneMatches: Suggestion[] = zones
      .filter((z) => z.toLowerCase().includes(q))
      .slice(0, 3)
      .map((z) => ({ kind: "zone", label: z, href: `/propiedades?zone=${encodeURIComponent(z)}` }));

    const typeMatches: Suggestion[] = propertyTypes
      .filter((pt) => pt.label[locale].toLowerCase().includes(q))
      .slice(0, 3)
      .map((pt) => ({ kind: "type", label: pt.label[locale], href: `/propiedades?type=${pt.value}` }));

    return [...propertyMatches, ...zoneMatches, ...typeMatches].slice(0, 7);
  }, [searchQuery, locale, properties]);

  const handleSuggestionClick = () => {
    setSearchQuery("");
    setShowSuggestions(false);
  };

  const handleSearchSubmit = () => {
    setShowSuggestions(false);
    router.push(searchQuery.trim() ? `/propiedades?q=${encodeURIComponent(searchQuery.trim())}` : "/propiedades");
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background images with crossfade */}
      <motion.div className="absolute inset-0" style={{ y, scale }}>
        <AnimatePresence mode="sync">
          <motion.div
            key={currentImage}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${heroImages[currentImage]}')` }}
            />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-obsidian/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian/90 via-obsidian/50 to-obsidian/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-obsidian/40" />
      </motion.div>

      {/* Film grain */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Decorative orbs */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-champagne/[0.04] rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-champagne/[0.03] rounded-full blur-[100px]" />

      {/* Left vertical gold line */}
      <motion.div
        className="absolute left-8 md:left-16 top-0 w-px bg-gradient-to-b from-transparent via-champagne/40 to-transparent"
        initial={{ height: 0 }}
        animate={{ height: "40%" }}
        transition={{ duration: 2, delay: 1, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* Right vertical gold line */}
      <motion.div
        className="absolute right-8 md:right-16 bottom-0 w-px bg-gradient-to-t from-transparent via-champagne/40 to-transparent"
        initial={{ height: 0 }}
        animate={{ height: "30%" }}
        transition={{ duration: 2, delay: 1.5, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* Content */}
      <motion.div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-24 sm:py-32 w-full flex flex-col items-center text-center" style={{ opacity }}>
        {/* Tagline */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8 px-4 max-w-full"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="hidden sm:block w-8 h-px bg-gradient-to-r from-transparent to-champagne shrink-0" />
          <span className="text-champagne text-[9px] sm:text-[10px] font-medium tracking-[0.15em] sm:tracking-[0.4em] uppercase flex items-center gap-2 text-center">
            <Sparkles size={12} className="shrink-0" />
            {t("tagline")}
          </span>
          <div className="hidden sm:block w-8 h-px bg-gradient-to-l from-transparent to-champagne shrink-0" />
        </motion.div>

        {/* Title */}
        <div className="mb-8">
          <RevealText delay={0.5}>
            <span className="font-heading text-[clamp(1rem,2vw,1.25rem)] text-ivory/40 italic tracking-wide block mb-3">
              {t("title_kicker")}
            </span>
          </RevealText>

          <RevealText delay={0.7}>
            <h1 className="font-heading text-[clamp(3.5rem,9vw,7.5rem)] leading-[1.2] tracking-[-0.01em] text-gradient-gold-wide">
              {t("title_main")}
            </h1>
          </RevealText>

          <RevealText delay={0.9}>
            <p className="font-body text-[clamp(1.1rem,3.5vw,2rem)] font-light text-ivory/60 uppercase tracking-[0.15em] sm:tracking-[0.25em] md:tracking-[0.35em] mt-4">
              {t("title_sub")}
            </p>
          </RevealText>

          <motion.div
            className="flex items-center justify-center gap-4 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.05, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="w-8 h-px bg-ivory/15" />
            <span className="flex items-center gap-2 text-ivory/25 text-[10px] tracking-[0.3em] uppercase font-light">
              <div className="w-1.5 h-1.5 rounded-full bg-champagne/40" />
              {t("since")}
            </span>
            <div className="w-8 h-px bg-ivory/15" />
          </motion.div>
        </div>

        {/* Subtitle */}
        <motion.p
          className="text-base md:text-lg text-ivory/35 mb-12 leading-relaxed max-w-xl text-balance"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {t("subtitle")}
        </motion.p>

        {/* Search bar */}
        <motion.div
          ref={searchRef}
          className="relative w-full max-w-2xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="glass-luxury rounded-2xl p-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex-1 flex items-center gap-3 px-5 py-4 min-w-0">
                <Search size={18} className="text-champagne/50 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearchSubmit();
                  }}
                  placeholder={t("search_placeholder")}
                  className="flex-1 min-w-0 bg-transparent text-ivory placeholder:text-ivory/25 focus:outline-none text-sm"
                />
              </div>
              <button
                onClick={handleSearchSubmit}
                className="px-6 py-4 bg-gradient-to-r from-champagne-dark via-champagne to-champagne-light text-obsidian font-semibold rounded-xl hover:luxury-glow-strong transition-all duration-300 flex items-center justify-center gap-2 group text-xs uppercase tracking-wider w-full sm:w-auto"
              >
                {t("cta_primary")}
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Suggestions dropdown */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 right-0 mt-2 glass-luxury rounded-2xl overflow-hidden z-50 text-left shadow-2xl shadow-black/40"
              >
                {suggestions.map((s, i) => (
                  <Link
                    key={`${s.kind}-${s.label}-${i}`}
                    href={s.href}
                    onClick={handleSuggestionClick}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-champagne/10 transition-colors border-b border-ivory/5 last:border-b-0"
                  >
                    <div className="w-8 h-8 rounded-full bg-champagne/10 flex items-center justify-center shrink-0 text-champagne">
                      {s.kind === "property" && <Search size={14} />}
                      {s.kind === "zone" && <MapPin size={14} />}
                      {s.kind === "type" && <Building2 size={14} />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-ivory text-sm truncate">{s.label}</p>
                      <p className="text-ivory/30 text-[11px] uppercase tracking-wider">
                        {s.kind === "property" && s.sub}
                        {s.kind === "zone" && t("suggestions_zones")}
                        {s.kind === "type" && t("suggestions_types")}
                      </p>
                    </div>
                  </Link>
                ))}
              </motion.div>
            )}
            {showSuggestions && searchQuery.trim() && suggestions.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 right-0 mt-2 glass-luxury rounded-2xl px-5 py-4 z-50 text-left"
              >
                <p className="text-ivory/30 text-sm">{t("no_suggestions")}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Bottom CTAs */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-6 mt-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link
            href="/turnos"
            className="flex items-center gap-3 text-ivory/40 hover:text-champagne transition-colors group"
          >
            <div className="w-10 h-10 rounded-full border border-champagne/20 flex items-center justify-center group-hover:bg-champagne/10 group-hover:border-champagne/40 transition-all">
              <Play size={12} fill="currentColor" className="text-champagne" />
            </div>
            <span className="text-xs font-medium tracking-wider uppercase">{t("cta_secondary")}</span>
          </Link>

          <div className="h-6 w-px bg-ivory/10 hidden md:block" />

          <div className="hidden md:flex items-center gap-3 text-ivory/25">
            <div className="w-10 h-10 rounded-full border border-ivory/10 flex items-center justify-center">
              <span className="text-champagne font-heading text-[10px]">360°</span>
            </div>
            <span className="text-xs tracking-wider">{t("virtual_tour_badge")}</span>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          className="flex items-center justify-center gap-6 sm:gap-10 md:gap-16 mt-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {[
            { value: "200+", label: t("stat_properties") },
            { value: "15+", label: t("stat_years") },
            { value: "98%", label: t("stat_satisfaction") },
          ].map((stat, i) => (
            <Fragment key={stat.label}>
              <motion.div className="text-center group" whileHover={{ y: -4 }}>
                <p className="font-heading text-2xl md:text-3xl text-champagne/70 mb-0.5">{stat.value}</p>
                <p className="text-ivory/20 text-[10px] tracking-[0.3em] uppercase">{stat.label}</p>
              </motion.div>
              {i < 2 && <div className="h-8 w-px bg-ivory/10" />}
            </Fragment>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="text-ivory/20 text-[9px] uppercase tracking-[0.4em]">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-champagne/40 to-transparent" />
      </motion.div>

      {/* Image indicators */}
      <div className="absolute bottom-10 right-10 hidden md:flex gap-2">
        {heroImages.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentImage(i)}
            className={`h-0.5 rounded-full transition-all duration-500 ${
              currentImage === i ? "w-8 bg-champagne" : "w-4 bg-ivory/15 hover:bg-ivory/30"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
