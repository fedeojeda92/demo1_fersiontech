"use client";

import { useState, useMemo, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import PropertyCard from "@/components/PropertyCard";
import AnimatedSection from "@/components/AnimatedSection";
import { properties, zones, propertyTypes } from "@/lib/properties";
import {
  Search,
  SlidersHorizontal,
  X,
  Grid3X3,
  List,
  MapPin,
} from "lucide-react";

export default function PropertiesPage() {
  const t = useTranslations("search");
  const tProperty = useTranslations("property");
  const locale = useLocale() as "es" | "en" | "ru";

  const [operation, setOperation] = useState<"venta" | "alquiler" | "">("");
  const [type, setType] = useState("");
  const [zone, setZone] = useState("");
  const [rooms, setRooms] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("featured");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const op = params.get("op");
    const t = params.get("type");
    const z = params.get("zone");
    const r = params.get("rooms");
    const q = params.get("q");
    if (op === "venta" || op === "alquiler") setOperation(op);
    if (t) setType(t);
    if (z) setZone(z);
    if (r) setRooms(r);
    if (q) setQuery(q);
  }, []);

  const filteredProperties = useMemo(() => {
    let filtered = [...properties];

    if (operation) {
      filtered = filtered.filter((p) => p.operation === operation);
    }
    if (type) {
      filtered = filtered.filter((p) => p.type === type);
    }
    if (zone) {
      filtered = filtered.filter((p) => p.zone === zone);
    }
    if (rooms) {
      filtered = filtered.filter((p) => p.bedrooms >= parseInt(rooms));
    }
    if (minPrice) {
      filtered = filtered.filter((p) => p.price >= parseInt(minPrice));
    }
    if (maxPrice) {
      filtered = filtered.filter((p) => p.price <= parseInt(maxPrice));
    }
    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title[locale].toLowerCase().includes(q) ||
          p.zone.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "area":
        filtered.sort((a, b) => b.area - a.area);
        break;
      case "featured":
      default:
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }

    return filtered;
  }, [operation, type, zone, rooms, minPrice, maxPrice, query, sortBy]);

  const clearFilters = () => {
    setOperation("");
    setType("");
    setZone("");
    setRooms("");
    setMinPrice("");
    setMaxPrice("");
    setQuery("");
  };

  const hasActiveFilters = operation || type || zone || rooms || minPrice || maxPrice || query;

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
            <p className="text-ivory/50 text-lg">
              {t("subtitle")}
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Filters and Results */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          {/* Filter bar */}
          <AnimatedSection delay={0.2}>
            <div className="glass-card rounded-2xl p-6 mb-8">
              <div className="flex flex-wrap items-center gap-4">
                {/* Operation tabs */}
                <div className="flex gap-2">
                  {[
                    { value: "", label: t("all") },
                    { value: "venta", label: t("sale") },
                    { value: "alquiler", label: t("rent") },
                  ].map((op) => (
                    <button
                      key={op.value}
                      onClick={() => setOperation(op.value as any)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        operation === op.value
                          ? "bg-gradient-to-r from-champagne-dark via-champagne to-champagne-light text-obsidian"
                          : "bg-ivory/5 text-ivory/60 hover:bg-ivory/10 border border-ivory/10"
                      }`}
                    >
                      {op.label}
                    </button>
                  ))}
                </div>

                <div className="h-6 w-px bg-ivory/10 hidden md:block" />

                {/* Type */}
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="px-4 py-2 bg-ivory/5 border border-ivory/10 rounded-lg text-sm text-ivory focus:outline-none focus:border-champagne/50 appearance-none cursor-pointer"
                >
                  <option value="" className="bg-obsidian">{t("all_types")}</option>
                  {propertyTypes.map((pt) => (
                    <option key={pt.value} value={pt.value} className="bg-obsidian">
                      {pt.label[locale]}
                    </option>
                  ))}
                </select>

                {/* Zone */}
                <select
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="px-4 py-2 bg-ivory/5 border border-ivory/10 rounded-lg text-sm text-ivory focus:outline-none focus:border-champagne/50 appearance-none cursor-pointer"
                >
                  <option value="" className="bg-obsidian">{t("all_zones")}</option>
                  {zones.map((z) => (
                    <option key={z} value={z} className="bg-obsidian">{z}</option>
                  ))}
                </select>

                {/* Rooms */}
                <select
                  value={rooms}
                  onChange={(e) => setRooms(e.target.value)}
                  className="px-4 py-2 bg-ivory/5 border border-ivory/10 rounded-lg text-sm text-ivory focus:outline-none focus:border-champagne/50 appearance-none cursor-pointer"
                >
                  <option value="" className="bg-obsidian">{t("all_rooms")}</option>
                  {[1, 2, 3, 4, 5].map((r) => (
                    <option key={r} value={r} className="bg-obsidian">{r}+</option>
                  ))}
                </select>

                <div className="h-6 w-px bg-ivory/10 hidden md:block" />

                {/* Advanced filters */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    showFilters
                      ? "bg-champagne text-obsidian"
                      : "bg-ivory/5 text-ivory/60 hover:bg-ivory/10 border border-ivory/10"
                  }`}
                >
                  <SlidersHorizontal size={16} />
                  {t("filters")}
                </button>

                {/* Clear */}
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 transition-colors"
                  >
                    <X size={16} />
                    {t("clear_filters")}
                  </button>
                )}

                <div className="ml-auto flex items-center gap-2">
                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 bg-ivory/5 border border-ivory/10 rounded-lg text-sm text-ivory focus:outline-none focus:border-champagne/50 appearance-none cursor-pointer"
                  >
                    <option value="featured" className="bg-obsidian">{t("sort_featured")}</option>
                    <option value="price-asc" className="bg-obsidian">{t("sort_price_asc")}</option>
                    <option value="price-desc" className="bg-obsidian">{t("sort_price_desc")}</option>
                    <option value="area" className="bg-obsidian">{t("sort_area")}</option>
                  </select>

                  {/* View modes */}
                  <div className="hidden md:flex gap-1 bg-ivory/5 rounded-lg p-1 border border-ivory/10">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded-md transition-colors ${
                        viewMode === "grid"
                          ? "bg-champagne text-obsidian"
                          : "text-ivory/40 hover:text-ivory"
                      }`}
                    >
                      <Grid3X3 size={16} />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded-md transition-colors ${
                        viewMode === "list"
                          ? "bg-champagne text-obsidian"
                          : "text-ivory/40 hover:text-ivory"
                      }`}
                    >
                      <List size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Advanced filters panel */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-6 mt-6 border-t border-ivory/10">
                      <div>
                        <label className="block text-sm font-medium text-ivory/40 mb-2">{t("min_price")}</label>
                        <input
                          type="number" value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                          placeholder="USD"
                          className="w-full px-4 py-2.5 bg-ivory/5 border border-ivory/10 rounded-lg text-sm text-ivory placeholder:text-ivory/20 focus:outline-none focus:border-champagne/50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-ivory/40 mb-2">{t("max_price")}</label>
                        <input
                          type="number" value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                          placeholder="USD"
                          className="w-full px-4 py-2.5 bg-ivory/5 border border-ivory/10 rounded-lg text-sm text-ivory placeholder:text-ivory/20 focus:outline-none focus:border-champagne/50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-ivory/40 mb-2">{t("min_area")}</label>
                        <input
                          type="number" placeholder="m²"
                          className="w-full px-4 py-2.5 bg-ivory/5 border border-ivory/10 rounded-lg text-sm text-ivory placeholder:text-ivory/20 focus:outline-none focus:border-champagne/50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-ivory/40 mb-2">{t("max_area")}</label>
                        <input
                          type="number" placeholder="m²"
                          className="w-full px-4 py-2.5 bg-ivory/5 border border-ivory/10 rounded-lg text-sm text-ivory placeholder:text-ivory/20 focus:outline-none focus:border-champagne/50"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </AnimatedSection>

          {/* Results count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-ivory/40">
              {t("results", { count: filteredProperties.length })}
            </p>
          </div>

          {/* Properties grid */}
          {filteredProperties.length > 0 ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                  : "flex flex-col gap-6"
              }
            >
              {filteredProperties.map((property, index) => (
                <PropertyCard key={property.id} property={property} index={index} />
              ))}
            </div>
          ) : (
            <AnimatedSection className="text-center py-20">
              <div className="w-20 h-20 bg-champagne/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-champagne/20">
                <MapPin size={32} className="text-champagne" />
              </div>
              <h3 className="font-heading text-2xl text-ivory mb-3">{t("no_results")}</h3>
              <p className="text-ivory/40 mb-6">{t("try_different_filters")}</p>
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-gradient-to-r from-champagne-dark via-champagne to-champagne-light text-obsidian font-medium rounded-xl transition-all hover:luxury-glow-strong"
              >
                {t("clear_filters")}
              </button>
            </AnimatedSection>
          )}
        </div>
      </section>
    </div>
  );
}
