import type { Metadata } from "next";
import PublicStorefront from "@/components/public-store/PublicStorefront";
import StoreUnavailable from "@/components/public-store/StoreUnavailable";
import type { PublicStore } from "@/types/public-store";
import { API_BASE_URL } from "@/lib/api/config";

async function loadStore(slug: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/public/stores/${encodeURIComponent(slug)}`, { cache: "no-store" });
    if (!response.ok) return null;
    return response.json() as Promise<PublicStore>;
  } catch { return null; }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const store = await loadStore(slug);
  if (!store) return { title: "Página indisponível", robots: { index: false, follow: false } };
  const title = `${store.company.tradeName} — catálogo e pedidos online`;
  const description = store.company.description || `Conheça os produtos, consulte preços e faça seu pedido online em ${store.company.tradeName}.`;
  const image = store.company.coverUrl || store.company.logoUrl || "/mangora-share.png";
  return {
    title, description,
    alternates: { canonical: `/loja/${encodeURIComponent(slug)}` },
    openGraph: { type: "website", url: `/loja/${encodeURIComponent(slug)}`, title, description, images: [{ url: image, alt: store.company.tradeName }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function PublicStorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const store = await loadStore(slug);
  if (!store) return <StoreUnavailable />;
  return <PublicStorefront store={store} />;
}
