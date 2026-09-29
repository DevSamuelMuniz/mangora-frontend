import { getTranslator } from "@/i18n/server";
import type { Metadata } from "next";

import FinancialOverview from "@/components/financial/FinancialOverview";
import NewFinancialEntryForm from "@/components/financial/NewFinancialEntryForm";
import WorkspaceModal from "@/components/ui/WorkspaceModal";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return {
    title: t("pageMeta.financeiro.title"),
    description: t("pageMeta.financeiro.description"),
  };
}

export default async function FinancialPage({ searchParams }: { searchParams: Promise<{ acao?: string }> }) {
  const { t } = await getTranslator();
  const { acao } = await searchParams;
  return <><FinancialOverview />{acao === "novo" && <WorkspaceModal closeHref="/financeiro" label={t("workspace.modal.newEntry")} size="medium"><NewFinancialEntryForm /></WorkspaceModal>}</>;
}
