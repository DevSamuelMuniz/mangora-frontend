import type { Metadata } from "next";

import ProductCatalog from "@/components/products/ProductCatalog";

export const metadata: Metadata = {
  title: "Produtos | Gestão+",
  description: "Gerencie o catálogo de produtos da sua empresa.",
};

export default function ProductsPage() {
  return <ProductCatalog />;
}
