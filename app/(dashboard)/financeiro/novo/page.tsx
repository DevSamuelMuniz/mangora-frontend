<<<<<<< HEAD
import type { Metadata } from "next";

import NewFinancialEntryForm from "@/components/financial/NewFinancialEntryForm";

export const metadata: Metadata = {
  title: "Novo lançamento | Mangora",
  description: "Registre uma receita ou despesa.",
};

export default function NewFinancialEntryPage() {
  return <NewFinancialEntryForm />;
}
=======
import { redirect } from "next/navigation";
export default function NewFinancialEntryPage() { redirect("/financeiro?acao=novo"); }
>>>>>>> 0e59a660a5acf0b652a188ddf2e8ccc96de79e4d
