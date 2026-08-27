import type { Metadata } from "next";

import CustomerCatalog from "@/components/customers/CustomerCatalog";
import CustomerForm from "@/components/customers/CustomerForm";
import WorkspaceModal from "@/components/ui/WorkspaceModal";

export const metadata: Metadata = {
  title: "Clientes | Mangora",
  description: "Gerencie os clientes da sua empresa.",
};

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ acao?: string; id?: string }> }) {
  const { acao, id } = await searchParams;
  const editing = acao === "editar" && Boolean(id);
  return <><CustomerCatalog />{(acao === "novo" || editing) && <WorkspaceModal closeHref="/clientes" label={editing ? "Editar cliente" : "Novo cliente"}><CustomerForm customerId={editing ? id : undefined} /></WorkspaceModal>}</>;
}
