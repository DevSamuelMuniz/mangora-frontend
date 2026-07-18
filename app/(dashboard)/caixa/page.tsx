import type { Metadata } from "next";
import { redirect } from "next/navigation";
import CashRegisterPanel from "@/components/cash-registers/CashRegisterPanel";
import { getCurrentSession } from "@/lib/auth/server";

export const metadata: Metadata = { title: "Controle de caixa | Gestão+", description: "Abra, movimente e confira o caixa da empresa." };

export default async function CashRegisterPage() {
  const session = await getCurrentSession();
  if (!session || !["OWNER", "ADMIN", "MANAGER", "CASHIER"].includes(session.membership.role)) redirect("/dashboard");
  return <CashRegisterPanel />;
}
