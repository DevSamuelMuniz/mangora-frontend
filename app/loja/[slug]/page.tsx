import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PublicStorefront from "@/components/public-store/PublicStorefront";
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
  return store ? { title: `${store.company.tradeName} | Mangora`, description: store.company.description || `Catálogo e pedidos de ${store.company.tradeName}.` } : { title: "Página não encontrada | Mangora" };
}

export default async function PublicStorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const store = await loadStore(slug);
  if (!store) notFound();
  return <PublicStorefront store={store} />;
}
