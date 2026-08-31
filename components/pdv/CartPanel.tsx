"use client";

import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";

import { formatCurrency } from "@/lib/format";
import type { Product } from "@/types/product";

export type CartItem = { product: Product; quantity: number };

type CartPanelProps = {
    cart: CartItem[];
    subtotal: number;
    discountValue: number;
    maxDiscount: number;
    total: number;
    onQuantity: (productId: string, delta: number) => void;
    onDiscount: (value: string) => void;
};

/** Carrinho do terminal: itens + totais sobre a barra creme tipo "recibo". */
export default function CartPanel({ cart, subtotal, discountValue, maxDiscount, total, onQuantity, onDiscount }: CartPanelProps) {
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="flex flex-col overflow-hidden rounded-2xl bg-cream text-ink shadow-2xl shadow-black/30">
            <div className="flex items-center justify-between border-b-2 border-dashed border-ink/15 px-4 py-3">
                <h2 className="flex items-center gap-2 font-[family-name:var(--font-bricolage)] text-sm font-black uppercase tracking-wide">
                    <ShoppingCart className="size-4 text-orange" /> Carrinho
                </h2>
                <span className="rounded-full bg-ink px-2.5 py-1 font-mono text-[10px] font-bold text-cream">{itemCount} item(ns)</span>
            </div>

            <div className="max-h-48 space-y-1.5 overflow-y-auto px-3 py-3">
                {cart.length ? (
                    cart.map(({ product, quantity }) => (
                        <div key={product.id} className="flex items-center gap-2 rounded-xl bg-white/70 px-2.5 py-2 shadow-sm">
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-bold text-ink">{product.name}</p>
                                <p className="font-mono text-[10px] text-ink/50">{formatCurrency(product.price)} × {quantity}</p>
                            </div>
                            <div className="flex items-center gap-1">
                                <button type="button" onClick={() => onQuantity(product.id, -1)} aria-label={`Diminuir ${product.name}`} className="flex size-7 items-center justify-center rounded-lg bg-ink/5 text-ink hover:bg-ink/10">
                                    <Minus className="size-3.5" />
                                </button>
                                <span className="w-7 text-center font-[family-name:var(--font-bricolage)] text-sm font-black">{quantity}</span>
                                <button type="button" onClick={() => onQuantity(product.id, 1)} aria-label={`Aumentar ${product.name}`} className="flex size-7 items-center justify-center rounded-lg bg-ink/5 text-ink hover:bg-ink/10">
                                    <Plus className="size-3.5" />
                                </button>
                            </div>
                            <button type="button" onClick={() => onQuantity(product.id, -999)} aria-label={`Remover ${product.name}`} className="flex size-7 items-center justify-center rounded-lg text-ink/40 hover:bg-red-500/10 hover:text-red-600">
                                <Trash2 className="size-3.5" />
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="py-6 text-center font-mono text-xs text-ink/50">Leia um produto para começar.</p>
                )}
            </div>

            {/* Total em destaque — a assinatura do terminal */}
            <div className="border-t-2 border-dashed border-ink/15 bg-white/60 px-4 py-3">
                <div className="flex justify-between font-mono text-xs text-ink/70">
                    <span>Subtotal</span><span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="mt-1 flex items-center justify-between gap-3 font-mono text-xs text-ink/70">
                    <span>Desconto (máx. {maxDiscount}%)</span>
                    <input
                        type="number"
                        min={0}
                        max={maxDiscount}
                        step="0.5"
                        value={discountValue || ""}
                        onChange={(event) => onDiscount(event.target.value)}
                        placeholder="0"
                        className="h-8 w-20 rounded-lg border border-ink/15 bg-white px-2 text-right font-mono text-sm font-bold text-ink outline-none focus:border-orange"
                    />
                </div>
                <div className="mt-2 flex items-end justify-between gap-2 border-t-2 border-ink/15 pt-2">
                    <span className="font-[family-name:var(--font-bricolage)] text-sm font-black uppercase tracking-wide text-ink/80">Total</span>
                    <strong className="font-[family-name:var(--font-bricolage)] text-5xl font-black leading-none tracking-tight text-orange">
                        {formatCurrency(total)}
                    </strong>
                </div>
            </div>
        </div>
    );
}
