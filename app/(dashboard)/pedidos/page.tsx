import type { Metadata } from "next";

import OrderCatalog from "@/components/orders/OrderCatalog";
import NewOrderForm from "@/components/orders/NewOrderForm";
import WorkspaceModal from "@/components/ui/WorkspaceModal";

export const metadata: Metadata = {
  title: "Pedidos",
  description: "Organize e acompanhe os pedidos da sua empresa.",
};

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ acao?: string }> }) {
  const { acao } = await searchParams;
  return <><OrderCatalog />{acao === "novo" && <WorkspaceModal closeHref="/pedidos" label="Novo pedido" size="wide"><NewOrderForm /></WorkspaceModal>}</>;
}
