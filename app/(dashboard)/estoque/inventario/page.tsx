import { getTranslator } from "@/i18n/server";
import type { Metadata } from "next";

import InventoryWorkspace from "@/components/stock/InventoryWorkspace";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return {
    title: t("pageMeta.estoqueInventario.title"),
    description: t("pageMeta.estoqueInventario.description"),
  };
}

export default function InventarioPage() {
  return <InventoryWorkspace />;
}
