<<<<<<< HEAD
import type { Metadata } from "next";

import ProductForm from "@/components/products/ProductForm";

export const metadata: Metadata = {
  title: "Novo produto | Mangora",
  description: "Cadastre um produto no catálogo da sua empresa.",
};

export default function NewProductPage() {
  return <ProductForm />;
}
=======
import { redirect } from "next/navigation";
export default function NewProductPage() { redirect("/produtos?acao=novo"); }
>>>>>>> 0e59a660a5acf0b652a188ddf2e8ccc96de79e4d
