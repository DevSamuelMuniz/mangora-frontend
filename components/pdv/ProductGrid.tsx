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

/** Lista de produtos do terminal: imagem à esquerda, infos à direita em coluna. */
export default function ProductGrid({ products, loading, cartCounts, onAdd, onChangeQuantity }: ProductGridProps) {
    if (loading) {
        return (
            <div className="flex min-h-64 items-center justify-center text-pdv-fg/60">
                <LoaderCircle className="mr-2 size-5 animate-spin text-orange-400" /> Carregando produtos...
            </div>
        );
    }

    if (!products.length) {
        return (
            <div className="flex min-h-64 flex-col items-center justify-center text-pdv-fg/50">
                <Barcode className="mb-3 size-9 text-pdv-fg/30" />
                <p className="font-[family-name:var(--font-bricolage)] text-base font-black text-pdv-fg/80">Nenhum produto encontrado</p>
                <p className="mt-1 text-xs">Aponte o leitor ou digite o código de barras.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3 overflow-y-auto pr-1" style={{ maxHeight: "calc(100vh - 18rem)" }}>
            {products.map((product) => {
                const available = product.stock - product.reservedStock;
                const inCart = cartCounts[product.id] ?? 0;
                return (
                    <div
                        key={product.id}
                        className={`flex items-center gap-3 rounded-2xl border-2 bg-pdv-panel p-3 transition ${
                            inCart > 0 ? "border-pdv-gold/70" : "border-pdv-line hover:border-pdv-gold/50"
                        }`}
                    >
                        <button
                            type="button"
                            onClick={() => onAdd(product)}
                            aria-label={`Adicionar ${product.name}`}
                            className="flex min-w-0 flex-1 items-center gap-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pdv-gold"
                        >
                            {product.imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={product.imageUrl} alt={product.name} className="size-24 shrink-0 rounded-xl object-cover sm:size-28" />
                            ) : (
                                <div className="flex size-24 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-pdv-field to-pdv-bg sm:size-28">
                                    <Barcode className="size-8 text-pdv-fg/20" />
                                </div>
                            )}

                            <div className="flex min-w-0 flex-1 flex-col">
                                <p className="truncate font-[family-name:var(--font-bricolage)] text-base font-bold text-pdv-fg">{product.name}</p>
                                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-pdv-fg/40">{product.sku ?? "—"}</p>
                                <div className="mt-2 flex flex-wrap items-end justify-between gap-2">
                                    <strong className="font-[family-name:var(--font-bricolage)] text-3xl font-black leading-none text-pdv-gold">
                                        {formatCurrency(product.price)}
                                    </strong>
                                    <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold ${product.trackStock ? (available <= product.minimumStock ? "bg-pdv-warn/15 text-pdv-warn" : "bg-pdv-line text-pdv-fg/50") : "bg-pdv-line text-pdv-fg/50"}`}>
                                        {product.trackStock ? `${available} disp.` : "Serviço"}
                                    </span>
                                </div>
                            </div>
                        </button>

                        {inCart > 0 ? (
                            <div className="flex shrink-0 flex-col items-center gap-2 rounded-xl bg-pdv-field px-3 py-2">
                                <span className="font-mono text-[10px] font-bold text-pdv-gold">{inCart} no carrinho</span>
                                <div className="flex items-center gap-1.5">
                                    <button type="button" onClick={() => onChangeQuantity(product.id, -1)} aria-label={`Diminuir ${product.name}`} className="flex size-9 items-center justify-center rounded-lg bg-pdv-line text-pdv-fg transition hover:bg-pdv-line">
                                        <Minus className="size-4" />
                                    </button>
                                    <button type="button" onClick={() => onChangeQuantity(product.id, 1)} aria-label={`Aumentar ${product.name}`} className="flex size-9 items-center justify-center rounded-lg bg-pdv-gold text-ink transition hover:brightness-110">
                                        <Plus className="size-4" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => onAdd(product)}
                                className="flex min-h-20 shrink-0 flex-col items-center justify-center gap-1.5 self-stretch rounded-xl bg-orange px-4 text-xs font-black text-white transition hover:brightness-110"
                            >
                                <Plus className="size-5" /> Adicionar
                            </button>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
