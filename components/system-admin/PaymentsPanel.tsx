"use client";

import { useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, ExternalLink, LoaderCircle, RefreshCw, Trash2 } from "lucide-react";
import { useI18n, useT } from "@/i18n/provider";
import ModalDialog from "@/components/ui/ModalDialog";
import InvoiceDetailsDialog from "@/components/subscription/InvoiceDetailsDialog";
import { invoiceStatus } from "@/components/subscription/subscription-data";

export type SystemPayment = { id: string; currency?: string; paymentProvider?: "ASAAS" | "PADDLE" | null; providerPaymentId: string; billingType: string | null; status: string; rawStatus: string; amount: number; netAmount: number | null; dueDate: string; paidAt: string | null; invoiceUrl: string | null; bankSlipUrl: string | null; createdAt: string; isDuplicate?: boolean; duplicateOfPaymentId?: string | null; company: { id: string; tradeName: string; email: string | null; subscriptionPlan: string } };
export type PaymentReconciliation = { items: SystemPayment[]; checked: number; updated: number; failed: number; providerConfigured: boolean };
export default function PaymentsPanel({ items, status, onStatus, onReconcile, onCancel, onReload }: { items: SystemPayment[]; status: string; onStatus: (status: string) => void; onReconcile: () => Promise<PaymentReconciliation>; onCancel: (id: string) => Promise<"CANCELLED" | "RECONCILED" | "UPDATED">; onReload: () => void }) {
  const t = useT();
  const { locale } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const pageSize = 20;
  const pages = Math.max(1, Math.ceil(items.length / pageSize));
  const page = Math.max(1, Math.min(Number(params.get("paymentPage")) || 1, pages));
  const [selected, setSelected] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<SystemPayment | null>(null);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const money = (amount: number, currency = "BRL") => new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);
  const date = (value: string) => new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "America/Sao_Paulo" }).format(new Date(value));
  function navigate(value: number) { const query = new URLSearchParams(params); query.set("paymentPage", String(value)); router.replace(`${pathname}?${query}`, { scroll: false }); }
  async function refresh() {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError(""); setFeedback("");
    try { const result = await onReconcile(); setFeedback(t(result.providerConfigured ? "systemAdmin.payments.reconcileResult" : "systemAdmin.payments.providerUnavailable", { checked: result.checked, updated: result.updated, failed: result.failed })); }
    catch (cause) { setError(cause instanceof Error ? cause.message : t("billing.paymentFlow.checkError")); }
    finally { lock.current = false; setBusy(false); }
  }
  async function cancel() {
    if (!cancelling || lock.current) return;
    lock.current = true; setBusy(true); setError(""); setFeedback("");
    try { const result = await onCancel(cancelling.id); setFeedback(t(result === "CANCELLED" ? "systemAdmin.payments.cancelled" : "systemAdmin.payments.reconciledInstead")); setCancelling(null); }
    catch (cause) { setError(cause instanceof Error ? cause.message : t("systemAdmin.errors.save")); }
    finally { lock.current = false; setBusy(false); }
  }
  return <section className="space-y-4">
    <header className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-2xl font-black text-[#173d2b]">{t("billing.paymentFlow.viewPayments")}</h2><p className="mt-2 text-sm text-slate-500">{t("billing.paymentFlow.adminHint")}</p></div><button type="button" disabled={busy} onClick={() => void refresh()} className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-[#173d2b] px-4 text-sm font-bold text-white hover:bg-green-800 disabled:opacity-50"><RefreshCw className={`size-4 ${busy ? "animate-spin" : ""}`} />{t("billing.paymentFlow.refresh")}</button></header>
    <div className="grid gap-3 sm:grid-cols-3">{[["billing.paymentFlow.records", items.length], ["billing.paymentFlow.pendingCount", items.filter(item => ["PENDING", "OVERDUE"].includes(item.status)).length], ["billing.paymentFlow.duplicates", items.filter(item => item.isDuplicate).length]].map(([label, value]) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">{t(String(label))}</p><p className="mt-2 text-2xl font-black tabular-nums">{value}</p></div>)}</div>
    {feedback && <p role="status" className="rounded-xl bg-green-50 p-4 text-sm text-green-900">{feedback}</p>}
    {error && !cancelling && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-800">{error}</p>}
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-5"><h3 className="font-bold">{t("billing.paymentFlow.history")}</h3><label className="flex items-center gap-2 text-xs font-semibold text-slate-600">{t("billing.paymentFlow.filter")}<select value={status} onChange={event => onStatus(event.target.value)} className="h-11 rounded-xl border border-slate-200 px-3"><option value="">{t("billing.paymentFlow.all")}</option>{["PENDING", "OVERDUE", "CONFIRMED", "RECEIVED", "REFUNDED", "CANCELLED"].map(value => <option key={value} value={value}>{t(`billing.history.${invoiceStatus(value)}`)}</option>)}</select></label></div>
      <ul className="min-h-52 divide-y divide-slate-100">{items.slice((page - 1) * pageSize, page * pageSize).map(payment => <li key={payment.id} className="grid gap-4 p-5 lg:grid-cols-[1.3fr_.8fr_1fr_auto] lg:items-center"><div className="min-w-0"><p className="font-bold text-[#173d2b]">{payment.company.tradeName}</p><p className="mt-1 break-all text-xs text-slate-500">{payment.providerPaymentId}</p><p className="mt-1 text-xs text-slate-500">{payment.paymentProvider ?? (payment.providerPaymentId.startsWith("MANUAL:") ? "MANUAL" : "ASAAS")} · {payment.billingType ?? "—"}</p>{payment.isDuplicate && <p className="mt-2 flex items-center gap-1 text-xs font-bold text-amber-800"><AlertTriangle className="size-3.5" />{t("systemAdmin.payments.possibleDuplicate")}</p>}</div><div><p className="text-lg font-black tabular-nums">{money(payment.amount, payment.currency)}</p>{payment.netAmount !== null && <p className="mt-1 text-xs text-slate-500">{t("billing.paymentFlow.net")}: {money(payment.netAmount, payment.currency)}</p>}</div><div><p className={`text-xs font-bold ${["CONFIRMED", "RECEIVED"].includes(payment.status) ? "text-green-700" : ["OVERDUE", "REFUNDED"].includes(payment.status) ? "text-red-700" : "text-slate-600"}`}>{t(`billing.history.${invoiceStatus(payment.status)}`)}</p><p className="mt-1 text-xs text-slate-500">{t("billing.paymentFlow.due")}: {date(payment.dueDate)}</p>{payment.paidAt && <p className="mt-1 text-xs text-slate-500">{t("billing.paymentFlow.paidAt")}: {date(payment.paidAt)}</p>}</div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => setSelected(payment.id)} className="h-11 cursor-pointer rounded-xl border border-slate-200 px-3 text-xs font-bold hover:bg-orange-50 focus-visible:outline-2 focus-visible:outline-orange-600">{t("billing.paymentFlow.details")}</button>{(payment.invoiceUrl || payment.bankSlipUrl) && <a href={payment.invoiceUrl ?? payment.bankSlipUrl!} target="_blank" rel="noopener noreferrer" aria-label={t("billing.paymentFlow.invoice")} className="grid size-11 place-items-center rounded-xl border border-slate-200 hover:bg-slate-50"><ExternalLink className="size-4" /></a>}{["PENDING", "OVERDUE"].includes(payment.status) && payment.providerPaymentId.startsWith("pay_") && <button type="button" disabled={busy} onClick={() => { setError(""); setCancelling(payment); }} className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-red-200 px-3 text-xs font-bold text-red-700 hover:bg-red-50 disabled:opacity-50"><Trash2 className="size-3.5" />{t("systemAdmin.payments.cancelPending")}</button>}</div></li>)}{!items.length && <li className="p-10 text-center text-sm text-slate-500">{t("billing.paymentFlow.empty")}</li>}</ul>
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 p-4 text-xs text-slate-500"><p>{t("billing.paymentFlow.pagination", { page, pages, total: items.length })}</p><div className="flex gap-2"><button type="button" disabled={page <= 1} onClick={() => navigate(page - 1)} className="h-10 cursor-pointer rounded-lg border border-slate-200 px-3 hover:bg-slate-50 disabled:opacity-40">{t("billing.paymentFlow.previous")}</button><button type="button" disabled={page >= pages} onClick={() => navigate(page + 1)} className="h-10 cursor-pointer rounded-lg border border-slate-200 px-3 hover:bg-slate-50 disabled:opacity-40">{t("billing.paymentFlow.next")}</button></div></footer>
    </div>
    {selected && <InvoiceDetailsDialog id={selected} admin onClose={() => setSelected(null)} onUpdated={onReload} />}
    {cancelling && <ModalDialog title={t("systemAdmin.payments.cancelPending")} onClose={() => setCancelling(null)} busy={busy}><p className="text-sm leading-6 text-slate-600">{t("systemAdmin.payments.cancelConfirm", { company: cancelling.company.tradeName })}</p><p className="font-bold">{money(cancelling.amount, cancelling.currency)}</p>{error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}<div className="flex justify-end gap-3"><button type="button" disabled={busy} onClick={() => setCancelling(null)} className="h-11 cursor-pointer rounded-xl border border-slate-200 px-4 text-sm font-bold hover:bg-slate-50">{t("common.actions.cancel")}</button><button type="button" disabled={busy} onClick={() => void cancel()} className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-red-700 px-4 text-sm font-bold text-white hover:bg-red-800 disabled:opacity-50">{busy && <LoaderCircle className="size-4 animate-spin" />}{t("systemAdmin.payments.cancelPending")}</button></div></ModalDialog>}
  </section>;
}
