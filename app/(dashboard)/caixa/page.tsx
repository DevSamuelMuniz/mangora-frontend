import type { Metadata } from "next";
import { redirect } from "next/navigation";
import CashRegisterPanel from "@/components/cash-registers/CashRegisterPanel";
import { getCurrentSession } from "@/lib/auth/server";

<<<<<<< HEAD
export const metadata: Metadata = { title: "Controle de caixa | Mangora", description: "Abra, movimente e confira o caixa da empresa." };
=======
export const metadata: Metadata = { title: "Controle de caixa", description: "Abra, movimente e confira o caixa da empresa." };
>>>>>>> 0e59a660a5acf0b652a188ddf2e8ccc96de79e4d

export default async function CashRegisterPage() {
  const session = await getCurrentSession();
  if (!session || !["OWNER", "ADMIN", "MANAGER", "CASHIER"].includes(session.membership.role)) redirect("/dashboard");
  return <CashRegisterPanel />;
}
