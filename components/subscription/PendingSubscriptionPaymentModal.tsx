"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import type { AuthSession } from "@/lib/auth/types";
import { useT } from "@/i18n/provider";
import { useReconcileSubscription, useSubscription, useSubscriptionAccess } from "@/features/subscription/hooks/useSubscription";
import ModalDialog from "@/components/ui/ModalDialog";

const REMINDER_SNOOZE_MS = 30 * 60_000;

export default function PendingSubscriptionPaymentModal({ session }: { session: AuthSession }) {
  const t = useT();
  const pathname = usePathname();
  const isOwner = session.membership.role === "OWNER";
  const { data: overview } = useSubscription(isOwner);
  const { data: access } = useSubscriptionAccess(!isOwner);
  const reconcile = useReconcileSubscription();
  const current = isOwner ? overview : access;
  const blocked = current?.accessBlocked ?? session.company.accessBlocked;
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const dueAt = current?.billingDueAt ?? session.company.billingDueAt;
  const key = `mangora:billing-reminder:${session.company.id}:${dueAt}`;
  const billingRoute = pathname.includes("/assinatura");

  useEffect(() => {
    if (!blocked || billingRoute) return;
    let until = 0;
    try { until = Number(window.sessionStorage.getItem(key)) || 0; } catch { /* Storage may be disabled. */ }
    const timer = window.setTimeout(() => setOpen(true), Math.max(0, until - Date.now()));
    return () => window.clearTimeout(timer);
  }, [blocked, billingRoute, key]);

  function dismiss() {
    try { window.sessionStorage.setItem(key, String(Date.now() + REMINDER_SNOOZE_MS)); } catch { /* Dismiss still works for this mount. */ }
    setOpen(false);
  }

  async function checkPayment() {
    setError(""); setMessage("");
    try {
      const updated = await reconcile.mutateAsync();
      if (updated.accessBlocked) setMessage(t("billing.paymentFlow.waiting"));
      else { setOpen(false); setMessage(t("billing.paymentFlow.released")); }
    } catch (cause) { setError(cause instanceof Error ? cause.message : t("billing.paymentFlow.checkError")); }
  }

  if (!blocked) return null;
  return <>
    <div role="status" className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-950">
      <p className="flex items-center gap-2"><AlertTriangle className="size-4 shrink-0" />{t("billing.paymentFlow.blocked")}</p>
      {isOwner ? <Link href="/assinatura/cobrancas" className="font-bold underline underline-offset-4">{t("billing.paymentFlow.viewPayments")}</Link> : <p className="text-xs">{t("billing.pendingPayment.ownerRequired")}</p>}
      {!billingRoute && <button type="button" onClick={() => setOpen(true)} className="cursor-pointer font-bold underline underline-offset-4">{t("billing.pendingPayment.viewBilling")}</button>}
    </div>
    {open && !billingRoute && <ModalDialog title={t("billing.pendingPayment.title")} onClose={dismiss} busy={reconcile.isPending}>
      <p className="text-sm leading-6 text-slate-600">{t("billing.pendingPayment.description", { company: session.company.tradeName })}</p>
      <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-950">{t("billing.paymentFlow.rule")}</p>
      <div className="flex flex-wrap gap-3">
        {isOwner ? <><Link href="/assinatura/cobrancas" onClick={dismiss} className="rounded-xl bg-orange-600 px-5 py-3 text-sm font-bold text-white hover:bg-orange-700 focus-visible:outline-2 focus-visible:outline-orange-600">{t("billing.paymentFlow.viewPayments")}</Link><button type="button" disabled={reconcile.isPending} onClick={() => void checkPayment()} className="cursor-pointer rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold hover:bg-slate-50 disabled:opacity-50">{t(reconcile.isPending ? "billing.paymentFlow.checking" : "billing.paymentFlow.check")}</button></> : <p className="text-sm font-semibold">{t("billing.pendingPayment.ownerRequired")}</p>}
      </div>
      {message && <p role="status" className="text-sm text-slate-700">{message}</p>}
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    </ModalDialog>}
  </>;
}
