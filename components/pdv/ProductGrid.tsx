"use client";

import { Barcode, LoaderCircle, Plus } from "lucide-react";

import { formatCurrency } from "@/lib/format";
import type { Product } from "@/types/product";

type ProductGridProps = {
    products: Product[];
    loading: boolean;
    cartCounts: Record<string, number>;
    onAdd: (product: Product) => void;
};

/** Grade de produtos do terminal: cards grandes, preço em destaque. */
export default function ProductGrid({ products, loading, cartCounts, onAdd }: ProductGridProps) {
    if (loading) {
        return (
            <div className="flex min-h-64 items-center justify-center text-slate-400">
                <LoaderCircle className="mr-2 size-5 animate-spin text-orange-400" /> Carregando produtos...
            </div>
        );
    }

    if (!products.length) {
        return (
            <div className="flex min-h-64 flex-col items-center justify-center text-slate-500">
                <Barcode className="mb-3 size-9 text-slate-700" />
                <p className="font-[family-name:var(--font-bricolage)] text-base font-black text-slate-300">Nenhum produto encontrado</p>
                <p className="mt-1 text-xs">Aponte o leitor ou digite o código de barras.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-3 overflow-y-auto xl:grid-cols-3" style={{ maxHeight: "calc(100vh - 17rem)" }}>
            {products.map((product) => {
                const available = product.stock - product.reservedStock;
                const inCart = cartCounts[product.id] ?? 0;
                return (
                    <button
                        key={product.id}
                        type="button"
                        onClick={() => onAdd(product)}
                        className="group relative flex flex-col rounded-2xl border-2 border-white/10 bg-[#0a2418] p-4 text-left transition hover:-translate-y-0.5 hover:border-[#ffb21a]/60 hover:bg-[#0e2f1f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffb21a]"
                    >
                        {inCart > 0 && (
                            <span className="absolute -right-2 -top-2 flex size-8 items-center justify-center rounded-full bg-[#ffb21a] font-[family-name:var(--font-bricolage)] text-sm font-black text-[#123d2b] shadow-lg">
                                {inCart}
                            </span>
                        )}
                        <p className="truncate font-[family-name:var(--font-bricolage)] text-sm font-bold text-white">{product.name}</p>
                        <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-slate-500">{product.sku ?? "—"}</p>
                        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
                            <strong className="font-[family-name:var(--font-bricolage)] text-2xl font-black leading-none text-[#ffb21a]">
                                {formatCurrency(product.price)}
                            </strong>
                            <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold ${product.trackStock ? (available <= product.minimumStock ? "bg-amber-500/15 text-amber-300" : "bg-white/5 text-slate-400") : "bg-white/5 text-slate-400"}`}>
                                {product.trackStock ? `${available} disp.` : "Serviço"}
                            </span>
                        </div>
                        <span className="mt-3 hidden items-center justify-center gap-1 rounded-xl bg-orange-600 py-2 text-xs font-black text-white group-hover:flex">
                            <Plus className="size-3.5" /> Adicionar
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
