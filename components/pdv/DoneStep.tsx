"use client";

import { useState } from "react";
import { useT } from "@/i18n/provider";
import { CheckCircle2, Printer, RotateCcw, X } from "lucide-react";

import { formatCurrency } from "@/lib/format";
import { paymentMethodLabels, type Sale } from "@/types/sale";
import type { CompanySettings } from "@/types/settings";
import { printReceipt } from "@/lib/pdv/print";

type DoneStepProps = {
    sale: Sale;
    company: CompanySettings | null;
    received?: number;
    change?: number;
    onFinish: () => void;
};

/** Etapa final — venda registrada: imprimir o cupom de compra ou concluir. */
export default function DoneStep({ sale, company, received, change, onFinish }: DoneStepProps) {
  const t = useT();
    const [printOptionsOpen, setPrintOptionsOpen] = useState(false);
    const changeInfo = received !== undefined && change !== undefined ? { received, change } : undefined;

    function print(mode: "standard" | "bold" | "extra-bold") {
        printReceipt(sale, company, changeInfo, mode);
        setPrintOptionsOpen(false);
    }

    return (
        <><div className="mx-auto flex w-full max-w-md flex-col items-center rounded-2xl border-2 border-pdv-line bg-pdv-panel p-8 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-pdv-ok/15 text-green-400">
                <CheckCircle2 className="size-8" />
            </span>
            <h2 className="mt-4 font-[family-name:var(--font-bricolage)] text-2xl font-black text-pdv-fg">Venda {sale.code}</h2>
            <p className="mt-1 font-mono text-xs text-pdv-fg/60">{t("pdv.done.success")}</p>

            <div className="mt-6 w-full rounded-2xl bg-cream p-5 text-ink">
                <p className="font-mono text-xs text-ink/60">{t("pdv.done.saleTotal")}</p>
                <p className="font-[family-name:var(--font-bricolage)] text-5xl font-black leading-none text-orange">{formatCurrency(sale.total)}</p>
                <div className="mt-3 space-y-1 border-t-2 border-dashed border-ink/15 pt-3 font-mono text-xs text-ink/70">
                    <div className="flex justify-between"><span>{t("pdv.done.customer")}</span><span>{sale.customerName}</span></div>
                    {sale.customerDocument && <div className="flex justify-between"><span>CPF/CNPJ</span><span>{sale.customerDocument}</span></div>}
                    {sale.payments?.length ? (
                        sale.payments.map((payment, index) => (
                            <div key={index} className="flex justify-between"><span>{paymentMethodLabels[payment.method]}</span><span>{formatCurrency(payment.amount)}</span></div>
                        ))
                    ) : (
                        <div className="flex justify-between"><span>{t("pdv.done.payment")}</span><span>{paymentMethodLabels[sale.paymentMethod]}</span></div>
                    )}
                </div>
            </div>

            <div className="mt-6 grid w-full grid-cols-2 gap-2">
                <button type="button" onClick={() => setPrintOptionsOpen(true)} className="flex h-14 items-center justify-center gap-2 rounded-xl border border-pdv-line text-sm font-bold text-pdv-fg/80 transition hover:bg-pdv-line">
                    <Printer className="size-4" /> Imprimir cupom
                </button>
                <button type="button" onClick={onFinish} className="flex h-14 items-center justify-center gap-2 rounded-xl bg-orange font-[family-name:var(--font-bricolage)] text-sm font-black text-white transition hover:brightness-110">
                    <RotateCcw className="size-4" /> Concluir venda
                </button>
            </div>
            <p className="mt-4 font-mono text-[10px] text-pdv-fg/40">{t("pdv.done.printHint")}</p>
        </div>
        {printOptionsOpen && <div role="dialog" aria-modal="true" aria-labelledby="print-options-title" className="fixed inset-0 z-[80] grid place-items-center bg-[#071c14]/75 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setPrintOptionsOpen(false); }}>
            <div className="w-full max-w-3xl overflow-hidden rounded-3xl border-2 border-[#173d2b] bg-[#fffaf0] text-left shadow-[8px_10px_0_#f59e0b]">
                <header className="flex items-start justify-between gap-4 border-b-2 border-dashed border-[#173d2b]/20 px-5 py-4 sm:px-6"><div><p className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-orange-700">{t("pdv.done.printOptions")}</p><h2 id="print-options-title" className="mt-1 font-[family-name:var(--font-bricolage)] text-xl font-black text-[#173d2b]">{t("pdv.done.askTitle")}</h2><p className="mt-1 text-xs text-[#53675c]">{t("pdv.done.askSubtitle")}</p></div><button type="button" aria-label={t("pdv.done.closePrint")} onClick={() => setPrintOptionsOpen(false)} className="grid size-9 shrink-0 place-items-center rounded-xl border border-[#173d2b]/20 bg-white text-[#173d2b] transition hover:bg-orange-50"><X className="size-4" /></button></header>
                <div className="grid gap-3 p-5 sm:grid-cols-3 sm:p-6">
                    <button type="button" onClick={() => print("standard")} className="rounded-2xl border-2 border-[#173d2b]/15 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-orange-400 hover:shadow-md"><span className="flex items-center justify-between"><Printer className="size-5 text-orange-600" /><span className="rounded-full bg-slate-100 px-2 py-1 font-mono text-[9px] font-bold text-slate-600">12 px</span></span><strong className="mt-4 block text-sm font-black text-[#173d2b]">{t("pdv.done.standardLabel")}</strong><span className="mt-1 block text-[11px] leading-4 text-[#66766d]">{t("pdv.done.standard")}</span></button>
                    <button type="button" onClick={() => print("bold")} className="relative rounded-2xl border-2 border-orange-500 bg-[#173d2b] p-4 text-left text-white shadow-md shadow-orange-200 transition hover:-translate-y-0.5 hover:bg-[#0f3123]"><span className="absolute right-3 top-3 rounded-full bg-orange-500 px-2 py-1 font-mono text-[8px] font-black uppercase tracking-wide text-white">{t("pdv.done.recommended")}</span><Printer className="size-5 text-orange-400" /><strong className="mt-4 block text-base font-black">{t("pdv.done.boldLabel")}</strong><span className="mt-1 block text-[11px] font-semibold leading-4 text-white/75">{t("pdv.done.bold")}</span></button>
                    <button type="button" onClick={() => print("extra-bold")} className="rounded-2xl border-2 border-[#173d2b] bg-orange-500 p-4 text-left text-[#102d21] shadow-md shadow-orange-200 transition hover:-translate-y-0.5 hover:bg-orange-400"><span className="flex items-center justify-between"><Printer className="size-6" /><span className="rounded-full bg-[#173d2b] px-2 py-1 font-mono text-[9px] font-black text-white">16 px</span></span><strong className="mt-4 block text-lg font-black">Impressão extra forte</strong><span className="mt-1 block text-[11px] font-bold leading-4">{t("pdv.done.extraBold")}</span></button>
                </div>
            </div>
        </div>}
        </>
    );
}
