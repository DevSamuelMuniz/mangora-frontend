"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, CheckCircle2, ExternalLink, MoreHorizontal, ReceiptText, XCircle } from "lucide-react";

import type { DashboardData } from "@/types/analytics";
import { saleStatusLabels, type SaleStatus } from "@/types/sale";

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

function getStatusStyle(status: SaleStatus) {
  return status === "COMPLETED"
    ? { className: "bg-emerald-50 text-emerald-600", icon: CheckCircle2 }
    : { className: "bg-red-50 text-red-600", icon: XCircle };
}

export default function RecentSales({ sales }: { sales: DashboardData["recentSales"] }) {
  const [openSale, setOpenSale] = useState<string | null>(null);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 sm:px-5">
        <div><h2 className="text-sm font-bold text-slate-950">Vendas recentes</h2><p className="mt-0.5 text-[10px] text-slate-400">Últimas movimentações registradas</p></div>
        <Link href="/vendas" className="flex items-center gap-1 text-[11px] font-bold text-violet-600 hover:text-violet-800">Ver todas<ArrowRight className="size-3.5" /></Link>
      </div>

      <div className="divide-y divide-slate-100">
        {sales.map((sale) => {
          const status = getStatusStyle(sale.status);
          const StatusIcon = status.icon;
          const selected = openSale === sale.id;
          return (
            <div key={sale.id} className="relative flex items-center gap-3 px-4 py-3.5 transition hover:bg-slate-50 sm:px-5">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-[10px] font-black text-violet-700">{sale.customerName.split(" ").slice(0, 2).map((name) => name[0]).join("")}</div>
              <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="truncate text-xs font-bold text-slate-800">{sale.customerName}</p><span className="text-[9px] text-slate-400">{sale.code}</span></div><p className="mt-1 text-[10px] text-slate-400">{dateFormatter.format(new Date(sale.createdAt))}</p></div>
              <div className="hidden text-right sm:block"><p className="text-xs font-bold text-slate-800">{currencyFormatter.format(sale.total)}</p><span className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[9px] font-bold ${status.className}`}><StatusIcon className="size-3" />{saleStatusLabels[sale.status]}</span></div>
              <button type="button" onClick={() => setOpenSale((current) => current === sale.id ? null : sale.id)} aria-label={`Opções da venda ${sale.code}`} aria-expanded={selected} className="flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><MoreHorizontal className="size-4" /></button>
              {selected && <div role="menu" aria-label={`Menu da venda ${sale.code}`} className="absolute right-4 top-12 z-20 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"><Link href={`/vendas?selecionada=${sale.id}`} role="menuitem" className="flex items-center gap-2 rounded-lg px-3 py-2 text-[11px] font-semibold text-slate-600 hover:bg-violet-50 hover:text-violet-700"><ExternalLink className="size-3.5" />Ver detalhes</Link><Link href="/vendas/nova" role="menuitem" className="flex items-center gap-2 rounded-lg px-3 py-2 text-[11px] font-semibold text-slate-600 hover:bg-violet-50 hover:text-violet-700"><ReceiptText className="size-3.5" />Nova venda</Link></div>}
            </div>
          );
        })}
        {sales.length === 0 && <p className="px-5 py-10 text-center text-xs text-slate-400">Nenhuma venda registrada.</p>}
      </div>
    </article>
  );
}
