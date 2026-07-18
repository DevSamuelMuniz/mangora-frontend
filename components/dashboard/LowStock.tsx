import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
} from "lucide-react";
import type { DashboardData } from "@/types/analytics";

export default function LowStock({ products }: { products: DashboardData["lowStock"] }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 sm:px-5">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <AlertTriangle className="size-4.5" />
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-950">
              Estoque baixo
            </h2>

            <p className="mt-0.5 text-[10px] text-slate-400">
              Produtos que precisam de reposição
            </p>
          </div>
        </div>

        <Link
          href="/estoque"
          className="flex items-center gap-1 text-[11px] font-bold text-violet-600 hover:text-violet-800"
        >
          Ver estoque
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      <div className="divide-y divide-slate-100">
        {products.map((product) => {
          const percentage = Math.min(
            product.minimumStock ? (product.availableStock / product.minimumStock) * 100 : 0,
            100,
          );

          return (
            <div
              key={product.sku}
              className="px-4 py-3.5 transition hover:bg-slate-50 sm:px-5"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                  <Boxes className="size-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-slate-800">
                        {product.name}
                      </p>

                      <p className="mt-0.5 text-[9px] text-slate-400">
                        SKU: {product.sku}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-xs font-black text-red-600">
                        {product.availableStock} un.
                      </p>

                      <p className="text-[9px] text-slate-400">
                        Mín. {product.minimumStock}
                      </p>
                    </div>
                  </div>

                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-red-500 to-amber-400"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {products.length === 0 && <p className="px-5 py-10 text-center text-xs text-slate-400">Nenhum produto com estoque baixo.</p>}
      </div>
    </article>
  );
}
