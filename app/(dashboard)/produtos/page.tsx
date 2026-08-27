import type { Metadata } from "next";

import ProductCatalog from "@/components/products/ProductCatalog";
import ProductForm from "@/components/products/ProductForm";
import WorkspaceModal from "@/components/ui/WorkspaceModal";

export const metadata: Metadata = {
  title: "Produtos | Mangora",
  description: "Gerencie o catálogo de produtos da sua empresa.",
};

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ acao?: string; id?: string }> }) {
  const { acao, id } = await searchParams;
  const editing = acao === "editar" && Boolean(id);
  return <><ProductCatalog />{(acao === "novo" || editing) && <WorkspaceModal closeHref="/produtos" label={editing ? "Editar produto" : "Novo produto"}><ProductForm productId={editing ? id : undefined} /></WorkspaceModal>}</>;
}
