import type { MetadataRoute } from "next";

const baseUrl = "https://www.mangora.com.br";

export default function sitemap(): MetadataRoute.Sitemap {
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
  return pages.map((page) => ({ url: `${baseUrl}${page.path}`, lastModified: new Date(), changeFrequency: page.changeFrequency, priority: page.priority }));
}
