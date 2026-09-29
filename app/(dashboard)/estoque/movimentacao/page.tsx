<<<<<<< HEAD
import type { Metadata } from "next";

import StockMovementForm from "@/components/stock/StockMovementForm";

export const metadata: Metadata = {
  title: "Nova movimentação | Mangora",
  description: "Registre uma movimentação de estoque.",
};

=======
>>>>>>> 0e59a660a5acf0b652a188ddf2e8ccc96de79e4d
export default async function StockMovementPage({
  searchParams,
}: {
  searchParams: Promise<{ productId?: string }>;
}) {
  const { productId } = await searchParams;
  const { redirect } = await import("next/navigation");
  redirect(`/estoque?acao=movimentar${productId ? `&productId=${encodeURIComponent(productId)}` : ""}`);
}
