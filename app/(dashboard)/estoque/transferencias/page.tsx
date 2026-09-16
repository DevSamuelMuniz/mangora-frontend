import { getTranslator } from "@/i18n/server";
import type { Metadata } from "next";

import TransfersWorkspace from "@/components/stock/TransfersWorkspace";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return {
    title: t("pageMeta.estoqueTransferencias.title"),
    description: t("pageMeta.estoqueTransferencias.description"),
  };
}

export default function TransferenciasPage() {
  return <TransfersWorkspace />;
}
