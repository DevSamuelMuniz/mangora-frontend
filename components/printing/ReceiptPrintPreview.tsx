"use client";
import { useFormatters, useT } from "@/i18n/provider";
import type { Sale } from "@/types/sale";
import type { ReceiptMode } from "@/lib/pdv/print";

export default function ReceiptPrintPreview({ sale, mode, onModeChange }: { sale: Sale; mode: ReceiptMode; onModeChange: (mode: ReceiptMode) => void }) {
  const t = useT();
  const { formatCurrency, formatDateTime } = useFormatters();
  return <>
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-bold">{t("labels.dialog.receiptSummary")}</h3>
      <p className="mt-3 text-lg font-black">{sale.code}</p><p className="text-sm text-slate-600">{sale.customerName}</p>
      <p className="mt-1 text-xs text-slate-500">{formatDateTime(sale.createdAt)} · {t(`paymentMethods.${sale.paymentMethod}`)}</p>
      <div className="mt-4 divide-y divide-dashed divide-slate-200">{sale.items.map(item => <div key={item.id} className="flex justify-between gap-4 py-3 text-xs"><div className="min-w-0"><p className="break-words font-bold">{item.productName}</p><p className="mt-1 text-slate-500">{item.quantity} × {formatCurrency(item.unitPrice)}</p></div><p className="shrink-0 font-bold">{formatCurrency(item.subtotal)}</p></div>)}</div>
      <div className="mt-3 flex justify-between gap-3 border-t border-slate-200 pt-3 font-bold"><span>{t("sales.details.total")}</span><span>{formatCurrency(sale.total)}</span></div>
    </section>
    <fieldset className="rounded-2xl border border-slate-200 bg-white p-4"><legend className="px-1 text-sm font-bold">{t("labels.dialog.intensity")}</legend><div className="grid gap-2 sm:grid-cols-3">{(["standard", "bold", "extra-bold"] as const).map(value => <label key={value} className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-xs font-bold ${mode === value ? "border-orange-400 bg-orange-50 text-orange-800" : "border-slate-200 hover:bg-slate-50"}`}><input type="radio" name="receipt-mode" checked={mode === value} onChange={() => onModeChange(value)} />{t(`labels.dialog.mode.${value}`)}</label>)}</div></fieldset>
  </>;
}
