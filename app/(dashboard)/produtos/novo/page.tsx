import type { Metadata } from "next";

import ProductForm from "@/components/products/ProductForm";

export const metadata: Metadata = {
  title: "Novo produto | Mangora",
  description: "Cadastre um produto no catálogo da sua empresa.",
};

export default function NewProductPage() {
  return <ProductForm />;
}
