"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRightLeft,
  ArrowUpRight,
  Boxes,
  CircleDollarSign,
  LoaderCircle,
  PackageCheck,
  PackageX,
  RefreshCw,
  Search,
  type LucideIcon,
} from "lucide-react";

import { apiRequest } from "@/lib/api/client";
import type { StockOverviewResponse } from "@/types/stock";

type StockSituation = "normal" | "low" | "out" | "all";
const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
const emptyOverview: StockOverviewResponse = {
  products: [],
  movements: [],
  summary: { totalUnits: 0, inventoryValue: 0, lowStockCount: 0, outOfStockCount: 0 },
};

export default function StockOverview() {
  const [overview, setOverview] = useState<StockOverviewResponse>(emptyOverview);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [situation, setSituation] = useState<StockSituation>("all");

  const loadOverview = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setOverview(await apiRequest<StockOverviewResponse>("/stock"));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível carregar o estoque.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    apiRequest<StockOverviewResponse>("/stock")
      .then((data) => { if (mounted) setOverview(data); })
      .catch((requestError: unknown) => { if (mounted) setError(requestError instanceof Error ? requestError.message : "Não foi possível carregar o estoque."); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(overview.products.map((product) => product.category))).sort(),
    [overview.products],
  );
  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");
    return overview.products.filter((product) => {
      const productSituation = getStockSituation(product.stock - product.reservedStock, product.minimumStock);
      return (
        (!normalizedSearch || `${product.name} ${product.sku}`.toLocaleLowerCase("pt-BR").includes(normalizedSearch)) &&
        (category === "all" || product.category === category) &&
        (situation === "all" || productSituation === situation)
      );
    });
  }, [category, overview.products, search, situation]);

  function clearFilters() {
    setSearch("");
    setCategory("all");
    setSituation("all");
  }

  return (
    <section>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-violet-600">Operação</p><h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Estoque</h1><p className="mt-1 text-xs text-slate-500">Controle saldos, níveis mínimos e movimentações.</p></div><Link href="/estoque/movimentacao" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-xl"><ArrowRightLeft className="size-4" />Nova movimentação</Link></div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard icon={Boxes} label="Unidades em estoque" value={String(overview.summary.totalUnits)} iconClassName="bg-violet-50 text-violet-600" />
        <SummaryCard icon={CircleDollarSign} label="Valor estimado" value={currencyFormatter.format(overview.summary.inventoryValue)} iconClassName="bg-cyan-50 text-cyan-600" />
        <SummaryCard icon={AlertTriangle} label="Estoque baixo" value={String(overview.summary.lowStockCount)} iconClassName="bg-amber-50 text-amber-600" />
        <SummaryCard icon={PackageX} label="Sem estoque" value={String(overview.summary.outOfStockCount)} iconClassName="bg-red-50 text-red-600" />
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(280px,1fr)_200px_190px]"><label className="relative"><span className="sr-only">Buscar no estoque</span><Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nome ou SKU..." className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100" /></label><label><span className="sr-only">Categoria</span><select value={category} onChange={(event) => setCategory(event.target.value)} className={selectClassName}><option value="all">Categoria: todas</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><label><span className="sr-only">Situação</span><select value={situation} onChange={(event) => setSituation(event.target.value as StockSituation)} className={selectClassName}><option value="all">Situação: todas</option><option value="normal">Estoque normal</option><option value="low">Estoque baixo</option><option value="out">Sem estoque</option></select></label></div></div>

      {error && overview.products.length > 0 && <div role="alert" className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700"><span>{error}</span><button type="button" onClick={() => void loadOverview()} className="font-bold underline">Tentar novamente</button></div>}

      <div className="mt-4 grid items-start gap-4 xl:grid-cols-[1.5fr_0.7fr]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-80 items-center justify-center"><LoaderCircle className="size-5 animate-spin text-violet-600" /><span className="ml-2 text-xs font-semibold text-slate-500">Carregando estoque...</span></div>
          ) : error && overview.products.length === 0 ? (
            <div className="flex min-h-80 flex-col items-center justify-center p-8 text-center"><AlertTriangle className="size-6 text-red-400" /><h2 className="mt-3 text-sm font-bold text-slate-900">Não foi possível carregar o estoque</h2><p className="mt-1 text-xs text-slate-500">{error}</p><button type="button" onClick={() => void loadOverview()} className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-xs font-bold text-violet-600"><RefreshCw className="size-3.5" />Tentar novamente</button></div>
          ) : filteredProducts.length ? (
            <div className="overflow-x-auto"><table className="w-full min-w-[880px] border-collapse text-left"><thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500"><tr><th className="px-5 py-3">Produto</th><th className="px-4 py-3">Preço</th><th className="px-4 py-3">Estoque</th><th className="px-4 py-3">Nível</th><th className="px-4 py-3">Valor</th><th className="px-4 py-3">Ação</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredProducts.map((product) => { const availableStock = product.stock - product.reservedStock; const stockSituation = getStockSituation(availableStock, product.minimumStock); const percentage = product.minimumStock > 0 ? Math.min((availableStock / product.minimumStock) * 100, 100) : 100; const status = getSituationStyle(stockSituation); return <tr key={product.id} className="transition hover:bg-slate-50"><td className="px-5 py-3.5"><div className="flex items-center gap-3"><div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600"><Boxes className="size-4" /></div><div className="min-w-0"><p className="max-w-56 truncate text-xs font-bold text-slate-800">{product.name}</p><p className="mt-1 text-[10px] text-slate-400">{product.sku} · {product.category}{!product.active && " · Inativo"}</p></div></div></td><td className="px-4 py-3.5 text-xs font-semibold text-slate-700">{currencyFormatter.format(product.price)}</td><td className="px-4 py-3.5"><p className={`text-xs font-black ${status.textClassName}`}>{availableStock} disp.</p><p className="mt-1 text-[9px] text-slate-400">{product.stock} físico · {product.reservedStock} reserv.</p></td><td className="px-4 py-3.5"><div className="w-28"><div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${status.barClassName}`} style={{ width: `${percentage}%` }} /></div><p className={`mt-1.5 text-[9px] font-bold ${status.textClassName}`}>{status.label}</p></div></td><td className="px-4 py-3.5 text-xs font-black text-slate-900">{currencyFormatter.format(product.stock * product.price)}</td><td className="px-4 py-3.5"><Link href={`/estoque/movimentacao?productId=${product.id}`} className="inline-flex h-8 items-center rounded-lg border border-slate-200 px-2.5 text-[10px] font-bold text-violet-600 hover:bg-violet-50">Movimentar</Link></td></tr>; })}</tbody></table></div>
          ) : (
            <div className="flex min-h-80 flex-col items-center justify-center p-8 text-center"><PackageCheck className="size-6 text-slate-300" /><h2 className="mt-3 text-sm font-bold text-slate-900">Nenhum produto encontrado</h2><p className="mt-1 text-xs text-slate-500">{overview.products.length === 0 ? "Cadastre um produto com controle de estoque para começar." : "Ajuste os filtros para consultar outros saldos."}</p>{overview.products.length === 0 ? <Link href="/produtos/novo" className="mt-4 inline-flex h-10 items-center rounded-xl bg-violet-600 px-4 text-xs font-bold text-white">Cadastrar produto</Link> : <button type="button" onClick={clearFilters} className="mt-4 h-10 rounded-xl border border-slate-200 px-4 text-xs font-bold text-violet-600 hover:bg-violet-50">Limpar filtros</button>}</div>
          )}
        </div>

        <article className="rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-200 px-4 py-4"><h2 className="text-sm font-bold text-slate-950">Movimentações recentes</h2><p className="mt-0.5 text-[10px] text-slate-400">Últimas entradas, saídas e ajustes</p></div>{overview.movements.length ? <div className="divide-y divide-slate-100">{overview.movements.map((movement) => { const isPositive = movement.quantity >= 0; const MovementIcon = isPositive ? ArrowUpRight : ArrowDownRight; const adjustment = movement.type === "ADJUSTMENT"; return <div key={movement.id} className="flex items-center gap-3 px-4 py-3.5"><div className={`flex size-8 shrink-0 items-center justify-center rounded-xl ${adjustment ? "bg-amber-50 text-amber-600" : isPositive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}><MovementIcon className="size-3.5" /></div><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-slate-800">{movement.product.name}</p><p className="mt-1 truncate text-[9px] text-slate-400">{movement.reason} · {dateFormatter.format(new Date(movement.createdAt))}</p><p className="mt-0.5 truncate text-[9px] text-slate-400">Por {movement.createdByName}</p></div><div className="shrink-0 text-right"><p className={`text-xs font-black ${movement.quantity > 0 ? "text-emerald-600" : movement.quantity < 0 ? "text-red-600" : "text-slate-500"}`}>{movement.quantity > 0 ? "+" : ""}{movement.quantity}</p><p className="mt-1 text-[9px] text-slate-400">{movementTypeLabel(movement.type)}</p></div></div>; })}</div> : <div className="flex min-h-44 flex-col items-center justify-center p-6 text-center"><ArrowRightLeft className="size-5 text-slate-300" /><p className="mt-2 text-xs font-semibold text-slate-500">Nenhuma movimentação registrada.</p></div>}</article>
      </div>
    </section>
  );
}

