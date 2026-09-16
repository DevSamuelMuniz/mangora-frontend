import { getTranslator } from "@/i18n/server";
import type { Metadata } from "next";

import ProductCatalog from "@/components/products/ProductCatalog";
import ProductForm from "@/components/products/ProductForm";
import WorkspaceModal from "@/components/ui/WorkspaceModal";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return {
    title: t("pageMeta.produtos.title"),
    description: t("pageMeta.produtos.description"),
  };
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ acao?: string; id?: string }> }) {
  const { acao, id } = await searchParams;
  const editing = acao === "editar" && Boolean(id);
  return <><ProductCatalog />{(acao === "novo" || editing) && <WorkspaceModal closeHref="/produtos" label={editing ? "Editar produto" : "Novo produto"}><ProductForm productId={editing ? id : undefined} /></WorkspaceModal>}</>;
}
