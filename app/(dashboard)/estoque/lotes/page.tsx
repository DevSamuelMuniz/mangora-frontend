import type { Metadata } from "next";

import BatchesWorkspace from "@/components/stock/BatchesWorkspace";

export const metadata: Metadata = { title: "Lotes e custo FIFO" };

export default function LotesPage() {
  return <BatchesWorkspace />;
}
