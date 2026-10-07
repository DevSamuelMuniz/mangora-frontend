"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CalendarClock, CreditCard, ExternalLink, FileText } from "lucide-react";
import type { AuthSession } from "@/lib/auth/types";
import { useFormatters, useI18n, useT } from "@/i18n/provider";
import { useSubscription } from "@/features/subscription/hooks/useSubscription";
import type { SubscriptionInvoice } from "@/types/subscription";

export default function PendingSubscriptionPaymentModal({ session }: { session: AuthSession }) {
  const t = useT();
  const { locale } = useI18n();
  const { formatCurrency, formatDate } = useFormatters();
  const { data: overview } = useSubscription();
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const isOwner = session.membership.role === "OWNER";

  const overdueInvoices = useMemo(() => {
    if (!overview) return [];
    const now = Date.now();
    return overview.invoices
      .filter((invoice) => invoice.status === "OVERDUE" || ((invoice.status === "PENDING" || invoice.status === "CONFIRMED") && new Date(invoice.dueDate).getTime() < now))
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [overview]);
  // Use the live subscription schedule when the session was created before the
  // admin edited its due date. Date-only comparison avoids UTC/local midnight drift.
  const dueDate = session.company.billingDueAt ?? overview?.nextBillingAt ?? null;
  const dueKey = dueDate?.slice(0, 10) ?? "";
  const now = new Date();
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const dueTodayOrEarlier = Boolean(dueKey && dueKey <= todayKey);
  const scheduleOverdue = Boolean(dueTodayOrEarlier && session.company.subscriptionPlan !== "FREE" && session.company.subscriptionStatus !== "CANCELLED");
  const hasOverdue = overdueInvoices.length > 0 || scheduleOverdue;

  useEffect(() => {
    if (!hasOverdue || (!isOwner && !scheduleOverdue)) return;
    const timer = window.setTimeout(() => {
      setOpen(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [hasOverdue, isOwner, scheduleOverdue]);

  if (!open || !hasOverdue) return null;
  const visibleInvoices = showAll ? overdueInvoices : overdueInvoices.slice(0, 1);
  const paymentInvoice = overdueInvoices.find((invoice) => invoice.invoiceUrl || invoice.bankSlipUrl);
  const payHref = paymentInvoice?.invoiceUrl ?? paymentInvoice?.bankSlipUrl ?? "/assinatura";
  const formatPrice = (value: number) => formatCurrency(value, locale);
  const totalDue = overdueInvoices.length ? overdueInvoices.reduce((sum, invoice) => sum + invoice.amount, 0) : overview?.price ?? 0;

  return <div className="fixed inset-0 z-[110] grid place-items-center overflow-y-auto bg-[#123d2b]/85 p-4 backdrop-blur-md" role="presentation">
    <section role="dialog" aria-modal="true" aria-labelledby="pending-payment-title" className="my-auto max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[1.75rem] border-2 border-[#123d2b] bg-white shadow-[8px_9px_0_#ffb21a]">
      <div className="relative overflow-hidden bg-gradient-to-br from-[#123d2b] to-[#1c6744] p-6 text-white sm:p-8">
        <div aria-hidden="true" className="absolute -right-7 -top-10 grid size-36 place-items-center rounded-full bg-white/10"><CreditCard className="size-14 text-white/40" /></div>
        <div className="relative flex items-start justify-between gap-4">
          <span className="grid size-12 place-items-center rounded-2xl bg-amber-300 text-[#713b00]"><AlertTriangle className="size-6" /></span>
        </div>
        <p className="relative mt-5 text-[10px] font-black uppercase tracking-[.17em] text-amber-300">{t("billing.pendingPayment.eyebrow")}</p>
        <h2 id="pending-payment-title" className="relative mt-2 max-w-lg text-2xl font-black sm:text-3xl">{t("billing.pendingPayment.title")}</h2>
        <p className="relative mt-2 max-w-xl text-xs leading-5 text-white/75">{t("billing.pendingPayment.description", { company: session.company.tradeName })}</p>
      </div>
      <div className="space-y-4 p-5 sm:p-7">
        <div className="grid gap-3 sm:grid-cols-3">
          <Summary icon={FileText} label={t("billing.pendingPayment.plan")} value={overview?.pendingPlan ?? overview?.planName ?? session.company.subscriptionPlan} />
          <Summary icon={CreditCard} label={t(overdueInvoices.length ? "billing.pendingPayment.totalDue" : "billing.pendingPayment.monthlyPrice")} value={formatCurrency(totalDue, locale)} />
          <Summary icon={CalendarClock} label={t(overdueInvoices.length ? "billing.pendingPayment.overdueCount" : "billing.pendingPayment.dueDateLabel")} value={overdueInvoices.length ? String(overdueInvoices.length) : dueDate ? formatDate(dueDate) : "—"} />
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between gap-2"><h3 className="text-xs font-black text-[#123d2b]">{t(overdueInvoices.length ? "billing.pendingPayment.invoicesTitle" : "billing.pendingPayment.nextStepTitle")}</h3>{overdueInvoices.length > 1 && <button type="button" onClick={() => setShowAll((value) => !value)} className="text-[10px] font-bold text-orange-700 underline underline-offset-2">{showAll ? t("billing.pendingPayment.showLess") : t("billing.pendingPayment.showAll", { count: overdueInvoices.length })}</button>}</div>
          <div className="space-y-2">{visibleInvoices.map((invoice) => <InvoiceCard key={invoice.id} invoice={invoice} formatCurrency={formatPrice} formatDate={formatDate} t={t} />)}{scheduleOverdue && overdueInvoices.length === 0 && <article className="rounded-xl border border-amber-200 bg-amber-50/60 p-4"><p className="text-xs font-black text-[#123d2b]">{t("billing.pendingPayment.scheduleTitle")}</p><p className="mt-1 text-[10px] leading-4 text-slate-700">{t("billing.pendingPayment.scheduleOnly", { date: dueDate ? formatDate(dueDate) : "—" })}</p><p className="mt-3 text-lg font-black text-[#123d2b]">{formatCurrency(overview?.price ?? 0, locale)}<span className="ml-1 text-[10px] font-semibold text-slate-500">{t("billing.pendingPayment.perMonth")}</span></p></article>}</div>
        </div>
        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
          {isOwner ? <a href={payHref} target={paymentInvoice ? "_blank" : undefined} rel={paymentInvoice ? "noreferrer" : undefined} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#ff6b1a] px-5 text-xs font-black text-white shadow-[0_4px_0_#c9460b] hover:bg-[#e95b10]">{t(paymentInvoice ? "billing.pendingPayment.payNow" : "billing.pendingPayment.goToBilling")}<ExternalLink className="size-4" /></a> : <p className="rounded-xl bg-amber-50 px-4 py-3 text-center text-xs font-bold text-amber-900">{t("billing.pendingPayment.ownerRequired")}</p>}
        </div>
      </div>
    </section>
  </div>;
}

function Summary({ icon: Icon, label, value }: { icon: typeof CreditCard; label: string; value: string }) {
  return <div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><div className="flex items-center gap-2 text-slate-400"><Icon className="size-3.5" /><span className="text-[9px] font-bold uppercase tracking-wide">{label}</span></div><p className="mt-2 text-sm font-black text-[#123d2b]">{value}</p></div>;
}

function InvoiceCard({ invoice, formatCurrency, formatDate, t }: { invoice: SubscriptionInvoice; formatCurrency: (value: number) => string; formatDate: (value: string) => string; t: (key: string, params?: Record<string, string | number>) => string }) {
  const paymentUrl = invoice.invoiceUrl ?? invoice.bankSlipUrl;
  const lateDays = Math.max(1, Math.ceil((Date.now() - new Date(invoice.dueDate).getTime()) / 86_400_000));
  return <article className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
    <div><p className="text-lg font-black text-[#123d2b]">{formatCurrency(invoice.amount)}</p><div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-600"><span>{t("billing.pendingPayment.dueDate", { date: formatDate(invoice.dueDate) })}</span><span>{invoice.billingType ? t(`billing.billingTypes.${invoice.billingType}`) : t("billing.provider.billing")}</span><span>{t("billing.pendingPayment.lateDays", { count: lateDays })}</span></div><p className="mt-1 text-[9px] text-slate-400">{t("billing.pendingPayment.reference", { reference: invoice.reference })}</p></div>
    {paymentUrl ? <a href={paymentUrl} target="_blank" rel="noreferrer" className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-orange-200 bg-white px-3 text-[10px] font-black text-orange-800 hover:bg-orange-50">{t("billing.pendingPayment.secondCopy")}<ExternalLink className="size-3" /></a> : <span className="rounded-lg bg-slate-100 px-3 py-2 text-[10px] font-bold text-slate-500">{t("billing.pendingPayment.paymentLinkUnavailable")}</span>}
  </article>;
}
