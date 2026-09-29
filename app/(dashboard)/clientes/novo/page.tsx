<<<<<<< HEAD
import type { Metadata } from "next";

import CustomerForm from "@/components/customers/CustomerForm";

export const metadata: Metadata = {
  title: "Novo cliente | Mangora",
  description: "Cadastre um cliente na sua empresa.",
};

export default function NewCustomerPage() {
  return <CustomerForm />;
}
=======
import { redirect } from "next/navigation";
export default function NewCustomerPage() { redirect("/clientes?acao=novo"); }
>>>>>>> 0e59a660a5acf0b652a188ddf2e8ccc96de79e4d
