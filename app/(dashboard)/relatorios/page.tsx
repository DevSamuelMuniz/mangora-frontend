import { getTranslator } from "@/i18n/server";
import type { Metadata } from "next";

import ReportsOverview from "@/components/reports/ReportsOverview";

<<<<<<< HEAD
export const metadata: Metadata = {
  title: "Relatórios | Mangora",
  description: "Analise os resultados e o desempenho da sua empresa.",
};
=======
export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return {
    title: t("pageMeta.relatorios.title"),
    description: t("pageMeta.relatorios.description"),
  };
}
>>>>>>> 0e59a660a5acf0b652a188ddf2e8ccc96de79e4d

export default function ReportsPage() {
  return <ReportsOverview />;
}
