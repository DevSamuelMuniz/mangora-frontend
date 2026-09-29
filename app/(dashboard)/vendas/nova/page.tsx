<<<<<<< HEAD
import type { Metadata } from "next";

import NewSaleForm from "@/components/sales/NewSaleForm";

export const metadata: Metadata = {
  title: "Nova venda | Mangora",
  description: "Registre uma nova venda na sua empresa.",
};

export default function NewSalePage() {
  return <NewSaleForm />;
}
=======
import { redirect } from "next/navigation";
export default function NewSalePage() { redirect("/vendas?acao=novo"); }
>>>>>>> 0e59a660a5acf0b652a188ddf2e8ccc96de79e4d
