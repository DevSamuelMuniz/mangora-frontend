<<<<<<< HEAD
import type { Metadata } from "next";

import CustomerForm from "@/components/customers/CustomerForm";

export const metadata: Metadata = {
  title: "Editar cliente | Mangora",
  description: "Atualize os dados de um cliente da sua empresa.",
};
=======
import { redirect } from "next/navigation";
>>>>>>> 0e59a660a5acf0b652a188ddf2e8ccc96de79e4d

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/clientes?acao=editar&id=${encodeURIComponent(id)}`);
}
