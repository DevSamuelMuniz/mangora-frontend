"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, CircleDollarSign, Clock3, Eye, LoaderCircle, MoreHorizontal, PackageCheck, RefreshCw, Search, ShoppingBag, Truck, X, XCircle, type LucideIcon } from "lucide-react";

import { apiRequest } from "@/lib/api/client";
import { paymentMethodLabels, type PaymentMethod } from "@/types/sale";
import { fulfillmentLabels, orderChannelLabels, orderStatusLabels, type Order, type OrderChannel, type OrderStatus } from "@/types/order";

const PAGE_SIZE = 6;
const statuses = Object.keys(orderStatusLabels) as OrderStatus[];
const channels = Object.keys(orderChannelLabels) as OrderChannel[];
const paymentMethods = Object.keys(paymentMethodLabels) as PaymentMethod[];
const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export default function OrderCatalog() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [channel, setChannel] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadOrders = useCallback(async () => {
    try { setLoading(true); setError(""); setOrders(await apiRequest<Order[]>("/orders")); }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Não foi possível carregar os pedidos."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    let mounted = true;
    apiRequest<Order[]>("/orders").then((data) => { if (mounted) setOrders(data); }).catch((requestError: unknown) => { if (mounted) setError(requestError instanceof Error ? requestError.message : "Não foi possível carregar os pedidos."); }).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("pt-BR");
    return orders.filter((order) => (!query || `${order.code} ${order.customerName}`.toLocaleLowerCase("pt-BR").includes(query)) && (status === "all" || order.status === status) && (channel === "all" || order.channel === channel));
  }, [channel, orders, search, status]);
  const active = orders.filter((order) => !["COMPLETED", "CANCELLED"].includes(order.status));
  const todayKey = new Date().toLocaleDateString("en-CA");
  const today = orders.filter((order) => new Date(order.createdAt).toLocaleDateString("en-CA") === todayKey && order.status !== "CANCELLED");
  const delivery = active.filter((order) => order.fulfillment === "DELIVERY");
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const selected = orders.find((order) => order.id === selectedId) ?? null;

  function replaceOrder(order: Order, notice: string) {
    setOrders((current) => current.map((item) => item.id === order.id ? order : item));
    setSelectedId(null);
    setMessage(notice);
  }

  async function updateStatus(order: Order, nextStatus: OrderStatus) {
    try { setActionLoading(true); setError(""); const updated = await apiRequest<Order>(`/orders/${order.id}/status`, { method: "PATCH", body: JSON.stringify({ status: nextStatus }) }); replaceOrder(updated, `${updated.code} atualizado para ${orderStatusLabels[updated.status]}.`); }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Não foi possível atualizar o pedido."); }
    finally { setActionLoading(false); }
  }

  async function cancel(order: Order, reason: string) {
    try { setActionLoading(true); setError(""); const updated = await apiRequest<Order>(`/orders/${order.id}/cancel`, { method: "POST", body: JSON.stringify({ reason }) }); replaceOrder(updated, `${updated.code} cancelado e reserva liberada.`); }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Não foi possível cancelar o pedido."); }
    finally { setActionLoading(false); }
  }

  async function convert(order: Order, paymentMethod: PaymentMethod) {
    try { setActionLoading(true); setError(""); const updated = await apiRequest<Order>(`/orders/${order.id}/convert`, { method: "POST", body: JSON.stringify({ paymentMethod }) }); replaceOrder(updated, `${updated.code} convertido na venda ${updated.sale?.code}.`); }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Não foi possível converter o pedido."); }
    finally { setActionLoading(false); }
  }

  return <>
    <section>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-violet-600">Comercial</p><h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">Pedidos</h1><p className="mt-1 text-xs text-slate-500">Organize solicitações, reservas, retirada e entrega.</p></div><Link href="/pedidos/novo" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 text-sm font-bold text-white"><ShoppingBag className="size-4" />Novo pedido</Link></div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><SummaryCard icon={ShoppingBag} label="Pedidos hoje" value={String(today.length)} iconClassName="bg-violet-50 text-violet-600" /><SummaryCard icon={Clock3} label="Em andamento" value={String(active.length)} iconClassName="bg-amber-50 text-amber-600" /><SummaryCard icon={Truck} label="Aguardando entrega" value={String(delivery.length)} iconClassName="bg-cyan-50 text-cyan-600" /><SummaryCard icon={CircleDollarSign} label="Valor hoje" value={currencyFormatter.format(today.reduce((sum, order) => sum + order.total, 0))} iconClassName="bg-emerald-50 text-emerald-600" /></div>
      {message && <div role="status" className="mt-4 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700"><span>{message}</span><button type="button" onClick={() => setMessage("")} aria-label="Fechar"><X className="size-4" /></button></div>}
      {error && orders.length > 0 && <div role="alert" className="mt-4 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700"><span>{error}</span><button type="button" onClick={() => void loadOrders()} className="underline">Tentar novamente</button></div>}
      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(280px,1fr)_190px_190px]"><label className="relative"><Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input aria-label="Buscar pedidos" type="search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Buscar por código ou cliente..." className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none" /></label><FilterSelect label="Status" value={status} options={statuses.map((value) => ({ value, label: orderStatusLabels[value] }))} onChange={(value) => { setStatus(value); setPage(1); }} /><FilterSelect label="Canal" value={channel} options={channels.map((value) => ({ value, label: orderChannelLabels[value] }))} onChange={(value) => { setChannel(value); setPage(1); }} /></div></div>
      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">{loading ? <div className="flex min-h-80 items-center justify-center text-xs text-slate-500"><LoaderCircle className="mr-2 size-5 animate-spin text-violet-600" />Carregando pedidos...</div> : error && !orders.length ? <div className="flex min-h-80 flex-col items-center justify-center text-center"><AlertTriangle className="size-6 text-red-500" /><p className="mt-3 text-xs text-slate-500">{error}</p><button type="button" onClick={() => void loadOrders()} className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-xs font-bold text-violet-600"><RefreshCw className="size-4" />Tentar novamente</button></div> : visible.length ? <><div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left"><thead className="border-b bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-3">Pedido</th><th className="px-4 py-3">Cliente</th><th className="px-4 py-3">Agendamento</th><th className="px-4 py-3">Canal</th><th className="px-4 py-3">Atendimento</th><th className="px-4 py-3">Valor</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Ações</th></tr></thead><tbody className="divide-y divide-slate-100">{visible.map((order) => { const style = getStatusStyle(order.status); const StatusIcon = style.icon; return <tr key={order.id} className="hover:bg-slate-50"><td className="px-5 py-3.5"><p className="text-xs font-black text-violet-700">{order.code}</p><p className="mt-1 text-[10px] text-slate-400">{order.items.reduce((sum, item) => sum + item.quantity, 0)} item(ns)</p></td><td className="px-4 py-3.5 text-xs font-bold text-slate-800">{order.customerName}</td><td className="px-4 py-3.5 text-xs text-slate-600">{dateFormatter.format(new Date(order.scheduledAt))}</td><td className="px-4 py-3.5 text-xs text-slate-600">{orderChannelLabels[order.channel]}</td><td className="px-4 py-3.5 text-xs text-slate-600">{fulfillmentLabels[order.fulfillment]}</td><td className="px-4 py-3.5 text-xs font-black">{currencyFormatter.format(order.total)}</td><td className="px-4 py-3.5"><span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${style.className}`}><StatusIcon className="size-3" />{orderStatusLabels[order.status]}</span></td><td className="px-4 py-3.5"><details className="relative"><summary aria-label={`Ações do pedido ${order.code}`} className="flex size-8 cursor-pointer list-none items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"><MoreHorizontal className="size-4" /></summary><div className="absolute right-0 z-20 mt-1 w-44 rounded-xl border bg-white p-1.5 shadow-xl"><button type="button" onClick={() => setSelectedId(order.id)} className="flex h-9 w-full items-center gap-2 rounded-lg px-2.5 text-xs font-semibold"><Eye className="size-3.5" />Ver e atualizar</button></div></details></td></tr>; })}</tbody></table></div><div className="flex items-center justify-between border-t px-5 py-3"><p className="text-[11px] text-slate-500">Mostrando {visible.length} de {filtered.length}</p><div className="flex items-center gap-2"><PageButton disabled={currentPage === 1} onClick={() => setPage((value) => value - 1)}><ChevronLeft className="size-4" /></PageButton><span className="text-[11px]">{currentPage} de {totalPages}</span><PageButton disabled={currentPage === totalPages} onClick={() => setPage((value) => value + 1)}><ChevronRight className="size-4" /></PageButton></div></div></> : <div className="flex min-h-80 flex-col items-center justify-center text-center"><ShoppingBag className="size-6 text-slate-300" /><p className="mt-3 text-sm font-bold">Nenhum pedido encontrado</p>{orders.length === 0 && <Link href="/pedidos/novo" className="mt-4 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-bold text-white">Criar pedido</Link>}</div>}</div>
    </section>
    {selected && <OrderDetails order={selected} loading={actionLoading} onClose={() => setSelectedId(null)} onStatus={updateStatus} onCancel={cancel} onConvert={convert} />}
  </>;
}

