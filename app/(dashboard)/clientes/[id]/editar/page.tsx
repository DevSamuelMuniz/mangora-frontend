import type { Metadata } from "next";

import CustomerForm from "@/components/customers/CustomerForm";

export const metadata: Metadata = {
  title: "Editar cliente | Gestão+",
  description: "Atualize os dados de um cliente da sua empresa.",
};

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CustomerForm customerId={id} />;
}
