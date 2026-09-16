import { getTranslator } from "@/i18n/server";
import type { Metadata } from "next";

import StockOverview from "@/components/stock/StockOverview";
import StockMovementForm from "@/components/stock/StockMovementForm";
import WorkspaceModal from "@/components/ui/WorkspaceModal";
import StockTransferForm from "@/components/stock/StockTransferForm";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return {
    title: t("pageMeta.estoque.title"),
    description: t("pageMeta.estoque.description"),
  };
}

export default async function StockPage({ searchParams }: { searchParams: Promise<{ acao?: string; productId?: string }> }) {
  const { t } = await getTranslator();
  const { acao, productId } = await searchParams;
  return <><StockOverview />{acao === "movimentar" && <WorkspaceModal closeHref="/estoque" label={t("workspace.modal.moveStock")} size="medium"><StockMovementForm initialProductId={productId} /></WorkspaceModal>}{acao === "transferir" && <WorkspaceModal closeHref="/estoque" label="Transferir estoque" size="medium"><StockTransferForm initialProductId={productId} /></WorkspaceModal>}</>;
}
