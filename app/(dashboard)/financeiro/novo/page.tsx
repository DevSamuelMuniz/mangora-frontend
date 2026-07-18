import type { Metadata } from "next";

import NewFinancialEntryForm from "@/components/financial/NewFinancialEntryForm";

export const metadata: Metadata = {
  title: "Novo lançamento | Gestão+",
  description: "Registre uma receita ou despesa.",
};

export default function NewFinancialEntryPage() {
  return <NewFinancialEntryForm />;
}
