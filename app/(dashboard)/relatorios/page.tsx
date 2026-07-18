import type { Metadata } from "next";

import ReportsOverview from "@/components/reports/ReportsOverview";

export const metadata: Metadata = {
  title: "Relatórios | Gestão+",
  description: "Analise os resultados e o desempenho da sua empresa.",
};

export default function ReportsPage() {
  return <ReportsOverview />;
}
