"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CalendarClock, CreditCard, ExternalLink, FileText, X } from "lucide-react";
import type { AuthSession } from "@/lib/auth/types";
import { useFormatters, useI18n, useT } from "@/i18n/provider";
import { useSubscription } from "@/features/subscription/hooks/useSubscription";
import { useCompanySettings, useSaveCompanySettings } from "@/features/settings/hooks/useSettings";
import type { CompanySettings } from "@/types/settings";
import type { SubscriptionInvoice } from "@/types/subscription";
import { apiRequest } from "@/lib/api/client";

export default function PendingSubscriptionPaymentModal({ session }: { session: AuthSession }) {
  const t = useT();
  const { locale } = useI18n();
  const { formatCurrency, formatDate } = useFormatters();
  const { data: overview } = useSubscription();
  const { data: companySettings } = useCompanySettings();
  const saveCompany = useSaveCompanySettings();
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [snoozedUntil, setSnoozedUntil] = useState(0);
  const [openingPayment, setOpeningPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [showBillingDetails, setShowBillingDetails] = useState(false);
  const [billingDetails, setBillingDetails] = useState({ legalName: "", document: "", email: "", phone: "", postalCode: "", street: "", number: "", city: "", state: "" });
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
    if (!hasOverdue || (!isOwner && !scheduleOverdue)) {
      setOpen(false);
      return;
    }
    const delay = Math.max(0, snoozedUntil - Date.now());
    const timer = window.setTimeout(() => setOpen(true), delay);
    return () => window.clearTimeout(timer);
  }, [hasOverdue, isOwner, scheduleOverdue, snoozedUntil]);

  function closeForOneMinute() {
    setOpen(false);
    setSnoozedUntil(Date.now() + 60_000);
  }

  if (!open || !hasOverdue) return null;
  const visibleInvoices = showAll ? overdueInvoices : overdueInvoices.slice(0, 1);
  const paymentInvoice = overdueInvoices.find((invoice) => invoice.invoiceUrl || invoice.bankSlipUrl);
  const payHref = paymentInvoice?.invoiceUrl ?? paymentInvoice?.bankSlipUrl;
  const formatPrice = (value: number) => formatCurrency(value, locale);
  const totalDue = overdueInvoices.length ? overdueInvoices.reduce((sum, invoice) => sum + invoice.amount, 0) : overview?.price ?? 0;

  function billingDetailsAreValid(company: CompanySettings | undefined) {
    const document = company?.document?.replace(/\D/g, "") ?? "";
    const phone = company?.phone?.replace(/\D/g, "") ?? "";
    const postalCode = company?.postalCode?.replace(/\D/g, "") ?? "";
    return Boolean(company?.legalName?.trim() && (document.length === 11 || document.length === 14) && company.email?.trim() && phone.length >= 10 && postalCode.length === 8 && company.street?.trim() && company.number?.trim() && company.city?.trim() && /^[A-Z]{2}$/i.test(company.state ?? ""));
  }

  function requestBillingDetails() {
    if (!companySettings) {
      setPaymentError(t("billing.pendingPayment.detailsLoadError"));
      return;
    }
    setBillingDetails({ legalName: companySettings.legalName ?? "", document: companySettings.document ?? "", email: companySettings.email ?? "", phone: companySettings.phone ?? "", postalCode: companySettings.postalCode ?? "", street: companySettings.street ?? "", number: companySettings.number ?? "", city: companySettings.city ?? "", state: companySettings.state ?? "" });
    setShowBillingDetails(true);
  }

  async function openPayment() {
    if (!isOwner || openingPayment) return;
    setPaymentError(null);
    if (!billingDetailsAreValid(companySettings)) {
      requestBillingDetails();
      return;
    }
    await createPaymentLink();
  }

  async function createPaymentLink(paymentTab?: Window | null) {
    if (openingPayment) return;
    if (payHref) {
      if (paymentTab && !paymentTab.closed) paymentTab.location.assign(payHref);
      else window.open(payHref, "_blank", "noopener,noreferrer");
      return;
    }
    setOpeningPayment(true);
    try {
      const result = await apiRequest<{ paymentUrl: string }>("/subscription/payment-link", { method: "POST", body: "{}" });
      if (paymentTab && !paymentTab.closed) paymentTab.location.assign(result.paymentUrl);
      else window.open(result.paymentUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      paymentTab?.close();
      setPaymentError(error instanceof Error ? error.message : t("billing.pendingPayment.paymentError"));
      setOpeningPayment(false);
    }
  }

  async function saveBillingDetailsAndPay(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!companySettings) return;
    const document = billingDetails.document.replace(/\D/g, "");
    const phone = billingDetails.phone.replace(/\D/g, "");
    const postalCode = billingDetails.postalCode.replace(/\D/g, "");
    const state = billingDetails.state.trim().toUpperCase();
    if (![11, 14].includes(document.length)) { setPaymentError(t("billing.pendingPayment.invalidDocument")); return; }
    if (phone.length < 10 || phone.length > 15) { setPaymentError(t("billing.pendingPayment.invalidPhone")); return; }
    if (!/^\d{8}$/.test(postalCode) || !billingDetails.legalName.trim() || !billingDetails.email.trim() || !billingDetails.street.trim() || !billingDetails.number.trim() || !billingDetails.city.trim() || !/^[A-Z]{2}$/.test(state)) { setPaymentError(t("billing.pendingPayment.requiredBillingDetails")); return; }
    setOpeningPayment(true);
    setPaymentError(null);
    let paymentTab: Window | null = null;
    try {
      paymentTab = window.open("about:blank", "_blank");
      await saveCompany.mutateAsync({ ...billingDetails, document, phone, postalCode, state });
      setShowBillingDetails(false);
      setOpeningPayment(false);
      await createPaymentLink(paymentTab);
    } catch (error) {
      paymentTab?.close();
      setPaymentError(error instanceof Error ? error.message : t("billing.pendingPayment.detailsSaveError"));
      setOpeningPayment(false);
    }
  }

  return <div className="fixed inset-0 z-[110] grid place-items-center overflow-y-auto bg-[#123d2b]/85 p-4 backdrop-blur-md" role="presentation">
    <section role="dialog" aria-modal="true" aria-labelledby="pending-payment-title" className="my-auto max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[1.75rem] border-2 border-[#123d2b] bg-white shadow-[8px_9px_0_#ffb21a]">
      <div className="relative overflow-hidden bg-gradient-to-br from-[#123d2b] to-[#1c6744] p-6 text-white sm:p-8">
        <div aria-hidden="true" className="absolute -right-7 -top-10 grid size-36 place-items-center rounded-full bg-white/10"><CreditCard className="size-14 text-white/40" /></div>
        <div className="relative flex items-start justify-between gap-4">
          <span className="grid size-12 place-items-center rounded-2xl bg-amber-300 text-[#713b00]"><AlertTriangle className="size-6" /></span>
          <button type="button" onClick={closeForOneMinute} aria-label={t("billing.pendingPayment.close")} title={t("billing.pendingPayment.close")} className="grid size-9 place-items-center rounded-xl border border-white/20 bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"><X className="size-5" /></button>
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
        {showBillingDetails && <form onSubmit={(event) => void saveBillingDetailsAndPay(event)} className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4"><h3 className="text-sm font-black text-[#123d2b]">{t("billing.pendingPayment.detailsTitle")}</h3><p className="mt-1 text-[10px] leading-4 text-slate-600">{t("billing.pendingPayment.detailsHint")}</p><div className="mt-3 grid gap-3 sm:grid-cols-2">{([ ["legalName", "legalName"], ["document", "document"], ["email", "email"], ["phone", "phone"], ["postalCode", "zip"], ["street", "street"], ["number", "number"], ["city", "city"], ["state", "state"] ] as const).map(([field, label]) => <label key={field} className={`text-[10px] font-bold text-[#315847] ${field === "street" || field === "city" ? "sm:col-span-2" : ""}`}>{t(`settings.panel.company.${label}`)}<input required type={field === "email" ? "email" : "text"} inputMode={field === "document" || field === "phone" || field === "postalCode" ? "numeric" : undefined} maxLength={field === "document" ? 18 : field === "phone" ? 16 : field === "postalCode" ? 9 : field === "state" ? 2 : undefined} value={billingDetails[field]} onChange={(event) => setBillingDetails((current) => ({ ...current, [field]: event.target.value }))} className="mt-1.5 h-10 w-full rounded-xl border border-[#123d2b]/15 bg-white px-3 text-xs" /></label>)}</div><div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={() => setShowBillingDetails(false)} className="h-10 rounded-xl border border-[#123d2b]/15 bg-white px-4 text-xs font-bold">{t("common.cancel")}</button><button type="submit" disabled={openingPayment || saveCompany.isPending} className="flex h-10 items-center justify-center gap-2 rounded-xl bg-[#ff6b1a] px-5 text-xs font-black text-white disabled:opacity-60">{openingPayment ? t("billing.pendingPayment.openingPayment") : t("billing.pendingPayment.saveAndPay")}</button></div></form>}
        {!showBillingDetails && <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">{isOwner ? <button type="button" onClick={() => void openPayment()} disabled={openingPayment} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#ff6b1a] px-5 text-xs font-black text-white shadow-[0_4px_0_#c9460b] hover:bg-[#e95b10] disabled:cursor-wait disabled:opacity-70">{openingPayment ? t("billing.pendingPayment.openingPayment") : t(paymentInvoice ? "billing.pendingPayment.payNow" : "billing.pendingPayment.goToBilling")}<ExternalLink className="size-4" /></button> : <p className="rounded-xl bg-amber-50 px-4 py-3 text-center text-xs font-bold text-amber-900">{t("billing.pendingPayment.ownerRequired")}</p>}</div>}
        {paymentError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-800">{paymentError}</p>}
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
