"use client";

import { use, useState } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { properties, propertyTypes } from "@/lib/properties";
import AnimatedSection, { StaggerContainer, StaggerItem } from "@/components/AnimatedSection";
import VirtualTour360 from "@/components/VirtualTour360";
import {
  BedDouble,
  Bath,
  Maximize,
  Car,
  Calendar,
  MapPin,
  Share2,
  Heart,
  ArrowLeft,
  Eye,
  Video,
  ChevronLeft,
  ChevronRight,
  Phone,
  MessageCircle,
} from "lucide-react";

export default function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations("property");
  const tNav = useTranslations("nav");
  const tFeatured = useTranslations("featured");
  const locale = useLocale() as "es" | "en" | "ru";
  const [currentImage, setCurrentImage] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [activeTab, setActiveTab] = useState<"tour" | "photos">("tour");

  const property = properties.find((p) => p.slug === id || p.id === id);

  if (!property) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-heading text-3xl text-ivory mb-4">{t("not_found")}</h1>
          <Link href="/propiedades" className="px-6 py-3 bg-gradient-to-r from-champagne-dark via-champagne to-champagne-light text-obsidian rounded-xl font-medium">
            {tNav("properties")}
          </Link>
        </div>
      </div>
    );
  }

  const title = property.title[locale];
  const typeLabel = propertyTypes.find((pt) => pt.value === property.type)?.label[locale] ?? property.type;

  const formatPrice = (price: number, currency: string) => {
    return `${currency === "USD" ? "U$S" : "$"} ${price.toLocaleString("es-AR")}`;
  };

  const similarProperties = properties
    .filter((p) => p.id !== property.id && (p.zone === property.zone || p.type === property.type))
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-obsidian">
      {/* Breadcrumb */}
      <div className="bg-obsidian border-b border-ivory/5">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-ivory/30">
            <Link href="/" className="hover:text-champagne transition-colors">{tNav("home")}</Link>
            <span>/</span>
            <Link href="/propiedades" className="hover:text-champagne transition-colors">{tNav("properties")}</Link>
            <span>/</span>
            <span className="text-ivory/60">{title}</span>
          </div>
        </div>
      </div>

      {/* Gallery */}
      <section className="relative">
        {property.tour360 && (
          <div className="bg-obsidian border-b border-ivory/5">
            <div className="max-w-7xl mx-auto px-6 pt-4 flex gap-3">
              <button
                onClick={() => setActiveTab("tour")}
                className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all border ${
                  activeTab === "tour"
                    ? "bg-champagne text-obsidian border-champagne"
                    : "text-ivory/50 border-ivory/10 hover:text-champagne hover:border-champagne/30"
                }`}
              >
                {t("tab_tour")}
              </button>
              <button
                onClick={() => setActiveTab("photos")}
                className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all border ${
                  activeTab === "photos"
                    ? "bg-champagne text-obsidian border-champagne"
                    : "text-ivory/50 border-ivory/10 hover:text-champagne hover:border-champagne/30"
                }`}
              >
                {t("tab_photos")}
              </button>
            </div>
          </div>
        )}

        {property.tour360 && activeTab === "tour" ? (
          <VirtualTour360 tour={property.tour360} />
        ) : (
          <>
            <div className="h-[60vh] md:h-[70vh] relative overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImage}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5 }}
                >
                  <Image
                    src={property.images[currentImage]}
                    alt={title}
                    fill
                    sizes="100vw"
                    quality={85}
                    priority={currentImage === 0}
                    className="object-cover"
                  />
                </motion.div>
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/20 to-obsidian/40" />

              <button
                onClick={() => setCurrentImage(currentImage === 0 ? property.images.length - 1 : currentImage - 1)}
                className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-ivory/10 backdrop-blur-sm rounded-full flex items-center justify-center text-ivory hover:bg-ivory/20 transition-colors border border-ivory/10"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setCurrentImage(currentImage === property.images.length - 1 ? 0 : currentImage + 1)}
                className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-ivory/10 backdrop-blur-sm rounded-full flex items-center justify-center text-ivory hover:bg-ivory/20 transition-colors border border-ivory/10"
              >
                <ChevronRight size={20} />
              </button>

              <div className="absolute bottom-6 left-6 px-4 py-2 bg-obsidian/80 backdrop-blur-sm text-ivory text-sm rounded-full border border-ivory/10">
                {currentImage + 1} / {property.images.length}
              </div>

              <div className="absolute bottom-6 right-6 flex gap-3">
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all border ${isLiked ? "bg-red-500 text-white border-red-500" : "bg-ivory/10 backdrop-blur-sm text-ivory hover:bg-ivory/20 border-ivory/10"}`}
                >
                  <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
                </button>
                <button className="w-12 h-12 bg-ivory/10 backdrop-blur-sm rounded-full flex items-center justify-center text-ivory hover:bg-ivory/20 transition-colors border border-ivory/10">
                  <Share2 size={20} />
                </button>
              </div>
            </div>

            {/* Thumbnail strip */}
            <div className="bg-obsidian border-b border-ivory/5">
              <div className="max-w-7xl mx-auto px-6 py-3">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {property.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImage(i)}
                      className={`relative shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${currentImage === i ? "border-champagne" : "border-ivory/10 opacity-50 hover:opacity-100"}`}
                    >
                      <Image src={img} alt={`Foto ${i + 1}`} fill sizes="80px" className="object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <AnimatedSection>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 bg-ivory/10 text-ivory text-xs font-medium rounded-full border border-ivory/10">
                    {property.operation === "venta" ? t("sale") : t("rent")}
                  </span>
                  <span className="px-3 py-1 bg-champagne/10 text-champagne text-xs font-medium rounded-full border border-champagne/20">
                    {typeLabel}
                  </span>
                  {property.featured && (
                    <span className="px-3 py-1 bg-champagne text-obsidian text-xs font-medium rounded-full">
                      {tFeatured("featured")}
                    </span>
                  )}
                </div>

                <h1 className="font-heading text-3xl md:text-4xl text-ivory mb-4">{title}</h1>

                <div className="flex items-center gap-2 text-ivory/50 mb-6">
                  <MapPin size={18} className="text-champagne" />
                  <span>{property.address}, {property.zone}</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {property.bedrooms > 0 && (
                    <div className="glass-card rounded-xl p-4 text-center">
                      <BedDouble size={24} className="text-champagne mx-auto mb-2" />
                      <p className="font-heading text-xl text-ivory">{property.bedrooms}</p>
                      <p className="text-ivory/40 text-sm">{t("bedrooms")}</p>
                    </div>
                  )}
                  {property.bathrooms > 0 && (
                    <div className="glass-card rounded-xl p-4 text-center">
                      <Bath size={24} className="text-champagne mx-auto mb-2" />
                      <p className="font-heading text-xl text-ivory">{property.bathrooms}</p>
                      <p className="text-ivory/40 text-sm">{t("bathrooms")}</p>
                    </div>
                  )}
                  <div className="glass-card rounded-xl p-4 text-center">
                    <Maximize size={24} className="text-champagne mx-auto mb-2" />
                    <p className="font-heading text-xl text-ivory">{property.area}</p>
                    <p className="text-ivory/40 text-sm">m²</p>
                  </div>
                  {property.garage > 0 && (
                    <div className="glass-card rounded-xl p-4 text-center">
                      <Car size={24} className="text-champagne mx-auto mb-2" />
                      <p className="font-heading text-xl text-ivory">{property.garage}</p>
                      <p className="text-ivory/40 text-sm">{t("garage")}</p>
                    </div>
                  )}
                </div>

                {(property.hasVirtualTour || property.hasDroneVideo) && (
                  <div className="flex gap-4 mb-8">
                    {property.hasVirtualTour && (
                      <div className="flex items-center gap-3 px-5 py-3 glass-card rounded-xl">
                        <Eye size={20} className="text-champagne" />
                        <div>
                          <p className="font-medium text-ivory text-sm">{t("virtual_tour_360")}</p>
                          <p className="text-ivory/40 text-xs">{t("tour_cta")}</p>
                        </div>
                      </div>
                    )}
                    {property.hasDroneVideo && (
                      <div className="flex items-center gap-3 px-5 py-3 glass-card rounded-xl">
                        <Video size={20} className="text-champagne" />
                        <div>
                          <p className="font-medium text-ivory text-sm">{t("drone_footage")}</p>
                          <p className="text-ivory/40 text-xs">{t("aerial_view")}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="glass-card rounded-2xl p-8 mb-8">
                  <h2 className="font-heading text-2xl text-ivory mb-4">{t("description")}</h2>
                  <p className="text-ivory/50 leading-relaxed">{property.description[locale]}</p>
                </div>

                <div className="glass-card rounded-2xl p-8">
                  <h2 className="font-heading text-2xl text-ivory mb-4">{t("features")}</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {property.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-ivory/50">
                        <span className="w-2 h-2 rounded-full bg-champagne" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </AnimatedSection>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <AnimatedSection delay={0.2}>
                <div className="sticky top-24">
                  <div className="glass-card rounded-2xl p-8 mb-6">
                    <p className="text-ivory/40 text-sm mb-1">{t("price")}</p>
                    <p className="font-heading text-4xl text-champagne mb-6">
                      {formatPrice(property.price, property.currency)}
                    </p>

                    <div className="space-y-3 mb-6">
                      <Link
                        href="/turnos"
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-champagne-dark via-champagne to-champagne-light text-obsidian font-medium rounded-xl transition-all duration-300 hover:luxury-glow-strong"
                      >
                        <Calendar size={18} />
                        {t("schedule_visit")}
                      </Link>
                      <a
                        href="tel:+541155550100"
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 border border-ivory/20 text-ivory font-medium rounded-xl hover:bg-ivory/5 transition-all"
                      >
                        <Phone size={18} />
                        {t("contact_agent")}
                      </a>
                      <a
                        href={`https://wa.me/5491155550100?text=Me interesa la propiedad: ${title}`}
                        target="_blank"
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-all"
                      >
                        <MessageCircle size={18} />
                        {t("whatsapp")}
                      </a>
                    </div>

                    <div className="text-center text-sm text-ivory/30">
                      <p>Ref: {property.id.padStart(6, "0")}</p>
                      <p>{t("year")}: {property.year}</p>
                    </div>
                  </div>

                  {/* Agent card */}
                  <div className="glass-card rounded-2xl p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-champagne-dark via-champagne to-champagne-light rounded-full flex items-center justify-center text-obsidian font-heading text-xl">
                        MG
                      </div>
                      <div>
                        <p className="font-medium text-ivory">Martín González</p>
                        <p className="text-ivory/40 text-sm">{t("agent_role")}</p>
                      </div>
                    </div>
                    <p className="text-ivory/40 text-sm mb-4">
                      {t("agent_bio", { zone: property.zone })}
                    </p>
                    <div className="flex gap-2">
                      <a
                        href="tel:+5491155550100"
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-ivory/5 text-ivory text-sm font-medium rounded-lg hover:bg-ivory/10 transition-colors border border-ivory/10"
                      >
                        <Phone size={14} />
                        {t("call")}
                      </a>
                      <a
                        href="https://wa.me/5491155550100"
                        target="_blank"
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        <MessageCircle size={14} />
                        WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>

      {/* Similar properties */}
      {similarProperties.length > 0 && (
        <section className="py-16 bg-obsidian border-t border-ivory/5">
          <div className="max-w-7xl mx-auto px-6">
            <AnimatedSection className="mb-12">
              <h2 className="font-heading text-3xl text-ivory">{t("similar_properties")}</h2>
            </AnimatedSection>
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {similarProperties.map((p) => (
                <StaggerItem key={p.id}>
                  <div className="glass-card rounded-2xl overflow-hidden group">
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={p.images[0]}
                        alt={p.title[locale]}
                        fill
                        sizes="(max-width: 1024px) 100vw, 400px"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-5">
                      <p className="text-champagne text-sm mb-1">{p.zone}</p>
                      <h3 className="font-heading text-lg text-ivory mb-2 line-clamp-1">{p.title[locale]}</h3>
                      <p className="font-heading text-xl text-champagne">{formatPrice(p.price, p.currency)}</p>
                      <Link
                        href={`/propiedades/${p.slug}`}
                        className="block mt-4 text-center px-4 py-2.5 border border-ivory/20 text-ivory text-sm font-medium rounded-lg hover:bg-ivory/5 transition-all"
                      >
                        {t("details")}
                      </Link>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>
      )}

      <div className="bg-obsidian py-8 border-t border-ivory/5">
        <div className="max-w-7xl mx-auto px-6">
          <Link href="/propiedades" className="inline-flex items-center gap-2 text-ivory/40 hover:text-champagne transition-colors">
            <ArrowLeft size={18} />
            Volver a Propiedades
          </Link>
        </div>
      </div>
    </div>
  );
}
