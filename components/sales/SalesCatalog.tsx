"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Banknote,
  CornerDownLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  LoaderCircle,
  MonitorPlay,
  MoreHorizontal,
  ReceiptText,
  RefreshCw,
  Search,
  ShoppingCart,
  X,
  XCircle,
} from "lucide-react";
import { useI18n, useT } from "@/i18n/provider";

import type { PaymentMethod, Sale, SaleStatus } from "@/types/sale";
import { formatCurrency, formatDate, formatTime } from "@/lib/format";
import SaleReturnForm from "@/components/sales/SaleReturnForm";
import { brazilDateKey } from "@/lib/timezone";
import { useCancelSale, useSales } from "@/features/sales/hooks/useSales";
import { useToast } from "@/components/ui/toast";
import { FilterSelect } from "@/components/shared/FilterSelect";
import { PageButton } from "@/components/shared/PageButton";
import { SummaryCard } from "@/components/shared/SummaryCard";

const PAGE_SIZE = 6;
const paymentMethods: PaymentMethod[] = ["PIX", "CREDIT_CARD", "DEBIT_CARD", "CASH", "BOLETO", "CHECK", "STORE_CREDIT"];

export default function SalesCatalog() {
  const t = useT();
  const { locale } = useI18n();
  const { data: sales = [], isLoading: loading, error, refetch: loadSales } = useSales();
  const cancelSale = useCancelSale();
  const toast = useToast();
  const [actionError, setActionError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [paymentMethod, setPaymentMethod] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [saleToCancel, setSaleToCancel] = useState<Sale | null>(null);
  const [saleToReturn, setSaleToReturn] = useState<Sale | null>(null);

  const errorMessage = actionError || (error instanceof Error ? error.message : "");

  // Ajuste de estado durante o render (padrão do React para estado derivado):
  // abre a venda apontada por ?selecionada= assim que os dados chegam.
  const [selectionApplied, setSelectionApplied] = useState(false);
  if (!selectionApplied && sales.length > 0) {
    const selectedId = typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("selecionada");
    const found = selectedId ? sales.find((sale) => sale.id === selectedId) ?? null : null;
    if (found) setSelectedSale(found);
    setSelectionApplied(true);
  }

  const filteredSales = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");
    return sales.filter((sale) => {
      const matchesSearch = !normalizedSearch || `${sale.code} ${sale.customerName}`.toLocaleLowerCase("pt-BR").includes(normalizedSearch);
      return matchesSearch && (status === "all" || sale.status === status) && (paymentMethod === "all" || sale.paymentMethod === paymentMethod);
    });
  }, [paymentMethod, sales, search, status]);

  const completedSales = sales.filter((sale) => sale.status === "COMPLETED");
  const todayKey = brazilDateKey();
  const todaySales = completedSales.filter((sale) => brazilDateKey(sale.createdAt) === todayKey);
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
      setActionError("");
      const cancelled = await cancelSale.mutateAsync({ id: saleToCancel.id, reason });
      setSelectedSale((current) => (current?.id === cancelled.id ? cancelled : current));
      setSaleToCancel(null);
      toast.success(`t("sales.cancelSuccess", { code: cancelled.code })`);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : t("sales.cancelFailed");
      setActionError(message);
      toast.error(message);
    }
  }

  return (
    <>
      <section>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-orange-600">Comercial</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{t("sales.title")}</h1>
            <p className="mt-1 text-xs text-slate-500">{t("sales.subtitle")}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/pdv" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700">
              <MonitorPlay className="size-4" />Abrir PDV
            </Link>
            <Link href="/vendas?acao=novo" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 px-4 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:shadow-xl">
              <ShoppingCart className="size-4" />Nova venda
            </Link>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard icon={Banknote} label={t("sales.summary.revenueToday")} value={formatCurrency(todayRevenue, locale)} iconClassName="bg-green-50 text-green-600" />
          <SummaryCard icon={ShoppingCart} label={t("sales.summary.salesToday")} value={String(todaySales.length)} iconClassName="bg-orange-50 text-orange-600" />
          <SummaryCard icon={ReceiptText} label={t("sales.summary.averageTicket")} value={formatCurrency(averageTicket, locale)} iconClassName="bg-yellow-50 text-yellow-600" />
          <SummaryCard icon={XCircle} label={t("sales.summary.cancelled")} value={String(cancelledCount)} iconClassName="bg-red-50 text-red-600" />
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(280px,1fr)_190px_210px]">
            <label className="relative">
              <span className="sr-only">{t("sales.filters.searchLabel")}</span>
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input type="search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder={t("sales.filters.searchPlaceholder")} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100" />
            </label>
            <FilterSelect label={t("sales.filters.status")} value={status} onChange={(value) => { setStatus(value); setPage(1); }} options={[{ value: "COMPLETED", label: t("sales.status.COMPLETED") }, { value: "CANCELLED", label: t("sales.status.CANCELLED") }]} />
            <FilterSelect label={t("sales.filters.payment")} value={paymentMethod} onChange={(value) => { setPaymentMethod(value); setPage(1); }} options={paymentMethods.map((method) => ({ value: method, label: t(`paymentMethods.${method}`) }))} />
          </div>
        </div>

        {errorMessage && sales.length > 0 && <div role="alert" className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700"><span>{errorMessage}</span><button type="button" onClick={() => void loadSales()} className="font-bold underline">{t("sales.actions.retry")}</button></div>}

        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-80 items-center justify-center text-xs font-semibold text-slate-500"><LoaderCircle className="mr-2 size-5 animate-spin text-orange-600" />{t("sales.loading")}</div>
          ) : errorMessage && sales.length === 0 ? (
            <div className="flex min-h-80 flex-col items-center justify-center px-6 text-center"><AlertTriangle className="size-6 text-red-500" /><h2 className="mt-3 text-sm font-bold text-slate-900">{t("sales.loadFailed")}</h2><p className="mt-1 text-xs text-slate-500">{errorMessage}</p><button type="button" onClick={() => void loadSales()} className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-xs font-bold text-orange-600"><RefreshCw className="size-3.5" />{t("sales.actions.retry")}</button></div>
          ) : visibleSales.length ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[940px] border-collapse text-left">
                  <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                    <tr><th className="px-5 py-3">{t("sales.table.sale")}</th><th className="px-4 py-3">{t("sales.table.customer")}</th><th className="px-4 py-3">{t("sales.table.date")}</th><th className="px-4 py-3">{t("sales.details.payment")}</th><th className="px-4 py-3">{t("sales.table.value")}</th><th className="px-4 py-3">Status</th><th className="w-16 px-4 py-3 text-center">{t("sales.table.actions")}</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {visibleSales.map((sale) => {
                      const statusStyle = getStatusStyle(sale.status);
                      const StatusIcon = statusStyle.icon;
                      return (
                        <tr key={sale.id} className="transition hover:bg-slate-50">
                          <td className="px-5 py-3.5"><p className="text-xs font-black text-orange-700">{sale.code}</p><p className="mt-1 text-[10px] text-slate-400">{t("sales.table.items", { count: sale.items.reduce((total, item) => total + item.quantity, 0) })}</p></td>
                          <td className="px-4 py-3.5"><p className="max-w-52 truncate text-xs font-bold text-slate-800">{sale.customerName}</p></td>
                          <td className="px-4 py-3.5"><p className="text-xs text-slate-600">{formatDate(sale.createdAt)}</p><p className="mt-1 text-[10px] text-slate-400">{formatTime(sale.createdAt)}</p></td>
                          <td className="px-4 py-3.5 text-xs text-slate-600">{t(`paymentMethods.${sale.paymentMethod}`)}</td>
                          <td className="px-4 py-3.5 text-xs font-black text-slate-900">{formatCurrency(sale.total, locale)}</td>
                          <td className="px-4 py-3.5"><span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${statusStyle.className}`}><StatusIcon className="size-3" />{t(`statuses.${sale.status}`)}</span></td>
                          <td className="px-4 py-3.5 text-center">
                            <details className="relative inline-block text-left">
                              <summary aria-label={t("sales.actionsAria", { code: sale.code })} className="flex size-8 cursor-pointer list-none items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><MoreHorizontal className="size-4" /></summary>
                              <div className="absolute right-0 z-20 mt-1 w-40 rounded-xl border border-slate-200 bg-white p-1.5 text-left shadow-xl">
                                <button type="button" onClick={() => setSelectedSale(sale)} className="flex h-9 w-full items-center gap-2 rounded-lg px-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"><Eye className="size-3.5" />{t("sales.actions.view")}</button>
                                {sale.status === "COMPLETED" && <button type="button" onClick={() => setSaleToReturn(sale)} className="flex h-9 w-full items-center gap-2 rounded-lg px-2.5 text-xs font-semibold text-orange-600 hover:bg-orange-50"><CornerDownLeft className="size-3.5" />{t("sales.actions.return")}</button>}
                                {sale.status === "COMPLETED" && <button type="button" onClick={() => setSaleToCancel(sale)} className="flex h-9 w-full items-center gap-2 rounded-lg px-2.5 text-xs font-semibold text-red-600 hover:bg-red-50"><XCircle className="size-3.5" />{t("sales.actions.cancel")}</button>}
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
                <p className="text-[11px] text-slate-500">{t("sales.table.showing", { shown: visibleSales.length, total: filteredSales.length })}</p>
                <div className="flex items-center gap-2">
                  <PageButton label={t("common.pagination.previous")} disabled={currentPage === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}><ChevronLeft className="size-4" /></PageButton>
                  <span className="min-w-20 text-center text-[11px] font-semibold text-slate-600">{t("common.pagination.page", { page: currentPage, total: totalPages })}</span>
                  <PageButton label={t("common.pagination.next")} disabled={currentPage === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}><ChevronRight className="size-4" /></PageButton>
                </div>
              </div>
            </>
          ) : (
            <div className="flex min-h-80 flex-col items-center justify-center px-6 py-12 text-center">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600"><ReceiptText className="size-5" /></div>
              <h2 className="mt-4 text-sm font-bold text-slate-900">{t("sales.empty.title")}</h2>
              <p className="mt-1 text-xs text-slate-500">{sales.length === 0 ? t("sales.empty.hintFirst") : t("sales.empty.hintFilter")}</p>
              {sales.length === 0 ? <Link href="/vendas?acao=novo" className="mt-4 inline-flex h-10 items-center rounded-xl bg-orange-600 px-4 text-xs font-bold text-white">{t("sales.actions.register")}</Link> : <button type="button" onClick={clearFilters} className="mt-4 h-10 rounded-xl border border-slate-200 px-4 text-xs font-bold text-orange-600 hover:bg-orange-50">{t("sales.actions.clearFilters")}</button>}
            </div>
          )}
        </div>
      </section>

      {selectedSale && <SaleDetails sale={selectedSale} onClose={() => setSelectedSale(null)} />}
      {saleToCancel && <CancelSale sale={saleToCancel} loading={cancelSale.isPending} onCancel={() => setSaleToCancel(null)} onConfirm={(reason) => void confirmCancellation(reason)} />}
      {saleToReturn && <SaleReturnForm sale={saleToReturn} onClose={() => setSaleToReturn(null)} onDone={(message) => toast.success(message)} />}
    </>
  );
}

function SaleDetails({ sale, onClose }: { sale: Sale; onClose: () => void }) {
  const t = useT();
  const { locale } = useI18n();
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-wider text-orange-600">{t("sales.details.title")}</p><h2 className="mt-1 text-lg font-black text-slate-950">Venda {sale.code}</h2><p className="mt-1 text-xs text-slate-500">{sale.customerName} · {formatDate(sale.createdAt)}, {formatTime(sale.createdAt)}</p></div><button type="button" onClick={onClose} aria-label={t("sales.details.close")} className="flex size-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100"><X className="size-4" /></button></div>
        <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
          {sale.items.map((item) => <div key={item.id} className="flex items-center justify-between gap-4 border-b border-slate-100 px-3 py-3 last:border-0"><div><p className="text-xs font-bold text-slate-800">{item.productName}</p><p className="mt-0.5 text-[10px] text-slate-400">{item.quantity} × {formatCurrency(item.unitPrice, locale)}</p></div><p className="text-xs font-black text-slate-900">{formatCurrency(item.subtotal, locale)}</p></div>)}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3"><Info label={t("sales.filters.payment")} value={t(`paymentMethods.${sale.paymentMethod}`)} /><Info label="Total" value={formatCurrency(sale.total, locale)} /></div>
        {sale.status === "CANCELLED" && <div className="mt-3 rounded-xl bg-red-50 p-3 text-xs text-red-700"><strong>Cancelada:</strong> {sale.cancelReason}</div>}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] text-slate-400">{label}</p><p className="mt-1 text-xs font-bold text-slate-800">{value}</p></div>;
}

function CancelSale({ sale, loading, onCancel, onConfirm }: { sale: Sale; loading: boolean; onCancel: () => void; onConfirm: (reason: string) => void }) {
  const t = useT();
  const [reason, setReason] = useState("");
  return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"><div role="alertdialog" aria-modal="true" className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl"><div className="flex size-10 items-center justify-center rounded-xl bg-red-50 text-red-600"><XCircle className="size-4" /></div><h2 className="mt-4 text-base font-black text-slate-950">{t("sales.cancelDialog.title", { code: sale.code })}</h2><p className="mt-2 text-xs leading-5 text-slate-500">{t("sales.cancelDialog.warning")}</p><label htmlFor="cancelReason" className="mt-4 block text-xs font-bold text-slate-700">{t("sales.cancelDialog.reasonLabel")}</label><textarea id="cancelReason" value={reason} onChange={(event) => setReason(event.target.value)} maxLength={500} rows={3} placeholder={t("sales.cancelDialog.reasonPlaceholder")} className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100" /><div className="mt-5 flex justify-end gap-2"><button type="button" disabled={loading} onClick={onCancel} className="h-10 rounded-xl border border-slate-200 px-4 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50">{t("sales.cancelDialog.back")}</button><button type="button" disabled={loading || reason.trim().length < 3} onClick={() => onConfirm(reason)} className="inline-flex h-10 items-center gap-2 rounded-xl bg-red-600 px-4 text-xs font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50">{loading && <LoaderCircle className="size-3.5 animate-spin" />}Cancelar venda</button></div></div></div>;
}

function getStatusStyle(status: SaleStatus) {
  if (status === "COMPLETED") return { className: "bg-green-50 text-green-600", icon: CheckCircle2 };
  return { className: "bg-red-50 text-red-600", icon: XCircle };
}



