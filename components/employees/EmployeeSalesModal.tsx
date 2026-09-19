"use client";

import { useMemo, useState } from "react";
import { BarChart3, ChevronDown, ChevronLeft, ChevronRight, LoaderCircle, Receipt, X } from "lucide-react";

import { useFormatters, useT } from "@/i18n/provider";
import { useEmployeeSales } from "@/features/employees/hooks/useEmployees";
import type { Employee } from "@/types/employee";
import type { EmployeeSale } from "@/types/employee-sales";

type PeriodKey = "today" | "week" | "month" | "previousMonth" | "custom";

/** Converte um Date para `YYYY-MM-DD` no fuso da loja (sem depender do locale). */
function dateKey(value: Date): string {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
}

function periodRange(period: PeriodKey, custom: { from: string; to: string }): { from?: string; to?: string } {
  const today = new Date();
  if (period === "today") return { from: dateKey(today), to: dateKey(today) };
  if (period === "week") {
    const start = new Date(today);
    start.setDate(start.getDate() - 6);
    return { from: dateKey(start), to: dateKey(today) };
  }
  if (period === "previousMonth") {
    const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const end = new Date(today.getFullYear(), today.getMonth(), 0);
    return { from: dateKey(start), to: dateKey(end) };
  }
  if (period === "custom") return { from: custom.from || undefined, to: custom.to || undefined };
  return {}; // month: o backend assume o mês corrente
}

/**
 * Detalhamento das vendas de um funcionário — leitura liberada para dono,
 * administrador e gerente (`GET /employees/:id/sales`, protegido por papel).
 */
export default function EmployeeSalesModal({ employee, onClose }: { employee: Employee; onClose: () => void }) {
  const t = useT();
  const { formatCurrency, formatDateTime } = useFormatters();
  const [period, setPeriod] = useState<PeriodKey>("month");
  const [custom, setCustom] = useState({ from: "", to: "" });
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);

  const range = useMemo(() => ({ ...periodRange(period, custom), page }), [period, custom, page]);
  const { data, isPending, error } = useEmployeeSales(employee.id, range);

  const methodLabel = (method: string) => t(`paymentMethods.${method}`);

  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-sm sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div role="dialog" aria-modal="true" aria-labelledby="employee-sales-title" className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 bg-gradient-to-r from-orange-50 to-amber-50 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-orange-700">{t("employees.sales.eyebrow")}</p>
            <h2 id="employee-sales-title" className="mt-1 truncate text-xl font-black text-slate-900">{employee.name}</h2>
            <p className="mt-1 text-[11px] text-slate-500">{t("employees.sales.subtitle")}</p>
          </div>
          <button type="button" aria-label={t("common.actions.close")} onClick={onClose} className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm hover:text-orange-600">
            <X className="size-4" />
          </button>
        </header>

        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-5 py-3 sm:px-6">
          {(["today", "week", "month", "previousMonth", "custom"] as PeriodKey[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => { setPeriod(key); setPage(1); }}
              aria-pressed={period === key}
              className={`h-9 rounded-xl border px-3 text-[11px] font-bold transition ${period === key ? "border-orange-300 bg-orange-50 text-orange-700" : "border-slate-200 bg-white text-slate-600 hover:border-orange-200"}`}
            >
              {t(`employees.sales.periods.${key}`)}
            </button>
          ))}
          {period === "custom" && (
            <div className="flex flex-wrap items-center gap-2">
              <input aria-label={t("employees.sales.fields.from")} type="date" value={custom.from} onChange={(event) => { setCustom((current) => ({ ...current, from: event.target.value })); setPage(1); }} className="h-9 rounded-xl border border-slate-200 px-2 text-[11px] font-semibold text-slate-700" />
              <input aria-label={t("employees.sales.fields.to")} type="date" value={custom.to} onChange={(event) => { setCustom((current) => ({ ...current, to: event.target.value })); setPage(1); }} className="h-9 rounded-xl border border-slate-200 px-2 text-[11px] font-semibold text-slate-700" />
            </div>
          )}
        </div>

        <div className="overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">
          {isPending && !data ? (
            <div className="flex min-h-56 items-center justify-center gap-2 text-sm font-bold text-slate-500"><LoaderCircle className="size-4 animate-spin" />{t("employees.sales.loading")}</div>
          ) : error ? (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">{error.message}</div>
          ) : data ? (
            <div className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <Metric label={t("employees.sales.metrics.totalSold")} value={formatCurrency(data.summary.totalSold)} tone="orange" />
                <Metric label={t("employees.sales.metrics.salesCount")} value={String(data.summary.salesCount)} />
                <Metric label={t("employees.sales.metrics.averageTicket")} value={formatCurrency(data.summary.averageTicket)} />
                <Metric label={t("employees.sales.metrics.discountGiven")} value={formatCurrency(data.summary.discountGiven)} tone="amber" />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <Metric label={t("employees.sales.metrics.itemsSold")} value={String(data.summary.itemsSold)} />
                <Metric label={t("employees.sales.metrics.cancelledCount")} value={String(data.summary.cancelledCount)} tone={data.summary.cancelledCount ? "red" : "slate"} />
                <Metric label={t("employees.sales.metrics.cancelledAmount")} value={formatCurrency(data.summary.cancelledAmount)} tone={data.summary.cancelledAmount ? "red" : "slate"} />
              </div>

              <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <BarChart3 className="size-4 text-orange-600" />
                  <h3 className="text-xs font-black text-slate-900">{t("employees.sales.byMethod")}</h3>
                </div>
                {data.payments.length ? (
                  <ul className="mt-3 space-y-2.5">
                    {data.payments.map((payment) => {
                      const share = data.summary.totalSold > 0 ? Math.round((payment.amount / data.summary.totalSold) * 100) : 0;
                      return (
                        <li key={payment.method}>
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                            <span>{methodLabel(payment.method)} <span className="font-semibold text-slate-400">· {t("employees.sales.salesInMethod", { count: payment.count })}</span></span>
                            <span className="text-slate-900">{formatCurrency(payment.amount)} <span className="font-semibold text-slate-400">({share}%)</span></span>
                          </div>
                          <div className="mt-1.5 h-1.5 rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-orange-600 to-amber-500" style={{ width: `${share}%` }} /></div>
                        </li>
                      );
                    })}
                  </ul>
                ) : <p className="mt-2 text-xs text-slate-500">{t("employees.sales.noPayments")}</p>}
              </section>

              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Receipt className="size-4 text-orange-600" />
                    <h3 className="text-xs font-black text-slate-900">{t("employees.sales.listTitle", { count: data.pagination.total })}</h3>
                  </div>
                  {data.pagination.totalPages > 1 && (
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                      <button type="button" aria-label={t("employees.sales.previousPage")} disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="grid size-8 place-items-center rounded-lg border border-slate-200 disabled:opacity-40"><ChevronLeft className="size-4" /></button>
                      <span>{t("employees.sales.page", { page: data.pagination.page, total: data.pagination.totalPages })}</span>
                      <button type="button" aria-label={t("employees.sales.nextPage")} disabled={page >= data.pagination.totalPages} onClick={() => setPage((current) => current + 1)} className="grid size-8 place-items-center rounded-lg border border-slate-200 disabled:opacity-40"><ChevronRight className="size-4" /></button>
                    </div>
                  )}
                </div>

                {data.sales.length ? (
                  <ul className="divide-y divide-slate-100">
                    {data.sales.map((sale) => <SaleRow key={sale.id} sale={sale} open={expanded === sale.id} onToggle={() => setExpanded(expanded === sale.id ? null : sale.id)} formatCurrency={formatCurrency} formatDateTime={formatDateTime} methodLabel={methodLabel} t={t} />)}
                  </ul>
                ) : <p className="px-4 py-8 text-center text-xs text-slate-500">{t("employees.sales.empty")}</p>}
              </section>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, tone = "slate" }: { label: string; value: string; tone?: "slate" | "orange" | "amber" | "red" }) {
  const tones = {
    slate: "border-slate-200 bg-white text-slate-900",
    orange: "border-orange-200 bg-orange-50 text-orange-800",
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    red: "border-red-200 bg-red-50 text-red-700",
  } as const;
  return (
    <div className={`rounded-2xl border px-4 py-3 shadow-sm ${tones[tone]}`}>
      <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">{label}</p>
      <p className="mt-1 text-lg font-black">{value}</p>
    </div>
  );
}

