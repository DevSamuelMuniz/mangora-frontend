import { isGuidePath } from "@/lib/guides";
import type { Metadata } from "next";
import { locales, type Locale } from "@/i18n/config";
import { alternateLanguages, localePath } from "@/i18n/urls";
import { brand } from "@/lib/brand";

export const PUBLIC_PAGES = ["/", "/sobre", "/suporte", "/parceiros", "/seguranca", "/lgpd", "/termos", "/privacidade"] as const;
export function isPublicMarketingPath(path: string) { return (PUBLIC_PAGES as readonly string[]).includes(path) || isGuidePath(path); }
export function absoluteUrl(path: string) { return new URL(path, brand.url).href; }

export function publicMetadata(path: string, locale: Locale, title: string, description: string): Metadata {
  const url = absoluteUrl(localePath(path, locale));
  const fullTitle = /mangora/i.test(title) ? title : `${title} | Mangora`;
  return {
    title: { absolute: fullTitle }, description,
    alternates: { canonical: url, languages: Object.fromEntries(Object.entries(alternateLanguages(path)).map(([key, value]) => [key, absoluteUrl(value)])) },
    openGraph: { type: "website", url, siteName: brand.name, locale: locale.replace("-", "_"), alternateLocale: locales.filter(value => value !== locale).map(value => value.replace("-", "_")), title: fullTitle, description, images: [{ url: absoluteUrl("/opengraph-image"), width: 1200, height: 630, alt: brand.name }] },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: [absoluteUrl("/opengraph-image")] },
  };
}

export function landingFaq(t: (key: string) => string) {
  return ["card", "afterTrial", "install", "firstSteps", "doubt"].map(key => ({ question: t(`landing.faq.${key}.question`), answer: t(`landing.faq.${key}.answer`) }));
}

/** Guides currently have a single, Brazilian Portuguese edition. */
export function guideMetadata(path: string, title: string, description: string): Metadata {
  const metadata = publicMetadata(path, "pt-BR", title, description);
  return { ...metadata, alternates: { canonical: absoluteUrl(path), languages: { "pt-BR": absoluteUrl(path) } }, openGraph: { ...metadata.openGraph, alternateLocale: [] } };
}
