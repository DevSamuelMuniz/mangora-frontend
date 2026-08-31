"use client";

import { CheckCircle2, Printer, RotateCcw } from "lucide-react";

import { formatCurrency } from "@/lib/format";
import type { Sale } from "@/types/sale";
import type { CompanySettings } from "@/types/settings";
import { printReceipt } from "@/lib/pdv/print";

type DoneStepProps = {
    sale: Sale;
    company: Pick<CompanySettings, "tradeName" | "document" | "city" | "state"> | null;
    onFinish: () => void;
};

/** Etapa final — venda registrada: imprimir a nota fiscal ou concluir. */
export default function DoneStep({ sale, company, onFinish }: DoneStepProps) {
    return (
        <div className="mx-auto flex w-full max-w-md flex-col items-center rounded-2xl border-2 border-white/10 bg-[#0a2418] p-8 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-green-500/15 text-green-400">
                <CheckCircle2 className="size-8" />
            </span>
            <h2 className="mt-4 font-[family-name:var(--font-bricolage)] text-2xl font-black text-white">Venda {sale.code}</h2>
            <p className="mt-1 font-mono text-xs text-white/60">Registrada com sucesso</p>

            <div className="mt-6 w-full rounded-2xl bg-[#fff8ea] p-5 text-[#123d2b]">
                <p className="font-mono text-xs text-[#123d2b]/60">Total da venda</p>
                <p className="font-[family-name:var(--font-bricolage)] text-5xl font-black leading-none text-orange-600">{formatCurrency(sale.total)}</p>
                <div className="mt-3 space-y-1 border-t-2 border-dashed border-[#123d2b]/15 pt-3 font-mono text-xs text-[#123d2b]/70">
                    <div className="flex justify-between"><span>Cliente</span><span>{sale.customerName}</span></div>
                    {sale.customerDocument && <div className="flex justify-between"><span>CPF/CNPJ</span><span>{sale.customerDocument}</span></div>}
                    <div className="flex justify-between"><span>Pagamento</span><span>{sale.paymentMethod}</span></div>
                </div>
            </div>

            <div className="mt-6 grid w-full grid-cols-2 gap-2">
                <button type="button" onClick={() => printReceipt(sale, company)} className="flex h-14 items-center justify-center gap-2 rounded-xl border border-white/15 text-sm font-bold text-white/80 transition hover:bg-white/5">
                    <Printer className="size-4" /> Imprimir nota
                </button>
                <button type="button" onClick={onFinish} className="flex h-14 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 font-[family-name:var(--font-bricolage)] text-sm font-black text-white transition hover:brightness-110">
                    <RotateCcw className="size-4" /> Concluir venda
                </button>
            </div>
            <p className="mt-4 font-mono text-[10px] text-white/40">A nota abre em uma janela para impressão.</p>
        </div>
    );
}
