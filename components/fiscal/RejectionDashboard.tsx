"use client";

import { useMemo, useState } from "react";
import { AlertOctagon, FileWarning, PackageX } from "lucide-react";

import { useFiscalRejections } from "@/features/fiscal/hooks/useFiscal";
import { formatDateTime } from "@/lib/format";

const PERIODS = [
  { value: 30, label: "30 dias" },
  { value: 90, label: "90 dias" },
  { value: 365, label: "12 meses" },
];

/** Painel "o que a SEFAZ recusou" — motivo com carimbo de código e impacto por produto. */
export default function RejectionDashboard() {
  const [days, setDays] = useState(30);
  const { data, isLoading } = useFiscalRejections(days);
  const total = data?.total ?? 0;

  const reasons = useMemo(() => (data?.reasons ?? []).map((reason) => ({
    ...reason,
    width: total ? Math.max(6, Math.round(reason.count / total * 100)) : 0,
  })), [data, total]);

  if (isLoading) return <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 text-xs text-slate-500">Carregando rejeições...</div>;
  if (!total) return null;

  const top = data!.reasons[0];

  return (
    <article className="mt-4 overflow-hidden rounded-2xl border border-red-200/70 bg-white shadow-sm">
      <div className="flex flex-col justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-red-50/70 to-white px-5 py-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-red-100 text-red-700"><FileWarning className="size-4" /></span>
          <div><h2 className="text-sm font-black text-slate-950">O que a SEFAZ recusou</h2><p className="mt-0.5 text-[10px] text-slate-500">Rejeições nos últimos {days} dias — corrija o motivo e reenvie a nota.</p></div>
        </div>
        <div className="flex gap-1.5">{PERIODS.map((period) => <button key={period.value} type="button" onClick={() => setDays(period.value)} className={`h-8 rounded-lg px-3 text-[10px] font-bold ${days === period.value ? "bg-red-600 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{period.label}</button>)}</div>
      </div>

      <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          {top && (
            <div className="rounded-xl border border-red-200 bg-red-50/50 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2 font-mono text-[11px] font-black tracking-tight text-red-700"><span className="rounded-md border border-red-300 bg-white px-2 py-0.5">{top.code}</span><span className="truncate normal-case">{top.message}</span></div>
                <span className="shrink-0 rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-black text-white">{top.count}×</span>
              </div>
              <p className="mt-2 text-[10px] text-slate-500">Motivo mais comum — resolver isto elimina boa parte das rejeições do período.</p>
            </div>
          )}
          <div className="mt-4 space-y-3">
            {reasons.map((reason) => (
              <div key={reason.code} className="flex items-center gap-3">
                <span className="w-28 shrink-0 font-mono text-[10px] font-black text-red-700">{reason.code}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-400" style={{ width: `${reason.width}%` }} /></div>
                <span className="w-8 shrink-0 text-right text-xs font-black tabular-nums text-slate-700">{reason.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 p-4">
          <h3 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-slate-500"><PackageX className="size-3.5" />Produtos nas notas rejeitadas</h3>
          {(data?.products ?? []).length ? <div className="mt-3 divide-y divide-slate-100">{data!.products.slice(0, 8).map((product) => <div key={product.sku} className="flex items-center justify-between gap-3 py-2.5"><span className="min-w-0 truncate font-mono text-[10px] font-bold text-slate-700">{product.sku}</span><span className="shrink-0 text-[10px] text-slate-500">{product.count} nota(s) · {product.quantity} un.</span></div>)}</div> : <p className="mt-3 text-xs text-slate-400">Nenhum item associado.</p>}
        </div>
      </div>

      {(data?.recent?.length ?? 0) > 0 && (
        <div className="border-t border-slate-100 px-5 py-4">
          <h3 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-slate-500"><AlertOctagon className="size-3.5" />Rejeições recentes</h3>
          <div className="mt-2 divide-y divide-slate-100 rounded-xl border border-slate-200">{data!.recent.map((item) => <div key={item.id} className="flex flex-col gap-1 px-3 py-2.5 sm:flex-row sm:items-center sm:gap-3"><span className="font-mono text-[10px] font-black text-red-700">{item.rejectionCode}</span><p className="min-w-0 flex-1 truncate text-[11px] text-slate-600">{item.rejectionMessage}</p><p className="shrink-0 text-[10px] text-slate-400">{item.sale ? `${item.sale.code} · ${item.sale.customerName} · ` : ""}{formatDateTime(new Date(item.createdAt))}</p></div>)}</div>
        </div>
      )}
    </article>
  );
}
