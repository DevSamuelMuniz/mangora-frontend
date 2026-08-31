"use client";

import { Barcode, LoaderCircle, Minus, Plus } from "lucide-react";

import { formatCurrency } from "@/lib/format";
import type { Product } from "@/types/product";

type ProductGridProps = {
    products: Product[];
    loading: boolean;
    cartCounts: Record<string, number>;
    onAdd: (product: Product) => void;
    onChangeQuantity: (productId: string, delta: number) => void;
};

/** Grade de produtos do terminal: imagem, preço em destaque e stepper de quantidade. */
export default function ProductGrid({ products, loading, cartCounts, onAdd, onChangeQuantity }: ProductGridProps) {
    if (loading) {
        return (
            <div className="flex min-h-64 items-center justify-center text-white/60">
                <LoaderCircle className="mr-2 size-5 animate-spin text-orange-400" /> Carregando produtos...
            </div>
        );
    }

    if (!products.length) {
        return (
            <div className="flex min-h-64 flex-col items-center justify-center text-white/50">
                <Barcode className="mb-3 size-9 text-white/30" />
                <p className="font-[family-name:var(--font-bricolage)] text-base font-black text-white/80">Nenhum produto encontrado</p>
                <p className="mt-1 text-xs">Aponte o leitor ou digite o código de barras.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-3 overflow-y-auto xl:grid-cols-3" style={{ maxHeight: "calc(100vh - 18rem)" }}>
            {products.map((product) => {
                const available = product.stock - product.reservedStock;
                const inCart = cartCounts[product.id] ?? 0;
                return (
                    <div
                        key={product.id}
                        className={`group relative flex flex-col overflow-hidden rounded-2xl border-2 bg-graphite-2 transition ${
                            inCart > 0 ? "border-gold/70" : "border-white/10 hover:border-gold/50"
                        }`}
                    >
                        <button type="button" onClick={() => onAdd(product)} aria-label={`Adicionar ${product.name}`} className="flex flex-1 flex-col text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
                            {product.imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={product.imageUrl} alt={product.name} className="h-20 w-full object-cover" />
                            ) : (
                                <div className="flex h-20 w-full items-center justify-center bg-gradient-to-br from-graphite-3 to-graphite">
                                    <Barcode className="size-6 text-white/20" />
                                </div>
                            )}
                            <div className="flex flex-1 flex-col p-3">
                                <p className="truncate font-[family-name:var(--font-bricolage)] text-sm font-bold text-white">{product.name}</p>
                                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-white/40">{product.sku ?? "—"}</p>
                                <div className="mt-auto flex items-end justify-between gap-2 pt-3">
                                    <strong className="font-[family-name:var(--font-bricolage)] text-2xl font-black leading-none text-gold">
                                        {formatCurrency(product.price)}
                                    </strong>
                                    <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold ${product.trackStock ? (available <= product.minimumStock ? "bg-amber-500/15 text-amber-300" : "bg-white/5 text-white/50") : "bg-white/5 text-white/50"}`}>
                                        {product.trackStock ? `${available} disp.` : "Serviço"}
                                    </span>
                                </div>
                            </div>
                        </button>

                        {inCart > 0 ? (
                            <div className="flex items-center justify-between border-t border-white/10 bg-graphite-3 px-3 py-2">
                                <span className="font-mono text-[10px] font-bold text-gold">{inCart} no carrinho</span>
                                <div className="flex items-center gap-1.5">
                                    <button type="button" onClick={() => onChangeQuantity(product.id, -1)} aria-label={`Diminuir ${product.name}`} className="flex size-8 items-center justify-center rounded-lg bg-white/10 text-white transition hover:bg-white/20">
                                        <Minus className="size-4" />
                                    </button>
                                    <button type="button" onClick={() => onChangeQuantity(product.id, 1)} aria-label={`Aumentar ${product.name}`} className="flex size-8 items-center justify-center rounded-lg bg-gold text-ink transition hover:brightness-110">
                                        <Plus className="size-4" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button type="button" onClick={() => onAdd(product)} className="flex h-9 items-center justify-center gap-1.5 bg-orange text-xs font-black text-white transition hover:brightness-110">
                                <Plus className="size-3.5" /> Adicionar
                            </button>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
