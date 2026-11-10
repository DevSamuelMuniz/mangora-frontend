"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, LoaderCircle } from "lucide-react";
import { useSubscription, useSubscriptionCheckout } from "@/features/subscription/hooks/useSubscription";
import { useI18n, useT } from "@/i18n/provider";
import { addDaysToBrazilDateKey } from "@/lib/timezone";

const field = "mt-2 min-h-11 w-full rounded-xl border border-slate-300 px-3 text-sm focus-visible:outline-2 focus-visible:outline-orange-600 disabled:opacity-60";

export default function SubscriptionCheckout({ planId }: { planId: string }) {
  const t = useT();
  const { locale } = useI18n();
  const query = useSubscription();
  const checkout = useSubscriptionCheckout();
  const lock = useRef(false);
  const dueInput = useRef<HTMLInputElement>(null);
  const today = addDaysToBrazilDateKey(0);
  const [method, setMethod] = useState<"PIX" | "BOLETO">("PIX");
  const [due, setDue] = useState(today);
  const [coupon, setCoupon] = useState("");
  const [invalidDue, setInvalidDue] = useState(false);
  const [error, setError] = useState("");
  const [awaitingLink, setAwaitingLink] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const overview = query.data;
  const plan = overview?.plans.find(item => item.id === planId);
  const regional = plan?.regionalPrice;
  const provider = regional?.provider ?? overview?.provider.name;
  const resume = overview?.pendingPlan === planId;
  const showFields = provider === "ASAAS" && !resume;
  const busy = checkout.isPending || redirecting;
  const amount = plan?.checkoutAmount ?? (regional && regional.amount * Math.max(1, overview?.usage.find(item => item.key === "units")?.current ?? 1));
  const price = regional && typeof amount === "number"
    ? new Intl.NumberFormat(locale, { style: "currency", currency: regional.currency }).format(amount / 100)
    : regional?.formatted ?? t("billing.plan.pricePending");
  const available = overview?.provider.configured && (resume || (
    regional?.checkoutAvailable && !(overview.pendingPlan && overview.pendingPlan !== planId)
    && !(overview.plan === planId && overview.status === "ACTIVE" && !overview.cancellation?.requested)
  ));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!available || busy || lock.current) return;
    setError("");
    if (showFields && (!due || due < today)) {
      setInvalidDue(true);
      dueInput.current?.focus();
      return;
    }
    lock.current = true;
    try {
      const result = await checkout.mutateAsync({
        targetPlan: planId,
        ...(showFields ? { billingType: method, nextDueDate: due, couponCode: coupon.trim() || undefined } : {}),
      });
      if (result.checkoutUrl) {
        window.location.assign(result.checkoutUrl);
        setRedirecting(true);
      } else {
        setAwaitingLink(true);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t("billing.pendingPayment.paymentError"));
    } finally {
      lock.current = false;
    }
  }

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <Link href="/assinatura" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-orange-800 hover:underline focus-visible:outline-2 focus-visible:outline-orange-600"><ArrowLeft className="size-4" />{t("billing.paymentFlow.back")}</Link>
      <h1 className="text-3xl font-black">{t("billing.checkoutPage.title")}</h1>
      {query.isPending ? (
        <p role="status" className="flex min-h-48 items-center justify-center gap-2 text-sm"><LoaderCircle className="size-4 motion-safe:animate-spin" />{t("billing.loading")}</p>
      ) : !overview ? (
        <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-800">
          <p>{query.error?.message ?? t("billing.loadFailed")}</p>
          <button type="button" onClick={() => void query.refetch()} className="mt-2 min-h-11 cursor-pointer font-bold underline">{t("billing.paymentFlow.retry")}</button>
        </div>
      ) : (
        <div className="grid items-start gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <aside className="rounded-2xl bg-[#173d2b] p-6 text-white">
            <p className="text-xs font-bold uppercase tracking-widest text-orange-300">{t("billing.checkoutPage.summary")}</p>
            <h2 className="mt-2 text-2xl font-black">{plan?.name ?? planId}</h2>
            {!resume && regional && <p className="mt-4 border-t border-white/20 pt-4 text-2xl font-black tabular-nums">{price} <span className="text-sm font-medium">{t("billing.pendingPayment.perMonth")}</span></p>}
          </aside>
          <form noValidate onSubmit={submit} aria-busy={busy} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <h2 className="text-lg font-bold">{t("billing.provider.billing")}</h2>
            <p className="text-sm text-slate-600">{t("billing.paymentFlow.rule")}</p>
            {showFields && available && (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-xs font-bold">{t("billing.provider.billing")}
                  <select value={method} disabled={busy} onChange={event => setMethod(event.target.value as "PIX" | "BOLETO")} className={field}>
                    <option value="PIX">Pix</option>
                    <option value="BOLETO">{t("billing.billingTypes.BOLETO")}</option>
                  </select>
                </label>
                <label className="text-xs font-bold">{t("billing.paymentFlow.firstDue")}
                  <input ref={dueInput} type="date" required min={today} value={due} disabled={busy} onChange={event => { setDue(event.target.value); setInvalidDue(false); }} aria-invalid={invalidDue} aria-describedby={invalidDue ? "checkout-due-error" : undefined} className={field} />
                  {invalidDue && <span id="checkout-due-error" role="alert" className="mt-1 block text-red-800">{t("billing.paymentFlow.invalidDue")}</span>}
                </label>
                <label className="text-xs font-bold sm:col-span-2">{t("billing.paymentFlow.coupon")}
                  <input value={coupon} disabled={busy} maxLength={32} onChange={event => setCoupon(event.target.value.toUpperCase())} className={field} />
                </label>
              </div>
            )}
            <div className="min-h-6 text-sm">
              {!available && <p role="status" className="text-slate-700">{t("billing.checkoutPage.unavailable")}</p>}
              {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-red-800">{error}</p>}
              {awaitingLink && !error && <p role="status" className="text-slate-700">{t("billing.checkoutPage.awaitingLink")}</p>}
            </div>
            <button type="submit" disabled={!available || busy} className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-orange-700 px-4 py-2 text-sm font-bold text-white hover:bg-orange-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 disabled:cursor-not-allowed disabled:opacity-60">
              {t("billing.checkoutPage.continue", { provider: provider ?? "—" })}
              {busy ? <LoaderCircle aria-hidden="true" className="size-4 motion-safe:animate-spin" /> : <ArrowRight aria-hidden="true" className="size-4" />}
            </button>
            {resume && <Link href="/assinatura/cobrancas" className="inline-flex min-h-11 items-center text-sm font-bold text-orange-800 underline">{t("billing.paymentFlow.viewPayments")}</Link>}
          </form>
        </div>
      )}
    </section>
  );
}
