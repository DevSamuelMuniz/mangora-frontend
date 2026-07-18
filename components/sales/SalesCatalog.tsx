"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  Banknote,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  LoaderCircle,
  MoreHorizontal,
  ReceiptText,
  RefreshCw,
  Search,
  ShoppingCart,
  X,
  XCircle,
  type LucideIcon,
} from "lucide-react";

import { apiRequest } from "@/lib/api/client";
import { paymentMethodLabels, saleStatusLabels, type PaymentMethod, type Sale, type SaleStatus } from "@/types/sale";

const PAGE_SIZE = 6;
const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const paymentMethods: PaymentMethod[] = ["PIX", "CREDIT_CARD", "DEBIT_CARD", "CASH", "BOLETO"];

export default function SalesCatalog() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [paymentMethod, setPaymentMethod] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [saleToCancel, setSaleToCancel] = useState<Sale | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const loadSales = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setSales(await apiRequest<Sale[]>("/sales"));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível carregar as vendas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    apiRequest<Sale[]>("/sales")
      .then((data) => {
        if (!mounted) return;
        setSales(data);
        const selectedId = new URLSearchParams(window.location.search).get("selecionada");
        if (selectedId) setSelectedSale(data.find((sale) => sale.id === selectedId) ?? null);
      })
      .catch((requestError: unknown) => { if (mounted) setError(requestError instanceof Error ? requestError.message : "Não foi possível carregar as vendas."); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const filteredSales = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");
    return sales.filter((sale) => {
      const matchesSearch = !normalizedSearch || `${sale.code} ${sale.customerName}`.toLocaleLowerCase("pt-BR").includes(normalizedSearch);
      return matchesSearch && (status === "all" || sale.status === status) && (paymentMethod === "all" || sale.paymentMethod === paymentMethod);
    });
  }, [paymentMethod, sales, search, status]);

  const completedSales = sales.filter((sale) => sale.status === "COMPLETED");
  const todayKey = new Date().toLocaleDateString("en-CA");
  const todaySales = completedSales.filter((sale) => new Date(sale.createdAt).toLocaleDateString("en-CA") === todayKey);
  const todayRevenue = todaySales.reduce((total, sale) => total + sale.total, 0);
  const averageTicket = completedSales.length ? completedSales.reduce((total, sale) => total + sale.total, 0) / completedSales.length : 0;
  const cancelledCount = sales.filter((sale) => sale.status === "CANCELLED").length;
  const totalPages = Math.max(1, Math.ceil(filteredSales.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleSales = filteredSales.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function clearFilters() {
    setSearch("");
    setStatus("all");
    setPaymentMethod("all");
    setPage(1);
  }

  async function confirmCancellation(reason: string) {
    if (!saleToCancel) return;
    try {
      setCancelling(true);
      setError("");
      const cancelled = await apiRequest<Sale>(`/sales/${saleToCancel.id}/cancel`, { method: "POST", body: JSON.stringify({ reason }) });
      setSales((current) => current.map((sale) => sale.id === cancelled.id ? cancelled : sale));
      setSelectedSale((current) => current?.id === cancelled.id ? cancelled : current);
      setSaleToCancel(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível cancelar a venda.");
    } finally {
      setCancelling(false);
    }
  }

  return (
    <>
      <section>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-violet-600">Comercial</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Vendas</h1>
            <p className="mt-1 text-xs text-slate-500">Acompanhe movimentações, pagamentos e resultados.</p>
          </div>
          <Link href="/vendas/nova" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-xl">
            <ShoppingCart className="size-4" />Nova venda
          </Link>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard icon={Banknote} label="Faturamento hoje" value={currencyFormatter.format(todayRevenue)} iconClassName="bg-emerald-50 text-emerald-600" />
          <SummaryCard icon={ShoppingCart} label="Vendas hoje" value={String(todaySales.length)} iconClassName="bg-violet-50 text-violet-600" />
          <SummaryCard icon={ReceiptText} label="Ticket médio" value={currencyFormatter.format(averageTicket)} iconClassName="bg-cyan-50 text-cyan-600" />
          <SummaryCard icon={XCircle} label="Vendas canceladas" value={String(cancelledCount)} iconClassName="bg-red-50 text-red-600" />
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(280px,1fr)_190px_210px]">
            <label className="relative">
              <span className="sr-only">Buscar vendas</span>
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input type="search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Buscar por código ou cliente..." className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100" />
            </label>
            <FilterSelect label="Status" value={status} onChange={(value) => { setStatus(value); setPage(1); }} options={[{ value: "COMPLETED", label: "Concluída" }, { value: "CANCELLED", label: "Cancelada" }]} />
            <FilterSelect label="Pagamento" value={paymentMethod} onChange={(value) => { setPaymentMethod(value); setPage(1); }} options={paymentMethods.map((method) => ({ value: method, label: paymentMethodLabels[method] }))} />
          </div>
        </div>

        {error && sales.length > 0 && <div role="alert" className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700"><span>{error}</span><button type="button" onClick={() => void loadSales()} className="font-bold underline">Tentar novamente</button></div>}

        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-80 items-center justify-center text-xs font-semibold text-slate-500"><LoaderCircle className="mr-2 size-5 animate-spin text-violet-600" />Carregando vendas...</div>
          ) : error && sales.length === 0 ? (
            <div className="flex min-h-80 flex-col items-center justify-center px-6 text-center"><AlertTriangle className="size-6 text-red-500" /><h2 className="mt-3 text-sm font-bold text-slate-900">Não foi possível carregar as vendas</h2><p className="mt-1 text-xs text-slate-500">{error}</p><button type="button" onClick={() => void loadSales()} className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-xs font-bold text-violet-600"><RefreshCw className="size-3.5" />Tentar novamente</button></div>
          ) : visibleSales.length ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[940px] border-collapse text-left">
                  <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                    <tr><th className="px-5 py-3">Venda</th><th className="px-4 py-3">Cliente</th><th className="px-4 py-3">Data</th><th className="px-4 py-3">Pagamento</th><th className="px-4 py-3">Valor</th><th className="px-4 py-3">Status</th><th className="w-16 px-4 py-3 text-center">Ações</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {visibleSales.map((sale) => {
                      const statusStyle = getStatusStyle(sale.status);
                      const StatusIcon = statusStyle.icon;
                      return (
                        <tr key={sale.id} className="transition hover:bg-slate-50">
                          <td className="px-5 py-3.5"><p className="text-xs font-black text-violet-700">{sale.code}</p><p className="mt-1 text-[10px] text-slate-400">{sale.items.reduce((total, item) => total + item.quantity, 0)} item(ns)</p></td>
                          <td className="px-4 py-3.5"><p className="max-w-52 truncate text-xs font-bold text-slate-800">{sale.customerName}</p></td>
                          <td className="px-4 py-3.5"><p className="text-xs text-slate-600">{formatDate(sale.createdAt)}</p><p className="mt-1 text-[10px] text-slate-400">{formatTime(sale.createdAt)}</p></td>
                          <td className="px-4 py-3.5 text-xs text-slate-600">{paymentMethodLabels[sale.paymentMethod]}</td>
                          <td className="px-4 py-3.5 text-xs font-black text-slate-900">{currencyFormatter.format(sale.total)}</td>
                          <td className="px-4 py-3.5"><span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${statusStyle.className}`}><StatusIcon className="size-3" />{saleStatusLabels[sale.status]}</span></td>
                          <td className="px-4 py-3.5 text-center">
                            <details className="relative inline-block text-left">
                              <summary aria-label={`Ações da venda ${sale.code}`} className="flex size-8 cursor-pointer list-none items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><MoreHorizontal className="size-4" /></summary>
                              <div className="absolute right-0 z-20 mt-1 w-40 rounded-xl border border-slate-200 bg-white p-1.5 text-left shadow-xl">
                                <button type="button" onClick={() => setSelectedSale(sale)} className="flex h-9 w-full items-center gap-2 rounded-lg px-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"><Eye className="size-3.5" />Visualizar</button>
                                {sale.status === "COMPLETED" && <button type="button" onClick={() => setSaleToCancel(sale)} className="flex h-9 w-full items-center gap-2 rounded-lg px-2.5 text-xs font-semibold text-red-600 hover:bg-red-50"><XCircle className="size-3.5" />Cancelar venda</button>}
                              </div>
                            </details>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <p className="text-[11px] text-slate-500">Mostrando {visibleSales.length} de {filteredSales.length} venda(s)</p>
                <div className="flex items-center gap-2">
                  <PageButton label="Página anterior" disabled={currentPage === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}><ChevronLeft className="size-4" /></PageButton>
                  <span className="min-w-20 text-center text-[11px] font-semibold text-slate-600">Página {currentPage} de {totalPages}</span>
                  <PageButton label="Próxima página" disabled={currentPage === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}><ChevronRight className="size-4" /></PageButton>
                </div>
              </div>
            </>
          ) : (
            <div className="flex min-h-80 flex-col items-center justify-center px-6 py-12 text-center">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600"><ReceiptText className="size-5" /></div>
              <h2 className="mt-4 text-sm font-bold text-slate-900">Nenhuma venda encontrada</h2>
              <p className="mt-1 text-xs text-slate-500">{sales.length === 0 ? "Registre a primeira venda da empresa." : "Ajuste os filtros para consultar outras movimentações."}</p>
              {sales.length === 0 ? <Link href="/vendas/nova" className="mt-4 inline-flex h-10 items-center rounded-xl bg-violet-600 px-4 text-xs font-bold text-white">Registrar venda</Link> : <button type="button" onClick={clearFilters} className="mt-4 h-10 rounded-xl border border-slate-200 px-4 text-xs font-bold text-violet-600 hover:bg-violet-50">Limpar filtros</button>}
            </div>
          )}
        </div>
      </section>

      {selectedSale && <SaleDetails sale={selectedSale} onClose={() => setSelectedSale(null)} />}
      {saleToCancel && <CancelSale sale={saleToCancel} loading={cancelling} onCancel={() => setSaleToCancel(null)} onConfirm={(reason) => void confirmCancellation(reason)} />}
    </>
  );
}

function SummaryCard({ icon: Icon, label, value, iconClassName }: { icon: LucideIcon; label: string; value: string; iconClassName: string }) {
  return <article className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className={`flex size-9 items-center justify-center rounded-xl ${iconClassName}`}><Icon className="size-4" /></div><div className="min-w-0"><p className="text-[10px] font-semibold text-slate-400">{label}</p><p className="mt-0.5 truncate text-lg font-black text-slate-950">{value}</p></div></article>;
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: readonly { value: string; label: string }[]; onChange: (value: string) => void }) {
  return <label><span className="sr-only">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-600 outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100"><option value="all">{label}: todos</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
}

function PageButton({ label, disabled, onClick, children }: { label: string; disabled: boolean; onClick: () => void; children: ReactNode }) {
  return <button type="button" aria-label={label} disabled={disabled} onClick={onClick} className="flex size-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">{children}</button>;
}

function SaleDetails({ sale, onClose }: { sale: Sale; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-wider text-violet-600">Detalhes da venda</p><h2 className="mt-1 text-lg font-black text-slate-950">Venda {sale.code}</h2><p className="mt-1 text-xs text-slate-500">{sale.customerName} · {formatDate(sale.createdAt)}, {formatTime(sale.createdAt)}</p></div><button type="button" onClick={onClose} aria-label="Fechar detalhes" className="flex size-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100"><X className="size-4" /></button></div>
        <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
          {sale.items.map((item) => <div key={item.id} className="flex items-center justify-between gap-4 border-b border-slate-100 px-3 py-3 last:border-0"><div><p className="text-xs font-bold text-slate-800">{item.productName}</p><p className="mt-0.5 text-[10px] text-slate-400">{item.quantity} × {currencyFormatter.format(item.unitPrice)}</p></div><p className="text-xs font-black text-slate-900">{currencyFormatter.format(item.subtotal)}</p></div>)}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3"><Info label="Pagamento" value={paymentMethodLabels[sale.paymentMethod]} /><Info label="Total" value={currencyFormatter.format(sale.total)} /></div>
        {sale.status === "CANCELLED" && <div className="mt-3 rounded-xl bg-red-50 p-3 text-xs text-red-700"><strong>Cancelada:</strong> {sale.cancelReason}</div>}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] text-slate-400">{label}</p><p className="mt-1 text-xs font-bold text-slate-800">{value}</p></div>;
}

function CancelSale({ sale, loading, onCancel, onConfirm }: { sale: Sale; loading: boolean; onCancel: () => void; onConfirm: (reason: string) => void }) {
  const [reason, setReason] = useState("");
  return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"><div role="alertdialog" aria-modal="true" className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl"><div className="flex size-10 items-center justify-center rounded-xl bg-red-50 text-red-600"><XCircle className="size-4" /></div><h2 className="mt-4 text-base font-black text-slate-950">Cancelar venda {sale.code}?</h2><p className="mt-2 text-xs leading-5 text-slate-500">Os itens controlados voltarão ao estoque e o total do cliente será estornado.</p><label htmlFor="cancelReason" className="mt-4 block text-xs font-bold text-slate-700">Motivo</label><textarea id="cancelReason" value={reason} onChange={(event) => setReason(event.target.value)} maxLength={500} rows={3} placeholder="Informe o motivo do cancelamento" className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-violet-300 focus:ring-4 focus:ring-violet-100" /><div className="mt-5 flex justify-end gap-2"><button type="button" disabled={loading} onClick={onCancel} className="h-10 rounded-xl border border-slate-200 px-4 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50">Voltar</button><button type="button" disabled={loading || reason.trim().length < 3} onClick={() => onConfirm(reason)} className="inline-flex h-10 items-center gap-2 rounded-xl bg-red-600 px-4 text-xs font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50">{loading && <LoaderCircle className="size-3.5 animate-spin" />}Cancelar venda</button></div></div></div>;
}

function getStatusStyle(status: SaleStatus) {
  if (status === "COMPLETED") return { className: "bg-emerald-50 text-emerald-600", icon: CheckCircle2 };
  return { className: "bg-red-50 text-red-600", icon: XCircle };
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(date));
}

function formatTime(date: string) {
  return new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date(date));
}
