"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Property } from "@/lib/properties";
import { BedDouble, Bath, Maximize, Car, MapPin, Eye, Video, Star } from "lucide-react";
import { useState } from "react";

interface PropertyCardProps {
  property: Property;
  index?: number;
}

export default function PropertyCard({ property, index = 0 }: PropertyCardProps) {
  const t = useTranslations("property");
  const tFeatured = useTranslations("featured");
  const locale = useLocale() as "es" | "en" | "ru";
  const title = property.title[locale];
  const [isHovered, setIsHovered] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  const formatPrice = (price: number, currency: string) => {
    return `${currency === "USD" ? "U$S" : "$"} ${price.toLocaleString("es-AR")}`;
  };

  return (
    <motion.div
      className="group relative rounded-2xl overflow-hidden glass-card glass-card-hover transition-all duration-500"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -8 }}
    >
      {/* Image section */}
      <div className="relative h-72 overflow-hidden">
        <motion.div
          className="absolute inset-0"
          animate={{ scale: isHovered ? 1.08 : 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <Image
            src={property.images[currentImage]}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px"
            quality={85}
            className="object-cover"
          />
        </motion.div>
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/20 to-transparent" />

        {/* Featured badge */}
        {property.featured && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 bg-champagne/90 text-obsidian text-[10px] font-bold tracking-widest uppercase rounded-full"
          >
            <Star size={10} fill="currentColor" />
            {tFeatured("featured")}
          </motion.div>
        )}

        {/* Operation badge */}
        <div className="absolute top-4 right-4 px-3 py-1.5 bg-obsidian/70 backdrop-blur-sm text-ivory/80 text-[10px] font-medium tracking-wider uppercase rounded-full border border-ivory/10">
          {property.operation === "venta" ? t("sale") : t("rent")}
        </div>

        {/* Virtual tour / Drone badges */}
        <div className="absolute bottom-16 left-4 flex gap-2">
          {property.hasVirtualTour && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-champagne/20 backdrop-blur-sm text-champagne text-[10px] font-medium tracking-wider rounded-full border border-champagne/20">
              <Eye size={10} />
              360°
            </div>
          )}
          {property.hasDroneVideo && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-champagne/20 backdrop-blur-sm text-champagne text-[10px] font-medium tracking-wider rounded-full border border-champagne/20">
              <Video size={10} />
              DRONE
            </div>
          )}
        </div>

        {/* Image dots */}
        <div className="absolute bottom-4 left-4 flex gap-1.5">
          {property.images.slice(0, 4).map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.preventDefault(); setCurrentImage(i); }}
              className={`h-0.5 rounded-full transition-all duration-400 ${
                currentImage === i ? "w-6 bg-champagne" : "w-2 bg-ivory/30 hover:bg-ivory/50"
              }`}
            />
          ))}
        </div>

        {/* Hover overlay with CTA */}
        <motion.div
          className="absolute inset-0 bg-obsidian/50 backdrop-blur-[2px] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link
            href={`/propiedades/${property.slug}`}
            className="px-8 py-3.5 bg-champagne text-obsidian font-semibold text-sm tracking-wider uppercase rounded-xl transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 hover:luxury-glow"
          >
            {tFeatured("view_details")}
          </Link>
        </motion.div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Location */}
        <div className="flex items-center gap-1.5 text-champagne/70 text-xs tracking-wider uppercase mb-2">
          <MapPin size={12} />
          <span>{property.zone}</span>
        </div>

        {/* Title */}
        <h3 className="font-heading text-xl text-ivory mb-2 line-clamp-2 group-hover:text-champagne transition-colors duration-300">
          {title}
        </h3>

        {/* Address */}
        <p className="text-ivory/40 text-sm mb-4 line-clamp-1">{property.address}</p>

        {/* Features */}
        <div className="flex items-center gap-4 pb-4 border-b border-ivory/10">
          {property.bedrooms > 0 && (
            <div className="flex items-center gap-1.5 text-ivory/50 text-sm">
              <BedDouble size={14} className="text-champagne/60" />
              <span>{property.bedrooms}</span>
            </div>
          )}
          {property.bathrooms > 0 && (
            <div className="flex items-center gap-1.5 text-ivory/50 text-sm">
              <Bath size={14} className="text-champagne/60" />
              <span>{property.bathrooms}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-ivory/50 text-sm">
            <Maximize size={14} className="text-champagne/60" />
            <span>{property.area} m²</span>
          </div>
          {property.garage > 0 && (
            <div className="flex items-center gap-1.5 text-ivory/50 text-sm">
              <Car size={14} className="text-champagne/60" />
              <span>{property.garage}</span>
            </div>
          )}
        </div>

        {/* Price and CTA */}
        <div className="flex items-center justify-between mt-4">
          <div>
            <p className="text-[10px] text-ivory/30 uppercase tracking-widest mb-0.5">{t("price")}</p>
            <p className="font-heading text-2xl text-ivory">{formatPrice(property.price, property.currency)}</p>
          </div>
          <a
            href={`https://wa.me/5491155550100?text=Me interesa la propiedad: ${title}`}
            target="_blank"
            className="px-4 py-2.5 bg-emerald/20 text-emerald text-xs font-semibold rounded-lg hover:bg-emerald/30 transition-colors flex items-center gap-2 border border-emerald/20"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            WhatsApp
          </a>
        </div>
      </div>
    </motion.div>
  );
}
