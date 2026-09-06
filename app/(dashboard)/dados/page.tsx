import type { Metadata } from "next";

import DataTransferPanel from "@/components/data/DataTransferPanel";

export const metadata: Metadata = { title: "Importar & Exportar" };

export default function DadosPage() {
  return <DataTransferPanel />;
}
