import type { Metadata } from "next";

import OrderCatalog from "@/components/orders/OrderCatalog";

export const metadata: Metadata = {
  title: "Pedidos | Gestão+",
  description: "Organize e acompanhe os pedidos da sua empresa.",
};

export default function OrdersPage() {
  return <OrderCatalog />;
}
