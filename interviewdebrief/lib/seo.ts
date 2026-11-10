import type { Metadata } from "next";
import { site } from "@/lib/config";

export const ogImage = {
  url: "/og.png",
  width: 1200,
  height: 630,
  alt: "Interview Debrief — apakah wawancara tadi benar-benar jeblok?",
} as const;

export function pageMetadata(input: {
  title: string;
  description: string;
  path: string;
  index?: boolean;
}): Metadata {
  const index = input.index !== false;
  const canonical = input.path === "/" ? "/" : input.path;
  return {
    title: input.title,
    description: input.description,
    alternates: { canonical },
    robots: index ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: {
      type: "website",
      locale: site.locale,
      url: canonical,
      siteName: site.name,
      title: input.title,
      description: input.description,
      images: [ogImage],
    },
  };
}

export function rootMetadata(): Metadata {
  return {
    metadataBase: new URL(site.url),
    title: {
      default: "Interview Debrief — Apakah wawancara tadi jeblok?",
      template: "%s — Interview Debrief",
    },
    description: site.description,
    applicationName: site.name,
    authors: [{ name: site.operator }],
    openGraph: {
      type: "website",
      locale: site.locale,
      url: "/",
      siteName: site.name,
      title: "Interview Debrief — Apakah wawancara tadi jeblok?",
      description: site.description,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: "Interview Debrief",
      description: site.description,
      images: ["/og.png"],
    },
    robots: { index: true, follow: true },
    alternates: { canonical: "/" },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: site.name,
    url: site.url,
    inLanguage: "id-ID",
    applicationCategory: "EducationalApplication",
    description: site.description,
    offers: {
      "@type": "Offer",
      price: site.priceIdr,
      priceCurrency: "IDR",
      description: "Satu debrief wawancara, sekali bayar.",
    },
    provider: {
      "@type": "Organization",
      name: site.operator,
    },
  };
}
