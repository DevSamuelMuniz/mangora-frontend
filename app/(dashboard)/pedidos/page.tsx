import { getTranslator } from "@/i18n/server";
import type { Metadata } from "next";

import OrderCatalog from "@/components/orders/OrderCatalog";
import NewOrderForm from "@/components/orders/NewOrderForm";
import WorkspaceModal from "@/components/ui/WorkspaceModal";

<<<<<<< HEAD
export const metadata: Metadata = {
  title: "Pedidos | Mangora",
  description: "Organize e acompanhe os pedidos da sua empresa.",
};
=======
export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return {
    title: t("pageMeta.pedidos.title"),
    description: t("pageMeta.pedidos.description"),
  };
}
>>>>>>> 0e59a660a5acf0b652a188ddf2e8ccc96de79e4d

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ acao?: string }> }) {
  const { t } = await getTranslator();
  const { acao } = await searchParams;
  return <><OrderCatalog />{acao === "novo" && <WorkspaceModal closeHref="/pedidos" label={t("workspace.modal.newOrder")} size="wide"><NewOrderForm /></WorkspaceModal>}</>;
}
