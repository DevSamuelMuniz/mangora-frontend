import type { Metadata } from "next";

import InventoryWorkspace from "@/components/stock/InventoryWorkspace";

export const metadata: Metadata = { title: "Inventário físico" };

export default function InventarioPage() {
  return <InventoryWorkspace />;
}
