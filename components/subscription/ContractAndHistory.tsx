"use client";

import { ArrowDownRight, ArrowUpRight, FileClock, Minus, ScrollText } from "lucide-react";

import { formatCurrency, formatDateTime } from "@/lib/format";
import type { SubscriptionOverview } from "@/types/subscription";

const historyMeta: Record<SubscriptionOverview["history"][number]["type"], { label: string; tone: string }> = {
  CREATED: { label: "Conta criada", tone: "bg-slate-100 text-slate-600" },
  PLAN_CHANGE_REQUESTED: { label: "Troca de plano solicitada", tone: "bg-amber-100 text-amber-800" },
  PLAN_CHANGED: { label: "Plano ativado", tone: "bg-green-100 text-green-800" },
  PRICE_CHANGED: { label: "Preço atualizado", tone: "bg-blue-100 text-blue-800" },
  DISCOUNT_UPDATED: { label: "Desconto atualizado", tone: "bg-violet-100 text-violet-800" },
  CANCELLATION_REQUESTED: { label: "Cancelamento solicitado", tone: "bg-red-100 text-red-800" },
  CANCELLED: { label: "Assinatura cancelada", tone: "bg-red-100 text-red-800" },
  REACTIVATED: { label: "Assinatura reativada", tone: "bg-green-100 text-green-800" },
};

function planName(id: string | null, overview: SubscriptionOverview) {
  if (!id) return null;
  const found = overview.plans.find((plan) => plan.id === id.toLowerCase());
  return found?.name ?? id;
}

/** Contrato (versão congelada do catálogo) + extrato do histórico de assinatura. */
export default function ContractAndHistory({ overview }: { overview: SubscriptionOverview }) {
  const snapshot = overview.contract.planSnapshot as null | { version?: number; plan?: string; name?: string } | undefined;

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-orange-50 text-orange-600"><ScrollText className="size-4" /></span>
          <div>
            <h2 className="text-sm font-black text-slate-950">Seu contrato</h2>
            <p className="mt-0.5 text-[10px] text-slate-500">Preço e limites foram congelados quando o plano foi ativado.</p>
          </div>
        </div>
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[#123d2b]/15 bg-[#fff8ea] px-3 py-1.5 font-mono text-[10px] font-bold text-[#123d2b]">
          <FileClock className="size-3.5 text-[#ff6b1a]" />
          Catálogo v{overview.contract.planCatalogVersion} · {snapshot?.name ?? planName(overview.plan, overview)} · congelado
        </span>
      </div>

      <div className="px-5 py-4">
        {(overview.history?.length ?? 0) > 0 ? (
          <ol className="relative space-y-1">
            {overview.history.map((entry) => {
              const meta = historyMeta[entry.type];
              const Delta = entry.toPrice !== null && entry.fromPrice !== null && entry.toPrice > entry.fromPrice ? ArrowUpRight : entry.toPrice !== null && entry.fromPrice !== null && entry.toPrice < entry.fromPrice ? ArrowDownRight : null;
              return (
                <li key={entry.id} className="relative flex items-center gap-3 rounded-xl px-2 py-2.5 hover:bg-slate-50">
                  <span className={`flex size-7 shrink-0 items-center justify-center rounded-lg text-[9px] font-black ${meta.tone}`}>{entry.type === "PLAN_CHANGED" ? "OK" : entry.type === "CANCELLED" ? "×" : "·"}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-800">{meta.label}
                      {entry.fromPlan && entry.toPlan && entry.toPlan !== entry.fromPlan && <span className="font-medium text-slate-400"> · {planName(entry.fromPlan, overview)} → {planName(entry.toPlan, overview)}</span>}
                    </p>
                    <p className="mt-0.5 text-[10px] text-slate-400">{formatDateTime(new Date(entry.createdAt))} · {entry.userName}{entry.notes ? ` · ${entry.notes}` : ""}</p>
                  </div>
                  {entry.toPrice !== null ? (
                    <p className="flex shrink-0 items-center gap-1 font-mono text-xs font-black tabular-nums text-slate-800">
                      {entry.fromPrice !== null && <span className="text-slate-400 line-through decoration-slate-300">{formatCurrency(entry.fromPrice)}</span>}
                      {Delta ? <Delta className="size-3.5 text-green-600" /> : <Minus className="size-3.5 text-slate-300" />}
                      {formatCurrency(entry.toPrice)}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="py-4 text-center text-xs text-slate-400">Nenhuma movimentação registrada ainda.</p>
        )}
      </div>
    </article>
  );
}
