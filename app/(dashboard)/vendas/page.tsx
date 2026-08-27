import type { Metadata } from "next";

import SalesCatalog from "@/components/sales/SalesCatalog";
import NewSaleForm from "@/components/sales/NewSaleForm";
import WorkspaceModal from "@/components/ui/WorkspaceModal";

export const metadata: Metadata = {
  title: "Vendas | Mangora",
  description: "Acompanhe as vendas da sua empresa.",
};

export default async function SalesPage({ searchParams }: { searchParams: Promise<{ acao?: string }> }) {
  const { acao } = await searchParams;
  return <><SalesCatalog />{acao === "novo" && <WorkspaceModal closeHref="/vendas" label="Nova venda" size="wide"><NewSaleForm /></WorkspaceModal>}</>;
}
