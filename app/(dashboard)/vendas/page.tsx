import { getTranslator } from "@/i18n/server";
import type { Metadata } from "next";

import SalesCatalog from "@/components/sales/SalesCatalog";
import NewSaleForm from "@/components/sales/NewSaleForm";
import WorkspaceModal from "@/components/ui/WorkspaceModal";

export const metadata: Metadata = {
  title: "Vendas",
  description: "Acompanhe as vendas da sua empresa.",
};

export default async function SalesPage({ searchParams }: { searchParams: Promise<{ acao?: string }> }) {
  const { t } = await getTranslator();
  const { acao } = await searchParams;
  return <><SalesCatalog />{acao === "novo" && <WorkspaceModal closeHref="/vendas" label={t("workspace.modal.newSale")} size="wide"><NewSaleForm /></WorkspaceModal>}</>;
}
