import type { Metadata } from "next";

import TransfersWorkspace from "@/components/stock/TransfersWorkspace";

export const metadata: Metadata = { title: "Transferências" };

export default function TransferenciasPage() {
  return <TransfersWorkspace />;
}
