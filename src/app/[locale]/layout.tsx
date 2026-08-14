import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { NextIntlClientProvider, useMessages } from "next-intl";
import { getMessages } from "next-intl/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "../globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "FS Inmobiliaria | Propiedades de Lujo",
    template: "%s | FS Inmobiliaria",
  },
  description:
    "Propiedades exclusivas de lujo. Tour virtuales 360, fotografía HDR y video 4K. Encontrá tu propiedad ideal con FS Inmobiliaria.",
  keywords: [
    "inmobiliaria",
    "propiedades de lujo",
    "venta de departamentos",
    "alquiler",
    "Buenos Aires",
    "Puerto Madero",
    "Palermo",
    "tour virtual 360",
    "fotografía HDR",
    "video 4K",
  ],
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "FS Inmobiliaria",
    title: "FS Inmobiliaria | Propiedades de Lujo",
    description:
      "Propiedades exclusivas de lujo con tour virtual 360, fotografía HDR y video 4K.",
  },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${playfair.variable} ${inter.variable}`}>
      <body className="min-h-screen flex flex-col">
        <NextIntlClientProvider messages={messages}>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
