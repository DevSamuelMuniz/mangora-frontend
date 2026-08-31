"use client";

import { ArrowLeft, CheckCheck, ReceiptText } from "lucide-react";

import { formatCurrency } from "@/lib/format";
import type { CartItem } from "./CartPanel";

type ReviewItemsProps = {
    cart: CartItem[];
    subtotal: number;
    discount: number;
    total: number;
    onBack: () => void;
    onNext: () => void;
};

/** Etapa 2 — revisar os itens antes de seguir para o pagamento. */
export default function ReviewItems({ cart, subtotal, discount, total, onBack, onNext }: ReviewItemsProps) {
    return (
        <div className="mx-auto flex w-full max-w-2xl flex-col rounded-2xl border-2 border-pdv-line bg-pdv-panel p-6">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-orange-400">Etapa 2 de 4</p>
                    <h2 className="font-[family-name:var(--font-bricolage)] text-2xl font-black text-pdv-fg">Confirme os itens</h2>
                </div>
                <span className="flex size-11 items-center justify-center rounded-xl bg-orange-500/15 text-orange-400"><ReceiptText className="size-5" /></span>
            </div>

            <div className="mt-5 space-y-2">
                {cart.map(({ product, quantity }) => (
                    <div key={product.id} className="flex items-center justify-between gap-3 rounded-xl bg-pdv-line px-4 py-3">
                        <div className="min-w-0">
                            <p className="truncate font-[family-name:var(--font-bricolage)] text-sm font-bold text-pdv-fg">{product.name}</p>
                            <p className="font-mono text-[10px] text-pdv-fg/50">{product.sku ?? "—"}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-mono text-xs text-pdv-fg/60">{quantity} × {formatCurrency(product.price)}</p>
                            <p className="font-[family-name:var(--font-bricolage)] text-base font-black text-pdv-gold">{formatCurrency(product.price * quantity)}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-5 space-y-1.5 rounded-xl bg-cream p-4 font-mono text-xs text-ink">
                <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                {discount > 0 && <div className="flex justify-between text-red-600"><span>Desconto</span><span>- {formatCurrency(discount)}</span></div>}
                <div className="flex items-end justify-between border-t-2 border-dashed border-ink/15 pt-2">
                    <span className="font-[family-name:var(--font-bricolage)] text-sm font-black uppercase">Total</span>
                    <strong className="font-[family-name:var(--font-bricolage)] text-4xl font-black leading-none text-orange">{formatCurrency(total)}</strong>
                </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
                <button type="button" onClick={onBack} className="flex h-14 items-center justify-center gap-2 rounded-xl border border-pdv-line text-sm font-bold text-pdv-fg/70 transition hover:bg-pdv-line">
                    <ArrowLeft className="size-4" /> Voltar aos itens
                </button>
                <button type="button" onClick={onNext} className="flex h-14 items-center justify-center gap-2 rounded-xl bg-orange font-[family-name:var(--font-bricolage)] text-base font-black text-white transition hover:brightness-110">
                    <CheckCheck className="size-5" /> Confirmar itens
                </button>
            </div>
        </div>
    );
}
