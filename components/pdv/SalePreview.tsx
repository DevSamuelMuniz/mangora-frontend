"use client";

import { ReceiptText, UserRound } from "lucide-react";

import { formatCurrency } from "@/lib/format";
import type { PaymentMethod } from "@/types/sale";
import type { CartItem } from "./CartPanel";

type SalePreviewProps = {
    cart: CartItem[];
    subtotal: number;
    discount: number;
    total: number;
    customerName: string;
    paymentMethod?: PaymentMethod | null;
    customerDocument?: string;
};

/** Pré-visualização da venda (mini recibo) — persistente nas etapas 2–4. */
export default function SalePreview({ cart, subtotal, discount, total, customerName, paymentMethod, customerDocument }: SalePreviewProps) {
    return (
        <div className="sticky top-4 flex flex-col overflow-hidden rounded-2xl bg-cream text-ink shadow-2xl shadow-black/30">
            <div className="flex items-center justify-between border-b-2 border-dashed border-ink/15 px-4 py-3">
                <h3 className="flex items-center gap-2 font-[family-name:var(--font-bricolage)] text-xs font-black uppercase tracking-wide">
                    <ReceiptText className="size-4 text-orange" /> Pré-visualização
                </h3>
                <span className="font-mono text-[10px] text-ink/50">{cart.reduce((sum, item) => sum + item.quantity, 0)} item(ns)</span>
            </div>

            <div className="max-h-56 space-y-1.5 overflow-y-auto px-4 py-3">
                {cart.length ? (
                    cart.map(({ product, quantity }) => (
                        <div key={product.id} className="flex items-center justify-between gap-2 text-xs">
                            <p className="min-w-0 truncate font-bold">
                                {product.name} <span className="font-mono text-ink/50">× {quantity}</span>
                            </p>
                            <strong className="shrink-0 font-mono">{formatCurrency(product.price * quantity)}</strong>
                        </div>
                    ))
                ) : (
                    <p className="py-4 text-center font-mono text-[10px] text-ink/50">Carrinho vazio.</p>
                )}
            </div>

            <div className="space-y-1 border-t-2 border-dashed border-ink/15 px-4 py-3 font-mono text-[11px] text-ink/70">
                <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                {discount > 0 && <div className="flex justify-between text-red-600"><span>Desconto</span><span>- {formatCurrency(discount)}</span></div>}
                <div className="flex items-end justify-between border-t border-ink/10 pt-1.5">
                    <span className="font-[family-name:var(--font-bricolage)] text-xs font-black uppercase">Total</span>
                    <strong className="font-[family-name:var(--font-bricolage)] text-2xl font-black leading-none text-orange">{formatCurrency(total)}</strong>
                </div>
            </div>

            <div className="space-y-1 border-t-2 border-dashed border-ink/15 px-4 py-3 font-mono text-[10px] text-ink/60">
                <div className="flex items-center gap-1.5"><UserRound className="size-3" /><span>{customerName}</span></div>
                {paymentMethod && <div className="flex justify-between"><span>Pagamento</span><span>{paymentMethod}</span></div>}
                {customerDocument && <div className="flex justify-between"><span>CPF/CNPJ</span><span>{customerDocument}</span></div>}
            </div>
        </div>
    );
}
