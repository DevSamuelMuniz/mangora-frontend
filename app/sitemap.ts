import type { MetadataRoute } from "next";
import { API_BASE_URL } from "@/lib/api/config";

const baseUrl = "https://www.mangora.com.br";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = [
    { path: "", priority: 1, changeFrequency: "weekly" as const },
    { path: "/sobre", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/suporte", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/parceiros", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/seguranca", priority: 0.5, changeFrequency: "yearly" as const },
    { path: "/lgpd", priority: 0.4, changeFrequency: "yearly" as const },
    { path: "/termos", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/privacidade", priority: 0.3, changeFrequency: "yearly" as const },
  ];
  const staticPages: MetadataRoute.Sitemap = pages.map((page) => ({ url: `${baseUrl}${page.path}`, lastModified: new Date(), changeFrequency: page.changeFrequency, priority: page.priority }));
  try {
    const response = await fetch(`${API_BASE_URL}/public/stores/sitemap`, { next: { revalidate: 3600 } });
    if (!response.ok) return staticPages;
    const stores = await response.json() as Array<{ slug: string; updatedAt: string }>;
    return [...staticPages, ...stores.map((store) => ({ url: `${baseUrl}/loja/${encodeURIComponent(store.slug)}`, lastModified: new Date(store.updatedAt), changeFrequency: "daily" as const, priority: 0.8 }))];
  } catch { return staticPages; }
}
