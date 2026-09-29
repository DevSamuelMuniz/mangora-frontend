<<<<<<< HEAD
import type { Metadata } from "next";

import NewOrderForm from "@/components/orders/NewOrderForm";

export const metadata: Metadata = {
  title: "Novo pedido | Mangora",
  description: "Cadastre um novo pedido.",
};

export default function NewOrderPage() {
  return <NewOrderForm />;
}
=======
import { redirect } from "next/navigation";
export default function NewOrderPage() { redirect("/pedidos?acao=novo"); }
>>>>>>> 0e59a660a5acf0b652a188ddf2e8ccc96de79e4d
