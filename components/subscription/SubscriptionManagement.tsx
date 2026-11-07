"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ArrowRight, Check, CreditCard, LoaderCircle, ShieldCheck, Users } from "lucide-react";
import { useI18n, useT } from "@/i18n/provider";
import { useCancelSubscription, useReactivateSubscription, useSubscription, useSubscriptionCheckout, useSubscriptionRequest } from "@/features/subscription/hooks/useSubscription";
import ModalDialog from "@/components/ui/ModalDialog";
import ContractAndHistory from "./ContractAndHistory";
import type { SubscriptionOverview } from "@/types/subscription";
import { addDaysToBrazilDateKey } from "@/lib/timezone";

type Plan = SubscriptionOverview["plans"][number];
const button = "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 disabled:cursor-not-allowed disabled:opacity-50";

export default function SubscriptionManagement() {
  const t = useT();
  const { locale } = useI18n();
  const query = useSubscription();
  const overview = query.data;
  const checkout = useSubscriptionCheckout();
  const request = useSubscriptionRequest();
  const cancel = useCancelSubscription();
  const reactivate = useReactivateSubscription();
  const [selected, setSelected] = useState<Plan | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [method, setMethod] = useState<"PIX" | "BOLETO">("PIX");
  const [due, setDue] = useState(() => addDaysToBrazilDateKey(0));
  const [coupon, setCoupon] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [fallback, setFallback] = useState<string | null>(null);
  const lock = useRef(false);
  const busy = checkout.isPending || request.isPending || cancel.isPending || reactivate.isPending;
  const money = (value: number) => new Intl.NumberFormat(locale, { style: "currency", currency: overview?.market?.currency ?? "BRL" }).format(value);
  const date = (value: string) => new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: overview?.enforcement?.timezone ?? "America/Sao_Paulo" }).format(new Date(value));
  async function contract() {
    if (!selected || !overview || lock.current) return;
    if (overview.provider.name === "ASAAS" && selected.id !== "ENTERPRISE" && (!due || due < addDaysToBrazilDateKey(0))) { setError(t("billing.paymentFlow.invalidDue")); return; }
    lock.current = true; setError(""); setMessage(""); setFallback(null);
    let tab: Window | null = null;
    try {
      if (selected.id === "ENTERPRISE") {
        await request.mutateAsync({ action: "CONTACT", targetPlan: selected.id });
        setMessage(t("billing.toasts.contactRequested"));
      } else {
        tab = window.open("about:blank", "_blank");
        if (tab) tab.opener = null;
        const result = await checkout.mutateAsync({ targetPlan: selected.id, ...(overview.provider.name === "ASAAS" ? { billingType: method, nextDueDate: due, couponCode: coupon.trim() || undefined } : {}) });
        if (result.checkoutUrl) {
          if (tab && !tab.closed) tab.location.assign(result.checkoutUrl);
          else setFallback(result.checkoutUrl);
        } else tab?.close();
        setMessage(t("billing.paymentFlow.checkoutCreated"));
      }
      setSelected(null);
    } catch (cause) { tab?.close(); setError(cause instanceof Error ? cause.message : t("billing.pendingPayment.paymentError")); }
    finally { lock.current = false; }
  }
  async function changeCancellation(revert: boolean) {
    if (lock.current) return;
    lock.current = true; setError(""); setMessage("");
    try {
      if (revert) await reactivate.mutateAsync(); else await cancel.mutateAsync();
      setCancelOpen(false);
      setMessage(t(revert ? "billing.toasts.reactivated" : "billing.manage.cancelScheduled"));
    } catch (cause) { setError(cause instanceof Error ? cause.message : t("billing.errors.cancel")); }
    finally { lock.current = false; }
  }
  if (query.isPending) return <p role="status" className="flex min-h-72 items-center justify-center gap-2 text-sm text-slate-500"><LoaderCircle className="size-4 animate-spin" />{t("billing.loading")}</p>;
  if (!overview) return <div role="alert" className="rounded-xl bg-red-50 p-5 text-sm text-red-800"><p>{query.error?.message ?? t("billing.loadFailed")}</p><button type="button" onClick={() => void query.refetch()} className="mt-3 cursor-pointer font-bold underline">{t("billing.paymentFlow.retry")}</button></div>;
  return <section className="space-y-6">
    <header className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-orange-700">{t("billing.eyebrow")}</p><h1 className="mt-2 text-3xl font-black">{t("billing.title")}</h1><p className="mt-2 text-sm text-slate-500">{t("billing.subtitle")}</p></div><Link href="/assinatura/cobrancas" className={`${button} bg-orange-600 text-white hover:bg-orange-700`}><CreditCard className="size-4" />{t("billing.paymentFlow.viewPayments")}<ArrowRight className="size-4" /></Link></header>
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <section className="rounded-2xl bg-[#173d2b] p-6 text-white"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-orange-300">{t("billing.paymentFlow.currentPlan")}</p><h2 className="mt-3 text-3xl font-black">{overview.planName}</h2></div><p className="rounded-full border border-white/20 px-3 py-2 text-xs font-semibold">{t(overview.accessBlocked ? "billing.paymentFlow.blocked" : `billing.status.${overview.trialExpired ? "FREE" : overview.status}`)}</p></div><p className="mt-5 text-3xl font-black tabular-nums">{overview.price === 0 ? t("billing.plan.free") : money(overview.price)}{overview.price > 0 && <span className="ml-2 text-sm font-medium text-white/65">{t("billing.pendingPayment.perMonth")}</span>}</p>{overview.billingBreakdown && <p className="mt-2 text-xs text-white/70">{overview.billingBreakdown.calculationText}</p>}<dl className="mt-6 grid gap-4 border-t border-white/20 pt-5 sm:grid-cols-2"><div><dt className="text-xs text-white/60">{t("billing.paymentFlow.due")}</dt><dd className="mt-1 font-semibold">{overview.billingDueAt || overview.nextBillingAt ? date((overview.billingDueAt ?? overview.nextBillingAt)!) : t("billing.plan.noCharge")}</dd></div><div><dt className="text-xs text-white/60">{t("billing.provider.billing")}</dt><dd className="mt-1 font-semibold">{overview.provider.name} · {overview.paymentMethod ?? "—"}</dd></div></dl></section>
      <section className="rounded-2xl border border-slate-200 bg-white p-6"><h2 className="flex items-center gap-2 font-bold"><ShieldCheck className="size-5 text-orange-600" />{t("billing.paymentFlow.access")}</h2><p className="mt-4 text-sm leading-6 text-slate-600">{overview.plan === "FREE" || overview.trialExpired ? t("billing.plan.freeHint") : t("billing.paymentFlow.rule")}</p>{overview.enforcement?.blockAt && <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">{t(overview.accessBlocked ? "billing.paymentFlow.blockedSince" : "billing.paymentFlow.cutoff", { date: date(overview.enforcement.blockAt), timezone: overview.enforcement.timezone })}</p>}{overview.pendingPlan && <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-900">{t("billing.paymentFlow.pendingPlan", { plan: overview.pendingPlan })}</p>}{overview.trialDaysRemaining > 0 && <p className="mt-3 text-sm font-semibold text-green-800">{t("billing.trialGate.daysRemaining", { count: overview.trialDaysRemaining })}</p>}<Link href="/assinatura/cobrancas" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-orange-800 underline underline-offset-4">{t("billing.paymentFlow.viewPayments")}<ArrowRight className="size-4" /></Link></section>
    </div>
    {message && <p role="status" className="rounded-xl bg-green-50 p-4 text-sm text-green-900">{message}</p>}
    {error && !selected && !cancelOpen && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-800">{error}</p>}
    {fallback && <a href={fallback} target="_blank" rel="noopener noreferrer" className="block font-bold text-orange-800 underline">{t("billing.paymentFlow.openPayment")}</a>}
    {overview.cancellation?.requested && <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4"><p className="text-sm font-semibold text-amber-950">{t("billing.manage.cancelScheduled")} {overview.cancellation.effectiveAt && date(overview.cancellation.effectiveAt)}</p>{overview.cancellation.active && overview.provider.name === "ASAAS" && <button type="button" disabled={busy} onClick={() => void changeCancellation(true)} className={`${button} border border-amber-300 bg-white hover:bg-amber-100`}>{t("billing.actions.reactivate")}</button>}</section>}
    <section className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="flex items-center gap-2 font-bold"><Users className="size-4 text-orange-600" />{t("billing.paymentFlow.usage")}</h2><div className="mt-4 grid gap-4 sm:grid-cols-3">{overview.usage.map(item => <div key={item.key} className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">{t(`billing.paymentFlow.${item.key}`)}</p><p className="mt-2 text-xl font-black tabular-nums">{item.current} / {item.limit ?? "∞"}</p></div>)}</div></section>
    <section><p className="text-xs font-bold uppercase tracking-widest text-orange-700">{t("billing.manage.availablePlans", { market: overview.market?.currency ?? "BRL" })}</p><h2 className="mt-2 text-xl font-black">{t("billing.manage.choosePlan")}</h2><div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{overview.plans.map(plan => <article key={plan.id} className={`flex flex-col rounded-2xl border bg-white p-5 ${plan.id === overview.plan ? "border-orange-400 ring-1 ring-orange-200" : "border-slate-200"}`}><h3 className="font-black">{plan.name}</h3><p className="mt-3 text-xl font-black">{plan.regionalPrice?.formatted ?? (plan.price === 0 ? t("billing.plan.free") : t("billing.plan.pricePending"))}</p><p className="mt-1 min-h-10 text-xs leading-5 text-slate-500">{plan.id === "FREE" ? t("billing.plan.freeHint") : t("billing.paymentFlow.perUnit")}</p><ul className="my-5 space-y-3 text-xs text-slate-600">{[["owners", plan.ownerLimit], ["employees", plan.employeeLimit], ["units", plan.unitLimit]].map(([key, value]) => <li key={key} className="flex items-center gap-2"><Check className="size-3 shrink-0 text-green-700" />{value ?? "∞"} {t(`billing.paymentFlow.${key}`)}</li>)}</ul><button type="button" disabled={busy || plan.id === "FREE" || (plan.id === overview.plan && overview.status === "ACTIVE" && !overview.cancellation?.requested) || (!!overview.pendingPlan && plan.id !== overview.pendingPlan)} onClick={() => { setError(""); setSelected(plan); }} className={`${button} mt-auto border border-slate-200 hover:bg-orange-50`}>{t(plan.id === overview.plan ? "billing.paymentFlow.currentPlan" : plan.id === "ENTERPRISE" ? "billing.actions.contactSales" : "billing.paymentFlow.choose")}</button></article>)}</div></section>
    <ContractAndHistory overview={overview} />
    {overview.provider.subscriptionConnected && overview.status !== "CANCELLED" && !overview.cancellation?.requested && <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5"><p className="max-w-xl text-xs leading-5 text-slate-500">{t("billing.manage.cancelNote")}</p><button type="button" disabled={busy} onClick={() => { setError(""); setCancelOpen(true); }} className={`${button} border border-red-200 text-red-700 hover:bg-red-50`}>{t("billing.actions.cancel")}</button></div>}
    {selected && <ModalDialog title={`${t("billing.paymentFlow.choose")} ${selected.name}`} onClose={() => setSelected(null)} busy={busy}><p className="text-sm text-slate-600">{selected.id === "ENTERPRISE" ? t("billing.toasts.contactHint") : t("billing.paymentFlow.checkoutHint", { price: selected.regionalPrice?.formatted ?? t("billing.plan.pricePending") })}</p><p className="rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-950">{t("billing.paymentFlow.rule")}</p>{overview.provider.name === "ASAAS" && selected.id !== "ENTERPRISE" && <form id="subscription-checkout" noValidate onSubmit={event => { event.preventDefault(); void contract(); }} className="grid gap-4 sm:grid-cols-2"><label className="text-xs font-bold">{t("billing.provider.billing")}<select value={method} onChange={event => setMethod(event.target.value as "PIX" | "BOLETO")} disabled={busy} className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3"><option value="PIX">Pix</option><option value="BOLETO">{t("billing.billingTypes.BOLETO")}</option></select></label><label className="text-xs font-bold">{t("billing.paymentFlow.firstDue")}<input type="date" min={addDaysToBrazilDateKey(0)} value={due} disabled={busy} onChange={event => setDue(event.target.value)} aria-invalid={!!error} className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3" /></label><label className="text-xs font-bold sm:col-span-2">{t("billing.paymentFlow.coupon")}<input value={coupon} disabled={busy} maxLength={32} onChange={event => setCoupon(event.target.value.toUpperCase())} className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3" /></label></form>}{error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}<div className="flex flex-wrap justify-end gap-2"><button type="button" disabled={busy} onClick={() => setSelected(null)} className={`${button} border border-slate-200 hover:bg-slate-50`}>{t("common.actions.cancel")}</button><button type="button" disabled={busy || (selected.id !== "ENTERPRISE" && (!selected.regionalPrice?.checkoutAvailable || !overview.provider.configured))} onClick={() => void contract()} className={`${button} bg-orange-600 text-white hover:bg-orange-700`}>{busy && <LoaderCircle className="size-4 animate-spin" />}{t(selected.id === "ENTERPRISE" ? "billing.actions.contactSales" : "billing.actions.checkout")}</button></div></ModalDialog>}
    {cancelOpen && <ModalDialog title={t("billing.actions.cancel")} onClose={() => setCancelOpen(false)} busy={busy}><p className="text-sm leading-6 text-slate-600">{t("billing.manage.cancelConfirm")}</p>{error && <p role="alert" className="text-sm text-red-800">{error}</p>}<div className="flex flex-wrap justify-end gap-3"><button type="button" disabled={busy} onClick={() => setCancelOpen(false)} className={`${button} border border-slate-200 hover:bg-slate-50`}>{t("common.actions.cancel")}</button><button type="button" disabled={busy} onClick={() => void changeCancellation(false)} className={`${button} bg-red-700 text-white hover:bg-red-800`}>{t("billing.actions.cancel")}</button></div></ModalDialog>}
  </section>;
}
