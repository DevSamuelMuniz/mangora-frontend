"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Download,
  LoaderCircle,
  Package,
  ReceiptText,
  ShoppingBag,
  TrendingUp,
  Users,
  WalletCards,
  X,
  type LucideIcon,
} from "lucide-react";

import type { ReportDataset, ReportPeriod } from "@/types/report";
import { formatCurrency, formatNumber } from "@/lib/format";
import { useReports } from "@/features/reports/hooks/useReports";

const emptyReport: ReportDataset = {
  label: "Últimos 30 dias",
  comparisonLabel: "30 dias anteriores",
  metrics: { revenue: 0, sales: 0, averageTicket: 0, newCustomers: 0, revenueVariation: 0, salesVariation: 0, ticketVariation: 0, customersVariation: 0 },
  performance: [], products: [], payments: [], income: 0, expenses: 0, recurringCustomers: 0,
};

export default function ReportsOverview() {
  const [period, setPeriod] = useState<ReportPeriod>("30d");
  const [message, setMessage] = useState("");
  const { data: dataset = emptyReport, isLoading: loading, error } = useReports(period);
  const errorMessage = error instanceof Error ? error.message : "";

  function changePeriod(nextPeriod: ReportPeriod) {
    setMessage("");
    setPeriod(nextPeriod);
  }

  const chartMaximum = useMemo(
    () => Math.max(1, ...dataset.performance.flatMap((item) => [item.revenue, item.previousRevenue])),
    [dataset],
  );
  const operationalResult = dataset.income - dataset.expenses;
  const resultMargin = dataset.income ? (operationalResult / dataset.income) * 100 : 0;

  function requestExport() {
    const rows = [
      ["Indicador", "Valor"],
      ["Faturamento", dataset.metrics.revenue],
      ["Vendas", dataset.metrics.sales],
      ["Ticket médio", dataset.metrics.averageTicket],
      ["Novos clientes", dataset.metrics.newCustomers],
      [],
      ["Produto", "Categoria", "Quantidade", "Faturamento"],
      ...dataset.products.map((product) => [product.name, product.category, product.quantity, product.revenue]),
    ];
    const csv = rows.map((row) => row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(";")).join("\r\n");
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio-mangora-${period}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setMessage("Relatório CSV exportado com sucesso.");
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-orange-600">Inteligência do negócio</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Relatórios</h1>
          <p className="mt-1 text-xs text-slate-500">Analise vendas, resultados, produtos e clientes.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="relative"><span className="sr-only">Período do relatório</span><CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><select value={period} disabled={loading} onChange={(event) => void changePeriod(event.target.value as ReportPeriod)} className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-8 text-xs font-bold text-slate-600 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-100 disabled:opacity-60 sm:w-48"><option value="7d">Últimos 7 dias</option><option value="30d">Últimos 30 dias</option><option value="90d">Últimos 90 dias</option></select></label>
          <button type="button" disabled={loading} onClick={requestExport} className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 shadow-sm transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700 disabled:opacity-60">{loading ? <LoaderCircle className="size-4 animate-spin" /> : <Download className="size-4" />}Exportar relatório</button>
        </div>
      </div>

      {message && <div role="status" className="flex items-start justify-between gap-3 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-xs font-semibold text-yellow-800"><span className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0" />{message}</span><button type="button" onClick={() => setMessage("")} aria-label="Fechar aviso" className="rounded-md p-1 hover:bg-yellow-100"><X className="size-3.5" /></button></div>}
      {errorMessage && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">{errorMessage}</div>}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={CircleDollarSign} label="Faturamento" value={formatCurrency(dataset.metrics.revenue)} variation={dataset.metrics.revenueVariation} description={`Comparado aos ${dataset.comparisonLabel.toLocaleLowerCase("pt-BR")}`} iconClassName="bg-green-50 text-green-600" />
        <MetricCard icon={ShoppingBag} label="Vendas realizadas" value={formatNumber(dataset.metrics.sales)} variation={dataset.metrics.salesVariation} description="Pedidos concluídos no período" iconClassName="bg-orange-50 text-orange-600" />
        <MetricCard icon={TrendingUp} label="Ticket médio" value={formatCurrency(dataset.metrics.averageTicket)} variation={dataset.metrics.ticketVariation} description="Média por venda concluída" iconClassName="bg-yellow-50 text-yellow-600" />
        <MetricCard icon={Users} label="Novos clientes" value={formatNumber(dataset.metrics.newCustomers)} variation={dataset.metrics.customersVariation} description="Cadastros no período" iconClassName="bg-amber-50 text-amber-600" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.45fr_0.55fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3"><div className="flex items-center gap-3"><div className="flex size-9 items-center justify-center rounded-xl bg-orange-50 text-orange-600"><BarChart3 className="size-4" /></div><div><h2 className="text-sm font-bold text-slate-950">Desempenho de faturamento</h2><p className="mt-0.5 text-[10px] text-slate-400">{dataset.label} comparados ao período anterior</p></div></div><div className="flex items-center gap-3 text-[9px] text-slate-500"><Legend color="bg-orange-600" label="Atual" /><Legend color="bg-slate-200" label="Anterior" /></div></div>
          <div className="mt-6 flex h-56 items-end gap-3 sm:gap-5">
            {dataset.performance.map((point) => <div key={point.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><div className="group flex h-full w-full items-end justify-center gap-1" aria-label={`${point.label}: ${formatCurrency(point.revenue)}`}><div className="w-full max-w-6 rounded-t-md bg-slate-200 transition hover:bg-slate-300" style={{ height: `${Math.max(8, (point.previousRevenue / chartMaximum) * 100)}%` }} /><div className="w-full max-w-6 rounded-t-md bg-gradient-to-t from-orange-600 to-yellow-400 transition hover:opacity-80" style={{ height: `${Math.max(8, (point.revenue / chartMaximum) * 100)}%` }} /></div><span className="text-[9px] font-bold text-slate-400">{point.label}</span></div>)}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center gap-3"><div className="flex size-9 items-center justify-center rounded-xl bg-yellow-50 text-yellow-600"><WalletCards className="size-4" /></div><div><h2 className="text-sm font-bold text-slate-950">Formas de pagamento</h2><p className="mt-0.5 text-[10px] text-slate-400">Participação no faturamento</p></div></div>
          <div className="mt-5 space-y-4">{dataset.payments.map((payment) => <div key={payment.method}><div className="flex items-end justify-between gap-3"><div><p className="text-xs font-bold text-slate-700">{payment.method}</p><p className="mt-0.5 text-[9px] text-slate-400">{formatCurrency(payment.amount)}</p></div><span className="text-xs font-black text-slate-800">{payment.percentage}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${payment.colorClassName}`} style={{ width: `${payment.percentage}%` }} /></div></div>)}{dataset.payments.length === 0 && <p className="py-8 text-center text-xs text-slate-400">Sem vendas no período.</p>}</div>
        </article>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 sm:px-5"><div><h2 className="text-sm font-bold text-slate-950">Produtos com melhor desempenho</h2><p className="mt-0.5 text-[10px] text-slate-400">Ranking por faturamento no período</p></div><Package className="size-4 text-orange-500" /></div>
          <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left"><thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400"><tr><th className="px-5 py-3">Produto ou serviço</th><th className="px-4 py-3">Categoria</th><th className="px-4 py-3">Quantidade</th><th className="px-5 py-3 text-right">Faturamento</th></tr></thead><tbody className="divide-y divide-slate-100">{dataset.products.map((product, index) => <tr key={`${product.name}-${product.category}`}><td className="px-5 py-3.5"><div className="flex items-center gap-3"><span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[10px] font-black text-orange-600">{index + 1}</span><span className="max-w-56 truncate text-xs font-bold text-slate-800">{product.name}</span></div></td><td className="px-4 py-3.5 text-xs text-slate-500">{product.category}</td><td className="px-4 py-3.5 text-xs font-bold text-slate-700">{formatNumber(product.quantity)}</td><td className="px-5 py-3.5 text-right text-xs font-black text-slate-900">{formatCurrency(product.revenue)}</td></tr>)}{dataset.products.length === 0 && <tr><td colSpan={4} className="px-5 py-10 text-center text-xs text-slate-400">Sem produtos vendidos no período.</td></tr>}</tbody></table></div>
        </article>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><div className="flex items-center gap-3"><div className="flex size-9 items-center justify-center rounded-xl bg-green-50 text-green-600"><ReceiptText className="size-4" /></div><div><h2 className="text-sm font-bold text-slate-950">Resultado operacional</h2><p className="mt-0.5 text-[10px] text-slate-400">Receitas e despesas realizadas</p></div></div><div className="mt-5 space-y-3"><ResultRow icon={ArrowUpRight} label="Receitas" value={dataset.income} className="text-green-600" /><ResultRow icon={ArrowDownRight} label="Despesas" value={dataset.expenses} className="text-red-600" /><div className="border-t border-slate-100 pt-3"><div className="flex items-end justify-between"><div><p className="text-xs font-bold text-slate-700">Resultado</p><p className="mt-0.5 text-[9px] text-slate-400">Margem de {resultMargin.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%</p></div><p className="text-base font-black text-orange-700">{formatCurrency(operationalResult)}</p></div></div></div></article>
          <article className="rounded-2xl border border-slate-200 bg-gradient-to-br from-orange-700 to-amber-700 p-4 text-white shadow-sm sm:p-5"><Users className="size-5 text-yellow-200" /><p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-orange-200">Relacionamento</p><p className="mt-1 text-2xl font-black">{dataset.recurringCustomers}%</p><p className="mt-1 text-xs text-white/70">dos clientes do período já haviam comprado anteriormente.</p><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-yellow-300" style={{ width: `${dataset.recurringCustomers}%` }} /></div></article>
        </div>
      </div>

      <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-[10px] leading-4 text-green-800">Indicadores calculados com dados reais da empresa e o período selecionado.</div>
    </section>
  );
}

function MetricCard({ icon: Icon, label, value, variation, description, iconClassName }: { icon: LucideIcon; label: string; value: string; variation: number; description: string; iconClassName: string }) { const positive = variation >= 0; return <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><div className={`flex size-9 items-center justify-center rounded-xl ${iconClassName}`}><Icon className="size-4" /></div><span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[9px] font-bold ${positive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>{positive ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}{Math.abs(variation).toLocaleString("pt-BR")}%</span></div><p className="mt-4 text-[10px] font-semibold text-slate-400">{label}</p><p className="mt-1 truncate text-xl font-black text-slate-950">{value}</p><p className="mt-1 text-[9px] text-slate-400">{description}</p></article>; }
function Legend({ color, label }: { color: string; label: string }) { return <span className="flex items-center gap-1.5"><span className={`size-2 rounded-full ${color}`} />{label}</span>; }
function ResultRow({ icon: Icon, label, value, className }: { icon: LucideIcon; label: string; value: number; className: string }) { return <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-xs font-semibold text-slate-500"><Icon className={`size-3.5 ${className}`} />{label}</span><span className={`text-xs font-black ${className}`}>{formatCurrency(value)}</span></div>; }
