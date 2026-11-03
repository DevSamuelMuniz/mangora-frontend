import { guidePaths } from "@/lib/guides";
import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { alternateLanguages, localePath } from "@/i18n/urls";
import { absoluteUrl, PUBLIC_PAGES } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return [...PUBLIC_PAGES.flatMap(path => locales.map(locale => ({
    url: absoluteUrl(localePath(path, locale)),
    alternates: { languages: Object.fromEntries(Object.entries(alternateLanguages(path)).map(([key, value]) => [key, absoluteUrl(value)])) },
  }))), ...guidePaths.map(path => ({ url: absoluteUrl(path) }))];
}