function OrderDetails({ order, loading, onClose, onStatus, onCancel, onConvert }: { order: Order; loading: boolean; onClose: () => void; onStatus: (order: Order, status: OrderStatus) => Promise<void>; onCancel: (order: Order, reason: string) => Promise<void>; onConvert: (order: Order, method: PaymentMethod) => Promise<void> }) {
  const [reason, setReason] = useState("");
  const [payment, setPayment] = useState<PaymentMethod>("PIX");
  const nextStatus = order.status === "NEW" ? "PREPARING" : order.status === "PREPARING" ? "READY" : null;
  const active = order.status !== "COMPLETED" && order.status !== "CANCELLED";
  return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"><div role="dialog" aria-modal="true" className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl"><div className="flex justify-between"><div><p className="text-[10px] font-bold uppercase text-violet-600">Detalhes do pedido</p><h2 className="mt-1 text-lg font-black">{order.code}</h2><p className="mt-1 text-xs text-slate-500">{order.customerName} · {dateFormatter.format(new Date(order.scheduledAt))}</p></div><button type="button" onClick={onClose} aria-label="Fechar"><X className="size-4" /></button></div><div className="mt-4 grid gap-3 sm:grid-cols-3"><Info label="Canal" value={orderChannelLabels[order.channel]} /><Info label="Atendimento" value={fulfillmentLabels[order.fulfillment]} /><Info label="Total" value={currencyFormatter.format(order.total)} /></div><div className="mt-4 overflow-hidden rounded-xl border">{order.items.map((item) => <div key={item.id} className="flex justify-between border-b p-3 last:border-0"><div><p className="text-xs font-bold">{item.productName}</p><p className="text-[10px] text-slate-400">{item.quantity} × {currencyFormatter.format(item.unitPrice)}</p></div><strong className="text-xs">{currencyFormatter.format(item.subtotal)}</strong></div>)}</div>{order.notes && <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">{order.notes}</p>}{order.sale && <Link href={`/vendas?selecionada=${order.sale.id}`} className="mt-4 block rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-700">Venda gerada: {order.sale.code} · {currencyFormatter.format(order.sale.total)}</Link>}{active && <div className="mt-4 space-y-3 border-t pt-4">{nextStatus && <button type="button" disabled={loading} onClick={() => void onStatus(order, nextStatus)} className="h-10 w-full rounded-xl border border-violet-200 bg-violet-50 text-xs font-bold text-violet-700 disabled:opacity-50">{nextStatus === "PREPARING" ? "Iniciar preparação" : "Marcar como pronto"}</button>}<div className="grid gap-2 sm:grid-cols-[1fr_auto]"><select value={payment} onChange={(event) => setPayment(event.target.value as PaymentMethod)} className="h-10 rounded-xl border px-3 text-xs">{paymentMethods.map((method) => <option key={method} value={method}>{paymentMethodLabels[method]}</option>)}</select><button type="button" disabled={loading} onClick={() => void onConvert(order, payment)} className="h-10 rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white disabled:opacity-50">Converter em venda</button></div><div className="grid gap-2 sm:grid-cols-[1fr_auto]"><input value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Motivo do cancelamento" className="h-10 rounded-xl border px-3 text-xs" /><button type="button" disabled={loading || reason.trim().length < 3} onClick={() => void onCancel(order, reason)} className="h-10 rounded-xl bg-red-600 px-4 text-xs font-bold text-white disabled:opacity-50">Cancelar pedido</button></div>{loading && <p className="flex items-center justify-center text-xs text-slate-500"><LoaderCircle className="mr-2 size-4 animate-spin" />Processando...</p>}</div>}</div></div>;
}

