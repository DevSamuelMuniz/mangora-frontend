import { getTranslator } from "@/i18n/server";
import type { Metadata } from "next";

import OrderCatalog from "@/components/orders/OrderCatalog";
import NewOrderForm from "@/components/orders/NewOrderForm";
import WorkspaceModal from "@/components/ui/WorkspaceModal";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return {
    title: t("pageMeta.pedidos.title"),
    description: t("pageMeta.pedidos.description"),
  };
}

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ acao?: string }> }) {
  const { t } = await getTranslator();
  const { acao } = await searchParams;
  return <><OrderCatalog />{acao === "novo" && <WorkspaceModal closeHref="/pedidos" label={t("workspace.modal.newOrder")} size="wide"><NewOrderForm /></WorkspaceModal>}</>;
}
