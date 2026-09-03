import type { Metadata } from "next";

import FinancialOverview from "@/components/financial/FinancialOverview";
import NewFinancialEntryForm from "@/components/financial/NewFinancialEntryForm";
import WorkspaceModal from "@/components/ui/WorkspaceModal";

export const metadata: Metadata = {
  title: "Financeiro",
  description: "Acompanhe receitas, despesas e fluxo de caixa.",
};

export default async function FinancialPage({ searchParams }: { searchParams: Promise<{ acao?: string }> }) {
  const { acao } = await searchParams;
  return <><FinancialOverview />{acao === "novo" && <WorkspaceModal closeHref="/financeiro" label="Novo lançamento" size="medium"><NewFinancialEntryForm /></WorkspaceModal>}</>;
}
