import type { Metadata } from "next";

import StockOverview from "@/components/stock/StockOverview";

export const metadata: Metadata = {
  title: "Estoque | Mangora",
  description: "Acompanhe produtos e movimentações de estoque.",
};

export default function StockPage() {
  return <StockOverview />;
}
