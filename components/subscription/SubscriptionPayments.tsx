"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CreditCard, ExternalLink, FileText, LoaderCircle, RefreshCw } from "lucide-react";
import { useI18n, useT } from "@/i18n/provider";
import { useReconcileSubscription, useSubscription } from "@/features/subscription/hooks/useSubscription";
import { apiRequest } from "@/lib/api/client";
import type { SubscriptionInvoices } from "@/types/subscription";
import InvoiceDetailsDialog from "./InvoiceDetailsDialog";
import { invoiceStatus } from "./subscription-data";

export default function SubscriptionPayments() {
  const t = useT();
  const { locale } = useI18n();
  const router = useRouter();
  const params = useSearchParams();
  const client = useQueryClient();
  const { data: overview } = useSubscription();
  const reconcile = useReconcileSubscription();
  const status = params.get("status") ?? "";
  const page = Math.max(1, Number(params.get("page")) || 1);
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [fallbackLink, setFallbackLink] = useState<string | null>(null);
  const invoices = useQuery({
    queryKey: ["subscription", "invoices", page, status], retry: 1,
    queryFn: ({ signal }) => apiRequest<SubscriptionInvoices>(`/subscription/invoices?page=${page}&status=${encodeURIComponent(status)}`, { signal }),
    refetchOnWindowFocus: true, refetchInterval: overview?.pendingPlan || overview?.accessBlocked ? 15_000 : 60_000,
  });
  const money = (amount: number, currency = overview?.market?.currency ?? "BRL") => new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);
  const date = (value: string) => new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: overview?.enforcement?.timezone ?? overview?.market?.timezone ?? "America/Sao_Paulo" }).format(new Date(value));
  function navigate(nextPage: number, nextStatus = status) {
    const query = new URLSearchParams();
    if (nextStatus) query.set("status", nextStatus);
    if (nextPage > 1) query.set("page", String(nextPage));
    router.replace(`/assinatura/cobrancas${query.size ? `?${query}` : ""}`, { scroll: false });
  }
  async function openProvider(portal: boolean) {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError(""); setFallbackLink(null);
    const tab = window.open("about:blank", "_blank");
    if (tab) tab.opener = null;
    try {
      const result = await apiRequest<{ paymentUrl: string }>(portal ? "/subscription/portal" : "/subscription/payment-link", { method: "POST" });
      if (tab && !tab.closed) tab.location.assign(result.paymentUrl);
      else setFallbackLink(result.paymentUrl);
      await client.invalidateQueries({ queryKey: ["subscription"] });
    } catch (cause) { tab?.close(); setError(cause instanceof Error ? cause.message : t("billing.pendingPayment.paymentError")); }
    finally { lock.current = false; setBusy(false); void client.invalidateQueries({ queryKey: ["subscription"] }); }
  }
  async function check() {
    setError(""); setMessage("");
    try {
      const result = await reconcile.mutateAsync();
      setMessage(t(result.pendingPlan || result.accessBlocked ? "billing.paymentFlow.waiting" : "billing.paymentFlow.released"));
    } catch (cause) { setError(cause instanceof Error ? cause.message : t("billing.paymentFlow.checkError")); }
  }
  const totalPages = Math.max(1, Math.ceil((invoices.data?.total ?? 0) / 20));
  const summaries = [
    { key: "open", statuses: ["PENDING", "OVERDUE"], label: "billing.paymentFlow.openTotal", color: "text-amber-800" },
    { key: "paid", statuses: ["CONFIRMED", "RECEIVED"], label: "billing.paymentFlow.paidTotal", color: "text-green-800" },
  ];
  return <section className="space-y-6">
    <Link href="/assinatura" className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-orange-700"><ArrowLeft className="size-4" />{t("billing.paymentFlow.back")}</Link>
    <header className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-orange-700">{t("billing.eyebrow")}</p><h1 className="mt-2 text-3xl font-black text-slate-950">{t("billing.paymentFlow.viewPayments")}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{t("billing.paymentFlow.pageHint")}</p></div><FileText className="size-8 text-orange-600" /></header>
    <div className={`rounded-2xl border p-4 text-sm ${overview?.accessBlocked ? "border-red-200 bg-red-50 text-red-900" : "border-slate-200 bg-white text-slate-600"}`}><p className="font-bold">{t(overview?.accessBlocked ? "billing.paymentFlow.blocked" : "billing.paymentFlow.rule")}</p>{overview?.enforcement?.blockAt && <p className="mt-2 text-xs">{t(overview.accessBlocked ? "billing.paymentFlow.blockedSince" : "billing.paymentFlow.cutoff", { date: date(overview.enforcement.blockAt), timezone: overview.enforcement.timezone })}</p>}</div>
    <div className="flex flex-wrap gap-3">
      <button type="button" onClick={() => void check()} disabled={reconcile.isPending || busy} className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-orange-600 disabled:opacity-50"><RefreshCw className={`size-4 ${reconcile.isPending ? "animate-spin" : ""}`} />{t(reconcile.isPending ? "billing.paymentFlow.checking" : "billing.paymentFlow.check")}</button>
      {overview?.provider.name === "PADDLE" ? <button type="button" disabled={busy || !overview.provider.configured} onClick={() => void openProvider(true)} className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-orange-600 px-4 text-sm font-bold text-white hover:bg-orange-700 disabled:opacity-50"><ExternalLink className="size-4" />{t("billing.paymentFlow.portal")}</button> : <button type="button" disabled={busy || !overview?.provider.configured || (!overview?.accessBlocked && !overview?.pendingPlan && !invoices.data?.summary.some(row => ["PENDING", "OVERDUE"].includes(row.status)))} onClick={() => void openProvider(false)} className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-orange-600 px-4 text-sm font-bold text-white hover:bg-orange-700 disabled:opacity-50"><CreditCard className="size-4" />{t(busy ? "billing.pendingPayment.openingPayment" : "billing.paymentFlow.openPayment")}</button>}
      <Link href="/configuracoes" className="inline-flex h-11 items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold hover:bg-slate-100">{t("billing.paymentFlow.billingDetails")}</Link>
    </div>
    {fallbackLink && <a href={fallbackLink} target="_blank" rel="noopener noreferrer" className="block rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm font-bold text-orange-900 underline">{t("billing.paymentFlow.openPayment")} <ExternalLink className="inline size-4" /></a>}
    {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-800">{error}</p>}
    {message && <p role="status" className="rounded-xl bg-green-50 p-4 text-sm text-green-900">{message}</p>}
    <div className="grid gap-4 sm:grid-cols-2">{summaries.map(summary => {
      const totals = new Map<string, number>();
      for (const row of invoices.data?.summary ?? []) if (summary.statuses.includes(row.status)) totals.set(row.currency, (totals.get(row.currency) ?? 0) + row.amount);
      return <div key={summary.key} className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-xs font-bold text-slate-500">{t(summary.label)}</p><p className={`mt-2 text-2xl font-black tabular-nums ${summary.color}`}>{invoices.isPending ? "—" : [...totals].map(([currency, amount]) => money(amount, currency)).join(" · ") || money(0)}</p></div>;
    })}</div>
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-5"><h2 className="font-bold">{t("billing.paymentFlow.history")}</h2><label className="flex items-center gap-2 text-xs font-semibold text-slate-600">{t("billing.paymentFlow.filter")}<select value={status} onChange={event => navigate(1, event.target.value)} className="h-11 rounded-xl border border-slate-200 bg-white px-3"><option value="">{t("billing.paymentFlow.all")}</option>{["PENDING", "OVERDUE", "CONFIRMED", "RECEIVED", "REFUNDED", "CANCELLED"].map(value => <option key={value} value={value}>{t(`billing.history.${invoiceStatus(value)}`)}</option>)}</select></label></div>
      <div className="min-h-52" aria-busy={invoices.isFetching}>
        {invoices.isPending ? <p role="status" className="flex min-h-52 items-center justify-center gap-2 text-sm text-slate-500"><LoaderCircle className="size-4 animate-spin" />{t("billing.loading")}</p> : invoices.error ? <div role="alert" className="p-5 text-sm text-red-800"><p>{invoices.error.message}</p><button type="button" onClick={() => void invoices.refetch()} className="mt-3 cursor-pointer font-bold underline">{t("billing.paymentFlow.retry")}</button></div> : invoices.data?.items.length ? <ul className="divide-y divide-slate-100">{invoices.data.items.map(invoice => <li key={invoice.id} className="grid gap-3 p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-center"><div><p className="text-lg font-black tabular-nums">{money(invoice.amount, invoice.currency)}</p><p className="mt-1 text-xs text-slate-500">{t("billing.paymentFlow.due")}: {date(invoice.dueDate)}</p></div><div><p className="text-xs font-bold text-slate-700">{t(`billing.history.${invoiceStatus(invoice.status)}`)}</p><p className="mt-1 text-xs text-slate-500">{invoice.provider ?? "MANUAL"} · {invoice.billingType ?? "—"}</p>{invoice.paidAt && <p className="mt-1 text-xs text-green-700">{t("billing.paymentFlow.paidAt")}: {date(invoice.paidAt)}</p>}</div><button type="button" onClick={() => setSelected(invoice.id)} className="h-11 cursor-pointer rounded-xl border border-slate-200 px-4 text-xs font-bold hover:border-orange-300 hover:bg-orange-50 focus-visible:outline-2 focus-visible:outline-orange-600">{t("billing.paymentFlow.details")}</button></li>)}</ul> : <p className="p-10 text-center text-sm text-slate-500">{t("billing.paymentFlow.empty")}</p>}
      </div>
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 p-4 text-xs text-slate-500"><p role="status">{t("billing.paymentFlow.pagination", { page: invoices.data?.page ?? page, pages: totalPages, total: invoices.data?.total ?? 0 })}</p><div className="flex gap-2"><button type="button" disabled={page <= 1 || invoices.isFetching} onClick={() => navigate(page - 1)} className="h-10 cursor-pointer rounded-lg border border-slate-200 px-3 font-bold hover:bg-slate-50 disabled:opacity-40">{t("billing.paymentFlow.previous")}</button><button type="button" disabled={page >= totalPages || invoices.isFetching} onClick={() => navigate(page + 1)} className="h-10 cursor-pointer rounded-lg border border-slate-200 px-3 font-bold hover:bg-slate-50 disabled:opacity-40">{t("billing.paymentFlow.next")}</button></div></footer>
    </section>
    {overview?.provider.name === "PADDLE" && <p className="text-sm text-slate-500">{t("billing.paymentFlow.portalHint")}</p>}
    {selected && <InvoiceDetailsDialog id={selected} onClose={() => setSelected(null)} />}
  </section>;
}
