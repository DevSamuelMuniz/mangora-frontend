import type { Metadata } from "next";

import StockMovementForm from "@/components/stock/StockMovementForm";

export const metadata: Metadata = {
  title: "Nova movimentação | Gestão+",
  description: "Registre uma movimentação de estoque.",
};

export default async function StockMovementPage({
  searchParams,
}: {
  searchParams: Promise<{ productId?: string }>;
}) {
  const { productId } = await searchParams;
  return <StockMovementForm initialProductId={productId} />;
}
