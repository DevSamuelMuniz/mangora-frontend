"use client";

import { CheckCircle2, Printer, RotateCcw } from "lucide-react";

import { formatCurrency } from "@/lib/format";
import type { Sale } from "@/types/sale";
import type { CompanySettings } from "@/types/settings";
import { printReceipt } from "@/lib/pdv/print";

type DoneStepProps = {
    sale: Sale;
    company: CompanySettings | null;
    received?: number;
    change?: number;
    onFinish: () => void;
};

/** Etapa final — venda registrada: imprimir a nota fiscal ou concluir. */
export default function DoneStep({ sale, company, received, change, onFinish }: DoneStepProps) {
    return (
        <div className="mx-auto flex w-full max-w-md flex-col items-center rounded-2xl border-2 border-pdv-line bg-pdv-panel p-8 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-pdv-ok/15 text-green-400">
                <CheckCircle2 className="size-8" />
            </span>
            <h2 className="mt-4 font-[family-name:var(--font-bricolage)] text-2xl font-black text-pdv-fg">Venda {sale.code}</h2>
            <p className="mt-1 font-mono text-xs text-pdv-fg/60">Registrada com sucesso</p>

            <div className="mt-6 w-full rounded-2xl bg-cream p-5 text-ink">
                <p className="font-mono text-xs text-ink/60">Total da venda</p>
                <p className="font-[family-name:var(--font-bricolage)] text-5xl font-black leading-none text-orange">{formatCurrency(sale.total)}</p>
                <div className="mt-3 space-y-1 border-t-2 border-dashed border-ink/15 pt-3 font-mono text-xs text-ink/70">
                    <div className="flex justify-between"><span>Cliente</span><span>{sale.customerName}</span></div>
                    {sale.customerDocument && <div className="flex justify-between"><span>CPF/CNPJ</span><span>{sale.customerDocument}</span></div>}
                    <div className="flex justify-between"><span>Pagamento</span><span>{sale.paymentMethod}</span></div>
                </div>
            </div>

            <div className="mt-6 grid w-full grid-cols-2 gap-2">
                <button type="button" onClick={() => printReceipt(sale, company, received !== undefined && change !== undefined ? { received, change } : undefined)} className="flex h-14 items-center justify-center gap-2 rounded-xl border border-pdv-line text-sm font-bold text-pdv-fg/80 transition hover:bg-pdv-line">
                    <Printer className="size-4" /> Imprimir nota
                </button>
                <button type="button" onClick={onFinish} className="flex h-14 items-center justify-center gap-2 rounded-xl bg-orange font-[family-name:var(--font-bricolage)] text-sm font-black text-white transition hover:brightness-110">
                    <RotateCcw className="size-4" /> Concluir venda
                </button>
            </div>
            <p className="mt-4 font-mono text-[10px] text-pdv-fg/40">A nota abre em uma janela para impressão.</p>
        </div>
    );
}
