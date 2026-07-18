import type { Metadata } from "next";

import NewOrderForm from "@/components/orders/NewOrderForm";

export const metadata: Metadata = {
  title: "Novo pedido | Gestão+",
  description: "Cadastre um novo pedido.",
};

export default function NewOrderPage() {
  return <NewOrderForm />;
}
