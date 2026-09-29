import { getTranslator } from "@/i18n/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import ActivityLog from "@/components/audit/ActivityLog";
import { getCurrentSession } from "@/lib/auth/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return {
    title: t("pageMeta.logs.title"),
    description: t("pageMeta.logs.description"),
  };
}

export default async function LogsPage() {
  const session = await getCurrentSession();
  if (!session || session.membership.role !== "OWNER") redirect("/dashboard");
  return <ActivityLog />;
}
