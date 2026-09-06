import type { Metadata } from "next";

import BankReconciliation from "@/components/bank/BankReconciliation";

export const metadata: Metadata = { title: "Contas & Conciliação" };

export default function ContasPage() {
  return <BankReconciliation />;
}
