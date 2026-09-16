import { getTranslator } from "@/i18n/server";
import type { Metadata } from "next";

import BankReconciliation from "@/components/bank/BankReconciliation";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return {
    title: t("pageMeta.financeiroContas.title"),
    description: t("pageMeta.financeiroContas.description"),
  };
}

export default function ContasPage() {
  return <BankReconciliation />;
}
