import { getTranslator } from "@/i18n/server";
import type { Metadata } from "next";

import ProductCatalog from "@/components/products/ProductCatalog";
import ProductForm from "@/components/products/ProductForm";
import WorkspaceModal from "@/components/ui/WorkspaceModal";

<<<<<<< HEAD
export const metadata: Metadata = {
  title: "Produtos | Mangora",
  description: "Gerencie o catálogo de produtos da sua empresa.",
};
=======
export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return {
    title: t("pageMeta.produtos.title"),
    description: t("pageMeta.produtos.description"),
  };
}
>>>>>>> 0e59a660a5acf0b652a188ddf2e8ccc96de79e4d

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ acao?: string; id?: string }> }) {
  const { t } = await getTranslator();
  const { acao, id } = await searchParams;
  const editing = acao === "editar" && Boolean(id);
  return <><ProductCatalog />{(acao === "novo" || editing) && <WorkspaceModal closeHref="/produtos" label={editing ? t("workspace.modal.editProduct") : t("workspace.modal.newProduct")}><ProductForm productId={editing ? id : undefined} /></WorkspaceModal>}</>;
}