function SaleRow({ sale, open, onToggle, formatCurrency, formatDateTime, methodLabel, t }: {
  sale: EmployeeSale;
  open: boolean;
  onToggle: () => void;
  formatCurrency: (value: number) => string;
  formatDateTime: (value: string | Date) => string;
  methodLabel: (method: string) => string;
  t: (key: string, values?: Record<string, string | number>) => string;
}) {
  return (
    <li>
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left hover:bg-orange-50/40">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-xs font-black text-slate-800">
            #{sale.number}
            {sale.status === "CANCELLED" && <span className="rounded-full bg-red-100 px-2 py-0.5 text-[9px] font-black uppercase text-red-700">{t("employees.sales.cancelled")}</span>}
          </p>
          <p className="mt-1 truncate text-[11px] text-slate-500">{sale.customerName} · {formatDateTime(sale.createdAt)}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {sale.discount > 0 && <span className="text-[10px] font-bold text-amber-700">{t("employees.sales.discountShort", { value: formatCurrency(sale.discount) })}</span>}
          <span className="text-sm font-black text-slate-900">{formatCurrency(sale.total)}</span>
          <ChevronDown className={`size-4 text-slate-400 transition ${open ? "rotate-180" : ""}`} />
        </div>
      </button>
      {open && (
        <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">{t("employees.sales.itemsTitle")}</p>
          <ul className="mt-2 space-y-1.5">
            {sale.items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 text-[11px] text-slate-600">
                <span className="min-w-0 truncate">{item.quantity}× {item.productName}</span>
                <span className="shrink-0 font-bold text-slate-700">{formatCurrency(item.total)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 grid gap-1.5 text-[11px] text-slate-600 sm:grid-cols-2">
            <p>{t("employees.sales.subtotal")}: <strong className="text-slate-800">{formatCurrency(sale.subtotal)}</strong></p>
            <p>{t("employees.sales.discount")}: <strong className="text-slate-800">{formatCurrency(sale.discount)}</strong></p>
            <p>{t("employees.sales.method")}: <strong className="text-slate-800">{sale.payments.length ? sale.payments.map((payment) => `${methodLabel(payment.method)} ${formatCurrency(payment.amount)}`).join(" + ") : methodLabel(sale.paymentMethod)}</strong></p>
            {sale.status === "CANCELLED" && sale.cancelledAt && (
              <p className="text-red-700">{t("employees.sales.cancelInfo", { date: formatDateTime(sale.cancelledAt), name: sale.cancelledByName ?? "" })}{sale.cancelReason ? ` · ${sale.cancelReason}` : ""}</p>
            )}
          </div>
        </div>
      )}
    </li>
  );
}
