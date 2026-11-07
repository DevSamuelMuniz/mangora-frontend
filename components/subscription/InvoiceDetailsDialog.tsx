"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, ExternalLink, LoaderCircle, RefreshCw } from "lucide-react";
import ModalDialog from "@/components/ui/ModalDialog";
import { apiRequest } from "@/lib/api/client";
import { useI18n, useT } from "@/i18n/provider";
import type { InvoiceDetails } from "@/types/subscription";
import { invoiceStatus } from "./subscription-data";

export default function InvoiceDetailsDialog({ id, admin = false, onClose, onUpdated }: { id: string; admin?: boolean; onClose: () => void; onUpdated?: () => void }) {
  const t = useT();
  const { locale } = useI18n();
  const client = useQueryClient();
  const path = admin ? `/system-admin/payments/${id}` : `/subscription/invoices/${id}`;
  const key = ["invoice-details", admin, id];
  const query = useQuery({ queryKey: key, queryFn: ({ signal }) => apiRequest<InvoiceDetails>(path, { signal }), retry: false, gcTime: 0 });
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const detail = query.data;
  const money = (value: number) => new Intl.NumberFormat(locale, { style: "currency", currency: detail?.currency ?? "BRL" }).format(value);
  const date = (value: string) => new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" }).format(new Date(value.length === 10 ? `${value}T12:00:00Z` : value));
  async function refresh() {
    if (busy) return;
    setBusy(true); setError(""); setFeedback("");
    try {
      const updated = await apiRequest<InvoiceDetails>(`${path}/refresh`, { method: "POST" });
      client.setQueryData(key, updated);
      await client.invalidateQueries({ queryKey: ["subscription"] });
      onUpdated?.();
      setFeedback(t("billing.paymentFlow.updated"));
    } catch (cause) { setError(cause instanceof Error ? cause.message : t("billing.paymentFlow.checkError")); }
    finally { setBusy(false); }
  }
  async function copy(value: string) {
    try { await navigator.clipboard.writeText(value); setFeedback(t("billing.paymentFlow.copied")); }
    catch { setError(t("billing.paymentFlow.copyError")); }
  }
  const rate = (value: { value?: number; type?: string } | null) => value?.value == null ? "—" : value.type === "PERCENTAGE" ? `${value.value}%` : money(value.value);
  return <ModalDialog title={t("billing.paymentFlow.invoiceDetails")} onClose={onClose} busy={busy}>
    {query.isPending && <p role="status" className="flex min-h-48 items-center justify-center gap-2 text-sm text-slate-500"><LoaderCircle className="size-4 animate-spin" />{t("billing.loading")}</p>}
    {query.error && <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-800"><p>{query.error.message}</p><button type="button" onClick={() => void query.refetch()} className="mt-3 cursor-pointer font-bold underline">{t("billing.paymentFlow.retry")}</button></div>}
    {detail && <>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-4"><div><p className="text-3xl font-black tabular-nums">{money(detail.amount)}</p><p className="mt-1 text-xs text-slate-500">{detail.provider} · {detail.billingType ?? t("billing.provider.billing")}</p></div><span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold">{t(`billing.history.${invoiceStatus(detail.status)}`)}</span></div>
      {detail.description && <p className="text-sm text-slate-600">{detail.description}</p>}
      <dl className="grid grid-cols-2 gap-4 text-sm">
        <Field label={t("billing.paymentFlow.due")} value={date(detail.dueDate)} />
        <Field label={t("billing.paymentFlow.paidAt")} value={detail.paidAt ? date(detail.paidAt) : "—"} />
        <Field label={t("billing.paymentFlow.discount")} value={rate(detail.discount)} />
        <Field label={t("billing.paymentFlow.fine")} value={rate(detail.fine)} />
        <Field label={t("billing.paymentFlow.interest")} value={rate(detail.interest)} />
        {admin && <Field label={t("billing.paymentFlow.net")} value={detail.netAmount === null ? "—" : money(detail.netAmount)} />}
      </dl>
      <p className="break-all rounded-lg bg-slate-50 p-3 font-mono text-xs text-slate-500">{detail.reference}</p>
      <div className="flex flex-wrap gap-2">
        {detail.invoiceUrl && <External href={detail.invoiceUrl}>{t(detail.actions.pay ? "billing.pendingPayment.payNow" : "billing.paymentFlow.invoice")}</External>}
        {detail.bankSlipUrl && <External href={detail.bankSlipUrl}>{t("billing.paymentFlow.boleto")}</External>}
        {detail.receiptUrl && <External href={detail.receiptUrl}>{t("billing.paymentFlow.receipt")}</External>}
        {detail.actions.refresh && <button type="button" disabled={busy} onClick={() => void refresh()} className="flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-4 text-xs font-bold hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-orange-600 disabled:opacity-50"><RefreshCw className={`size-4 ${busy ? "animate-spin" : ""}`} />{t(busy ? "billing.paymentFlow.checking" : "billing.paymentFlow.refresh")}</button>}
      </div>
      {detail.pix && detail.actions.pay && <section className="rounded-xl border border-slate-200 p-4"><h3 className="text-sm font-bold">{t("billing.paymentFlow.pix")}</h3><div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Provider-supplied base64 is ephemeral and loaded only in this open dialog. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`data:image/png;base64,${detail.pix.encodedImage}`} alt={t("billing.paymentFlow.pix")} width={168} height={168} className="size-42 shrink-0" />
        <div className="min-w-0 flex-1"><p className="text-xs text-slate-500">{t("billing.paymentFlow.pixExpiration", { date: detail.pix.expirationDate })}</p><CopyValue value={detail.pix.payload} label={t("billing.paymentFlow.copyPix")} onCopy={copy} /></div>
      </div></section>}
      {detail.boleto && detail.actions.pay && <CopyValue value={detail.boleto.identificationField} label={t("billing.paymentFlow.copyBoleto")} onCopy={copy} />}
      {detail.partial && <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-900">{t("billing.paymentFlow.partial")}</p>}
      {detail.provider === "PADDLE" && <p className="text-sm text-slate-600">{t("billing.paymentFlow.portalHint")}</p>}
    </>}
    {feedback && <p role="status" className="rounded-xl bg-green-50 p-3 text-sm text-green-800">{feedback}</p>}
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
  </ModalDialog>;
}
function Field({ label, value }: { label: string; value: string }) { return <div><dt className="text-xs text-slate-500">{label}</dt><dd className="mt-1 font-semibold">{value}</dd></div>; }
function External({ href, children }: { href: string; children: React.ReactNode }) { return <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-2 text-xs font-bold text-orange-900 hover:bg-orange-100 focus-visible:outline-2 focus-visible:outline-orange-600">{children}<ExternalLink className="size-3.5" /></a>; }
function CopyValue({ value, label, onCopy }: { value: string; label: string; onCopy: (value: string) => Promise<void> }) { return <div className="mt-3"><label className="block text-xs font-semibold text-slate-600">{label}<textarea readOnly rows={3} value={value} className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-xs" /></label><button type="button" onClick={() => void onCopy(value)} className="mt-2 inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-4 text-xs font-bold hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-orange-600"><Copy className="size-3.5" />{label}</button></div>; }
