"use client";
import { useFormatters, useT } from "@/i18n/provider";
import { usePrintPreferences } from "@/lib/printing/use-print-preferences";
import type { Sale } from "@/types/sale";
import type { ReceiptMode } from "@/lib/printing/types";

export default function ReceiptPrintPreview({ sale, mode, onModeChange }: { sale: Sale; mode: ReceiptMode; onModeChange: (mode: ReceiptMode) => void }) {
  const t = useT();
  const { receiptWidth } = usePrintPreferences();
  const { formatCurrency, formatDateTime } = useFormatters();
  return <>
    <section className="mx-auto max-w-full rounded-2xl border border-slate-200 bg-white p-4 font-mono shadow-sm" style={{ width: `calc(${receiptWidth}mm + 2rem)` }}>
      <h3 className="text-sm font-bold">{t("labels.dialog.receiptSummary")} · {receiptWidth} mm</h3>
      <p className="mt-1 text-xs text-slate-600">{t("labels.nonFiscal")}</p>
      <p className="mt-3 text-lg font-black">{sale.code}</p><p className="text-sm text-slate-600">{sale.customerName}</p>
      <p className="mt-1 text-xs text-slate-500">{formatDateTime(sale.createdAt)} · {t(`paymentMethods.${sale.paymentMethod}`)}</p>
      <div className="mt-4 divide-y divide-dashed divide-slate-200">{sale.items.map(item => <div key={item.id} className={`break-words py-3 ${mode === "extra-bold" ? "text-sm font-bold" : mode === "bold" ? "text-xs font-bold" : "text-xs"}`}><p>{item.productName}</p><p className="mt-1 text-slate-600">{item.quantity} × {formatCurrency(item.unitPrice)} = {formatCurrency(item.subtotal)}</p></div>)}</div>
      {Number(sale.discount) > 0 && <p className="mt-3 text-xs text-slate-600">{t("labels.discount", { amount: formatCurrency(sale.discount) })}</p>}
      <div className="mt-3 flex justify-between gap-3 border-t border-slate-200 pt-3 font-bold"><span>{t("sales.details.total")}</span><span>{formatCurrency(sale.total)}</span></div>
    </section>
    <fieldset className="rounded-2xl border border-slate-200 bg-white p-4"><legend className="px-1 text-sm font-bold">{t("labels.dialog.intensity")}</legend><div className="grid gap-2 sm:grid-cols-3">{(["standard", "bold", "extra-bold"] as const).map(value => <label key={value} className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-xs font-bold ${mode === value ? "border-orange-400 bg-orange-50 text-orange-800" : "border-slate-200 hover:bg-slate-50"}`}><input type="radio" name="receipt-mode" checked={mode === value} onChange={() => onModeChange(value)} />{t(`labels.dialog.mode.${value}`)}</label>)}</div></fieldset>
  </>;
}
