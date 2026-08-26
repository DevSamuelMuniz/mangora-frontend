import type { Metadata } from "next";

import SalesCatalog from "@/components/sales/SalesCatalog";

export const metadata: Metadata = {
  title: "Vendas | Mangora",
  description: "Acompanhe as vendas da sua empresa.",
};

export default function SalesPage() {
  return <SalesCatalog />;
}
