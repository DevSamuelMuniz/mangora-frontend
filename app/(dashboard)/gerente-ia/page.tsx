import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AiManager from "@/components/ai-manager/AiManager";
import { getCurrentSession } from "@/lib/auth/server";

export const metadata: Metadata = { title: "Gerente de IA | Mangora", description: "Seu especialista em finanças e marketing, com dados da sua loja." };
export default async function AiManagerPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login?retorno=/gerente-ia");
  return <AiManager />;
}
