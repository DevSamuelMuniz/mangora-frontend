import { redirect } from "next/navigation";

import { getTranslator } from "@/i18n/server";
import { getCurrentSession } from "@/lib/auth/server";
import type { Metadata } from "next";

import EmployeeManagement from "@/components/employees/EmployeeManagement";
import NewEmployeeForm from "@/components/employees/NewEmployeeForm";
import WorkspaceModal from "@/components/ui/WorkspaceModal";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return {
    title: t("pageMeta.funcionarios.title"),
    description: t("pageMeta.funcionarios.description"),
  };
}

export default async function EmployeesPage({ searchParams }: { searchParams: Promise<{ acao?: string }> }) {
  const { t } = await getTranslator();
  const session = await getCurrentSession();
  if (!session || !["OWNER", "ADMIN", "MANAGER"].includes(session.membership.role)) redirect("/dashboard");
  // Dono e administrador gerenciam; o gerente usa a tela para ver as vendas de cada um.
  const canManage = ["OWNER", "ADMIN"].includes(session.membership.role);
  const { acao } = await searchParams;
  return <><EmployeeManagement canManage={canManage} />{canManage && acao === "novo" && <WorkspaceModal closeHref="/funcionarios" label={t("workspace.modal.newEmployee")} size="medium"><NewEmployeeForm /></WorkspaceModal>}</>;
}
