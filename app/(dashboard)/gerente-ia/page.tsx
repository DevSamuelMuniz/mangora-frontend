import { getTranslator } from "@/i18n/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AiManager from "@/components/ai-manager/AiManager";
import { getCurrentSession } from "@/lib/auth/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return {
    title: t("pageMeta.gerenteIa.title"),
    description: t("pageMeta.gerenteIa.description"),
  };
}

export default async function AiManagerPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login?retorno=/gerente-ia");
  if (!["OWNER", "ADMIN", "MANAGER"].includes(session.membership.role)) redirect("/dashboard");
  return <AiManager />;
}
