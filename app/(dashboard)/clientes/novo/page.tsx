import type { Metadata } from "next";

import CustomerForm from "@/components/customers/CustomerForm";

export const metadata: Metadata = {
  title: "Novo cliente | Mangora",
  description: "Cadastre um cliente na sua empresa.",
};

export default function NewCustomerPage() {
  return <CustomerForm />;
}
