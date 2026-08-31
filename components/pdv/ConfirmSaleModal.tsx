"use client";

import { CheckCircle2, ChevronLeft, LoaderCircle, ReceiptText, UserRound } from "lucide-react";

import { formatCurrency, formatDocument } from "@/lib/format";
import { paymentMethodLabels, type PaymentMethod } from "@/types/sale";

type ConfirmSaleModalProps = {
    customerName: string;
    paymentMethod: PaymentMethod;
    items: { name: string; quantity: number; price: number }[];
    subtotal: number;
    discount: number;
    total: number;
    customerDocument: string;
    onCustomerDocument: (value: string) => void;
    pending: boolean;
    onConfirm: () => void;
    onBack: () => void;
};

/** Double check antes de finalizar: resumo completo da venda + CPF na nota. */
export default function ConfirmSaleModal({
    customerName,
    paymentMethod,
    items,
    subtotal,
    discount,
    total,
    customerDocument,
    onCustomerDocument,
    pending,
    onConfirm,
    onBack,
}: ConfirmSaleModalProps) {
    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div role="dialog" aria-modal="true" className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-[#0a2418] shadow-2xl">
                <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
                    <div>
                        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-orange-400">Confirmação</p>
                        <h2 className="font-[family-name:var(--font-bricolage)] text-lg font-black text-white">Revisar venda</h2>
                    </div>
                    <ReceiptText className="size-6 text-[#ffb21a]" />
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-4">
                    <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2.5">
                        <UserRound className="size-4 text-orange-400" />
                        <p className="text-xs font-bold text-white">{customerName}</p>
                        <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 font-mono text-[10px] font-bold text-[#ffb21a]">
                            {paymentMethodLabels[paymentMethod]}
                        </span>
                    </div>

                    <div className="mt-4 space-y-2">
                        {items.map((item) => (
                            <div key={item.name} className="flex items-center justify-between gap-3 text-sm">
                                <p className="min-w-0 truncate font-semibold text-white/80">
                                    {item.name} <span className="font-mono text-white/50">× {item.quantity}</span>
                                </p>
                                <strong className="font-mono text-white">{formatCurrency(item.price * item.quantity)}</strong>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 space-y-1.5 border-t border-dashed border-white/15 pt-3 font-mono text-xs text-white/70">
                        <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                        {discount > 0 && <div className="flex justify-between text-red-300"><span>Desconto</span><span>- {formatCurrency(discount)}</span></div>}
                        <div className="flex items-end justify-between border-t border-white/15 pt-2">
                            <span className="font-[family-name:var(--font-bricolage)] text-sm font-black uppercase text-white">Total</span>
                            <strong className="font-[family-name:var(--font-bricolage)] text-4xl font-black leading-none text-[#ffb21a]">{formatCurrency(total)}</strong>
                        </div>
                    </div>

                    <label className="mt-4 block">
                        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">CPF / CNPJ na nota (opcional)</span>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={customerDocument}
                            onChange={(event) => onCustomerDocument(event.target.value.replace(/\D/g, "").slice(0, 14))}
                            placeholder="Digite para incluir na nota"
                            className="mt-1.5 h-12 w-full rounded-xl border border-white/10 bg-[#123d2b] px-3 font-mono text-base font-bold tracking-widest text-white outline-none placeholder:font-sans placeholder:text-sm placeholder:font-normal placeholder:tracking-normal placeholder:text-white/40 focus:border-[#ffb21a]"
                        />
                        {customerDocument && <p className="mt-1 font-mono text-[10px] text-white/50">CPF: {formatDocument(customerDocument, "INDIVIDUAL")}</p>}
                    </label>
                </div>

                <div className="grid grid-cols-2 gap-2 border-t border-white/10 p-4">
                    <button type="button" onClick={onBack} disabled={pending} className="flex h-12 items-center justify-center gap-1.5 rounded-xl border border-white/15 text-sm font-bold text-white/70 transition hover:bg-white/5 disabled:opacity-50">
                        <ChevronLeft className="size-4" /> Voltar
                    </button>
                    <button type="button" onClick={onConfirm} disabled={pending} className="flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 font-[family-name:var(--font-bricolage)] text-sm font-black text-white transition hover:brightness-110 disabled:opacity-60">
                        {pending ? <><LoaderCircle className="size-4 animate-spin" />Finalizando...</> : <><CheckCircle2 className="size-4" />Confirmar venda</>}
                    </button>
                </div>
            </div>
        </div>
    );
}
