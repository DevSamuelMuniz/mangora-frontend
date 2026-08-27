import type { Metadata } from "next";

import StockOverview from "@/components/stock/StockOverview";
import StockMovementForm from "@/components/stock/StockMovementForm";
import WorkspaceModal from "@/components/ui/WorkspaceModal";

export const metadata: Metadata = {
  title: "Estoque | Mangora",
  description: "Acompanhe produtos e movimentações de estoque.",
};

export default async function StockPage({ searchParams }: { searchParams: Promise<{ acao?: string; productId?: string }> }) {
  const { acao, productId } = await searchParams;
  return <><StockOverview />{acao === "movimentar" && <WorkspaceModal closeHref="/estoque" label="Movimentar estoque" size="medium"><StockMovementForm initialProductId={productId} /></WorkspaceModal>}</>;
}
