<<<<<<< HEAD
import type { Metadata } from "next";

import ProductForm from "@/components/products/ProductForm";

export const metadata: Metadata = {
  title: "Editar produto | Mangora",
  description: "Atualize as informações de um produto da sua empresa.",
};
=======
import { redirect } from "next/navigation";
>>>>>>> 0e59a660a5acf0b652a188ddf2e8ccc96de79e4d

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/produtos?acao=editar&id=${encodeURIComponent(id)}`);
}
