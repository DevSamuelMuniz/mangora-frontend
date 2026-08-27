import type { Metadata } from "next";

import EmployeeManagement from "@/components/employees/EmployeeManagement";
import NewEmployeeForm from "@/components/employees/NewEmployeeForm";
import WorkspaceModal from "@/components/ui/WorkspaceModal";

export const metadata: Metadata = {
  title: "Funcionários | Mangora",
  description: "Gerencie a equipe e os papéis de acesso.",
};

export default async function EmployeesPage({ searchParams }: { searchParams: Promise<{ acao?: string }> }) {
  const { acao } = await searchParams;
  return <><EmployeeManagement />{acao === "novo" && <WorkspaceModal closeHref="/funcionarios" label="Novo funcionário" size="medium"><NewEmployeeForm /></WorkspaceModal>}</>;
}
