import { getCurrentSession } from "@/lib/auth/server";
import { getTranslator } from "@/i18n/server";
import type { Metadata } from "next";

import SubscriptionManagement from "@/components/subscription/SubscriptionManagement";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return {
    title: t("pageMeta.assinatura.title"),
    description: t("pageMeta.assinatura.description"),
  };
}

export default async function SubscriptionPage() {
  const session = await getCurrentSession();
  if (session?.membership.role !== "OWNER") { const { t } = await getTranslator(); return <p className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950">{t("billing.pendingPayment.ownerRequired")}</p>; }
  return <SubscriptionManagement />;
}