const selectClassName = "h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-600 outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100";
function SummaryCard({ icon: Icon, label, value, iconClassName }: { icon: LucideIcon; label: string; value: string; iconClassName: string }) { return <article className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className={`flex size-9 items-center justify-center rounded-xl ${iconClassName}`}><Icon className="size-4" /></div><div className="min-w-0"><p className="text-[10px] font-semibold text-slate-400">{label}</p><p className="mt-0.5 truncate text-lg font-black text-slate-950">{value}</p></div></article>; }
function getStockSituation(stock: number, minimumStock: number): Exclude<StockSituation, "all"> { if (stock === 0) return "out"; if (stock <= minimumStock) return "low"; return "normal"; }
function getSituationStyle(situation: Exclude<StockSituation, "all">) { if (situation === "out") return { label: "Sem estoque", textClassName: "text-red-600", barClassName: "bg-red-500" }; if (situation === "low") return { label: "Estoque baixo", textClassName: "text-amber-600", barClassName: "bg-amber-500" }; return { label: "Estoque normal", textClassName: "text-emerald-600", barClassName: "bg-emerald-500" }; }
function movementTypeLabel(type: "ENTRY" | "EXIT" | "ADJUSTMENT") { if (type === "ENTRY") return "Entrada"; if (type === "EXIT") return "Saída"; return "Ajuste"; }