function SummaryCard({ icon: Icon, label, value, iconClassName }: { icon: LucideIcon; label: string; value: string; iconClassName: string }) { return <article className="flex items-center gap-3 rounded-2xl border bg-white p-4 shadow-sm"><div className={`flex size-9 items-center justify-center rounded-xl ${iconClassName}`}><Icon className="size-4" /></div><div><p className="text-[10px] text-slate-400">{label}</p><p className="text-lg font-black">{value}</p></div></article>; }
function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (value: string) => void }) { return <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} className="h-11 rounded-xl border bg-slate-50 px-3 text-xs"><option value="all">{label}: todos</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>; }
function PageButton({ disabled, onClick, children }: { disabled: boolean; onClick: () => void; children: ReactNode }) { return <button type="button" disabled={disabled} onClick={onClick} className="flex size-9 items-center justify-center rounded-xl border disabled:opacity-40">{children}</button>; }
function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] text-slate-400">{label}</p><p className="mt-1 text-xs font-bold">{value}</p></div>; }
function getStatusStyle(status: OrderStatus) { if (status === "COMPLETED") return { className: "bg-emerald-50 text-emerald-600", icon: CheckCircle2 }; if (status === "READY") return { className: "bg-cyan-50 text-cyan-600", icon: PackageCheck }; if (status === "CANCELLED") return { className: "bg-red-50 text-red-600", icon: XCircle }; if (status === "PREPARING") return { className: "bg-amber-50 text-amber-600", icon: Clock3 }; return { className: "bg-violet-50 text-violet-600", icon: ShoppingBag }; }
