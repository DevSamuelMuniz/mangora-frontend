"use client";

import { useState } from "react";
import { BarChart3, Check, ChevronDown, TrendingUp } from "lucide-react";
import type { DashboardData } from "@/types/analytics";
import type { ReportPeriod } from "@/types/report";

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const periodLabels: Record<ReportPeriod, string> = { "7d": "Últimos 7 dias", "30d": "Últimos 30 dias", "90d": "Últimos 90 dias" };

export default function SalesChart({ charts }: { charts: DashboardData["charts"] }) {
  const [period, setPeriod] = useState<ReportPeriod>("7d");
  const [periodOpen, setPeriodOpen] = useState(false);
  const current = charts[period];
  const maximum = Math.max(1, ...current.data.map((item) => item.value));

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600"><BarChart3 className="size-4" /></div>
          <div><h2 className="text-sm font-bold text-slate-950">Desempenho de vendas</h2><p className="mt-0.5 text-[10px] text-slate-400">{current.description}</p></div>
        </div>

        <div className="relative">
          <button type="button" onClick={() => setPeriodOpen((open) => !open)} aria-expanded={periodOpen} className="flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50">
            {periodLabels[period]}<ChevronDown className="size-3.5" />
          </button>
          {periodOpen && (
            <div role="menu" aria-label="Período do gráfico" className="absolute right-0 z-10 mt-2 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
              {(Object.keys(periodLabels) as ReportPeriod[]).map((key) => (
                <button key={key} type="button" role="menuitem" onClick={() => { setPeriod(key); setPeriodOpen(false); }} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[11px] font-semibold text-slate-600 hover:bg-violet-50 hover:text-violet-700">
                  {periodLabels[key]}{period === key && <Check className="size-3.5" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 flex items-end justify-between">
        <div><p className="text-2xl font-black text-slate-950">{currencyFormatter.format(current.revenue)}</p><div className="mt-1 flex items-center gap-1.5"><span className={`flex items-center gap-1 text-[10px] font-bold ${current.variation >= 0 ? "text-emerald-600" : "text-red-600"}`}><TrendingUp className="size-3.5" />{Math.abs(current.variation).toLocaleString("pt-BR")}%</span><span className="text-[10px] text-slate-400">comparado ao período anterior</span></div></div>
      </div>

      <div className="mt-6 flex h-52 items-end gap-2 sm:gap-3">
        {current.data.map((item) => (
          <div key={item.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
            <div className="group relative flex h-full w-full items-end justify-center"><div className="w-full max-w-10 rounded-t-lg bg-gradient-to-t from-violet-600 to-cyan-400 transition hover:opacity-80" style={{ height: `${Math.max(item.value ? 3 : 0, item.value / maximum * 100)}%` }} /><span className="pointer-events-none absolute bottom-full mb-2 hidden rounded-lg bg-slate-950 px-2 py-1 text-[9px] font-bold text-white group-hover:block">{currencyFormatter.format(item.value)}</span></div>
            <span className="text-[10px] font-medium capitalize text-slate-400">{item.label}</span>
          </div>
        ))}
      </div>
    </article>
  );
}
