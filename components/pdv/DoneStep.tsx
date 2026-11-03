"use client";

import { useFormatters } from "@/i18n/provider";

import { useCallback, useEffect, useRef, useState } from "react";
import { useT } from "@/i18n/provider";
import { CheckCircle2, Printer, RotateCcw } from "lucide-react";


import { paymentMethodLabels, type Sale } from "@/types/sale";
import type { CompanySettings } from "@/types/settings";
import { claimAutomaticReceipt, printReceipt } from "@/lib/pdv/print";
import { readPrintPreferences } from "@/lib/printing/preferences";
import PrintDialog from "@/components/printing/PrintDialog";
import ReceiptPrintPreview from "@/components/printing/ReceiptPrintPreview";
import type { ReceiptMode } from "@/lib/pdv/print";
import PrintSettings from "@/components/printing/PrintSettings";

type DoneStepProps = {
    sale: Sale;
    company: CompanySettings | null;
    received?: number;
    change?: number;
    onFinish: () => void;
};

/** Etapa final — venda registrada: imprimir o cupom de compra ou concluir. */
export default function DoneStep({ sale, company, received, change, onFinish }: DoneStepProps) {
  const { formatCurrency } = useFormatters();
  const t = useT();
    const [printOptionsOpen, setPrintOptionsOpen] = useState(false);
    const [printing, setPrinting] = useState(false);
    const [printMessage, setPrintMessage] = useState("");
    const [printFailed, setPrintFailed] = useState(false);
    const printLock = useRef(false);
    const [receiptMode, setReceiptMode] = useState<ReceiptMode>("standard");

    const print = useCallback(async (mode: ReceiptMode, propagate = false) => {
        const changeInfo = received !== undefined && change !== undefined ? { received, change } : undefined;
        if (printLock.current) return;
        printLock.current = true;
        setPrinting(true); setPrintFailed(false); setPrintMessage("");
        try {
            await printReceipt(sale, company, changeInfo, mode);
            setPrintMessage(t("labels.printSubmitted"));
        } catch {
            setPrintFailed(true); setPrintMessage(t("labels.printError"));
            if (propagate) throw new Error(t("labels.printError"));
        } finally { printLock.current = false; setPrinting(false); }
    }, [sale, company, received, change, t]);

    useEffect(() => {
        if (!readPrintPreferences().autoReceipt || !claimAutomaticReceipt(sale.id)) return;
        void Promise.resolve().then(() => print("standard"));
    }, [sale.id, print]);

    return (
        <><div className="mx-auto grid w-full max-w-4xl items-start gap-6 md:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 w-full flex-col items-center rounded-2xl border-2 border-pdv-line bg-pdv-panel p-8 text-center">
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
                <button type="button" disabled={printing} aria-busy={printing} onClick={() => setPrintOptionsOpen(true)} className="flex h-14 items-center justify-center gap-2 rounded-xl border border-pdv-line text-sm font-bold text-pdv-fg/80 transition hover:bg-pdv-line disabled:cursor-wait disabled:opacity-50">
                    <Printer className="size-4" /> Imprimir cupom
                </button>
                <button type="button" onClick={onFinish} className="flex h-14 items-center justify-center gap-2 rounded-xl bg-orange font-[family-name:var(--font-bricolage)] text-sm font-black text-white transition hover:brightness-110">
                    <RotateCcw className="size-4" /> Concluir venda
                </button>
            </div>
            <p className="mt-4 font-mono text-[10px] text-pdv-fg/60">{t("labels.printHint")}</p>
            <p role={printFailed ? "alert" : "status"} aria-live="polite" className="mt-3 min-h-10 text-xs text-pdv-fg">{printing ? t("labels.printing") : printMessage}</p>
        </div>
        <aside className="min-w-0"><PrintSettings kind="receipt" /></aside>
        </div>
        {printOptionsOpen && <PrintDialog kind="receipt" title={t("labels.dialog.receiptTitle")} onClose={() => setPrintOptionsOpen(false)} onConfirm={() => print(receiptMode, true)}><ReceiptPrintPreview sale={sale} mode={receiptMode} onModeChange={setReceiptMode} /></PrintDialog>}
        </>
    );
}
