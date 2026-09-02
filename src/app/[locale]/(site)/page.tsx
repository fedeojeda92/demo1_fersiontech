import { getTranslations } from "next-intl/server";
import Hero from "@/components/Hero";
import PropertySearch from "@/components/PropertySearch";
import FeaturedProperties from "@/components/FeaturedProperties";
import WhyChooseUs from "@/components/WhyChooseUs";
import ZonesSection from "@/components/ZonesSection";
import CTASection from "@/components/CTASection";
import { getProperties, getFeaturedProperties } from "@/lib/data/properties";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
    },
  };
}

export default async function HomePage() {
  const [allProperties, featuredProperties] = await Promise.all([
    getProperties(),
    getFeaturedProperties(),
  ]);

  return (
    <>
      <Hero properties={allProperties} />
      <PropertySearch />
      <FeaturedProperties featuredProperties={featuredProperties} />
      <WhyChooseUs />
      <ZonesSection />
      <CTASection />
    </>
  );
}
