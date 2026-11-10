import { notFound } from "next/navigation";
import SubscriptionCheckout from "@/components/subscription/SubscriptionCheckout";
import { getTranslator } from "@/i18n/server";
import { getCurrentSession } from "@/lib/auth/server";

export default async function CheckoutPage({ params }: { params: Promise<{ plan: string }> }) {
  const { plan } = await params;
  if (!["start", "business", "premium"].includes(plan)) notFound();

  const session = await getCurrentSession();
  if (session?.membership.role !== "OWNER") {
    const { t } = await getTranslator();
    return <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950">{t("billing.pendingPayment.ownerRequired")}</p>;
  }

  return <SubscriptionCheckout planId={plan.toUpperCase()} />;
}
