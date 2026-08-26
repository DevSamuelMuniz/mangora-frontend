import type { Metadata } from "next";

import CustomerCatalog from "@/components/customers/CustomerCatalog";

export const metadata: Metadata = {
  title: "Clientes | Mangora",
  description: "Gerencie os clientes da sua empresa.",
};

export default function CustomersPage() {
  return <CustomerCatalog />;
}
