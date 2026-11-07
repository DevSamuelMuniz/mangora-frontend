import { getCurrentSession } from "@/lib/auth/server";
import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslator } from "@/i18n/server";
import SubscriptionPayments from "@/components/subscription/SubscriptionPayments";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("billing.paymentFlow.viewPayments") };
}
export default async function SubscriptionPaymentsPage() {
  const session = await getCurrentSession();
  if (session?.membership.role !== "OWNER") { const { t } = await getTranslator(); return <p className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950">{t("billing.pendingPayment.ownerRequired")}</p>; }
  return <Suspense><SubscriptionPayments /></Suspense>;
}
