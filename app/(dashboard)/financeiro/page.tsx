import type { Metadata } from "next";

import FinancialOverview from "@/components/financial/FinancialOverview";

export const metadata: Metadata = {
  title: "Financeiro | Gestão+",
  description: "Acompanhe receitas, despesas e fluxo de caixa.",
};

export default function FinancialPage() {
  return <FinancialOverview />;
}
