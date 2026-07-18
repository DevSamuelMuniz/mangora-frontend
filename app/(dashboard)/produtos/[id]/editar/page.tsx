import type { Metadata } from "next";

import ProductForm from "@/components/products/ProductForm";

export const metadata: Metadata = {
  title: "Editar produto | Gestão+",
  description: "Atualize as informações de um produto da sua empresa.",
};

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProductForm productId={id} />;
}
