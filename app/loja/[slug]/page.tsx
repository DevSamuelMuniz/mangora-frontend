import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PublicStorefront from "@/components/public-store/PublicStorefront";
import type { PublicStore } from "@/types/public-store";
import { absoluteUrl } from "@/lib/seo";

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

async function loadStore(slug: string) {
  try {
    const response = await fetch(`${API_URL}/public/stores/${encodeURIComponent(slug)}`, { cache: "no-store" });
    if (!response.ok) return null;
    return response.json() as Promise<PublicStore>;
  } catch { return null; }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const store = await loadStore(slug);
  if (!store) return { title: "Página não encontrada | Mangora", robots: { index: false, follow: false } };
  const title = `${store.company.tradeName} | Mangora`;
  const description = store.company.description || `Catálogo e pedidos de ${store.company.tradeName}.`;
  const url = absoluteUrl(`/loja/${encodeURIComponent(slug)}`);
  return { title: { absolute: title }, description, alternates: { canonical: url, languages: {} }, openGraph: { title, description, url, type: "website" }, twitter: { card: "summary", title, description } };
}

export default async function PublicStorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const store = await loadStore(slug);
  if (!store) notFound();
  return <PublicStorefront store={store} />;
}
