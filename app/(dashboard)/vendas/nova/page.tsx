import type { Metadata } from "next";

import NewSaleForm from "@/components/sales/NewSaleForm";

export const metadata: Metadata = {
  title: "Nova venda | Gestão+",
  description: "Registre uma nova venda na sua empresa.",
};

export default function NewSalePage() {
  return <NewSaleForm />;
}
