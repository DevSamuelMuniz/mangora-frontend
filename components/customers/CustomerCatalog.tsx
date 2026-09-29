"use client";

import { useFormatters } from "@/i18n/provider";

import Link from "next/link";
import { useI18n, useT } from "@/i18n/provider";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Building2,
  ChevronLeft,
  ChevronRight,
  Eye,
  LoaderCircle,
  MoreHorizontal,
  Pencil,
  RefreshCw,
  Search,
  Trash2,
  UserPlus,
  Users,
  UserRoundCheck,
  UserRoundX,
  X,
} from "lucide-react";

import type { Customer, CustomerType } from "@/types/customer";
import { formatDocument, formatPhone } from "@/lib/format";
import { useCustomers, useDeleteCustomer } from "@/features/customers/hooks/useCustomers";
import { FilterSelect } from "@/components/shared/FilterSelect";
import { PageButton } from "@/components/shared/PageButton";
import { SummaryCard } from "@/components/shared/SummaryCard";

const PAGE_SIZE = 6;
type StatusFilter = "all" | "active" | "inactive";

export default function CustomerCatalog() {
  const { formatDate, formatCurrency } = useFormatters();
  const t = useT();
  const { locale } = useI18n();
  const { data: customers = [], isLoading: loading, error, refetch: loadCustomers } = useCustomers();
  const deleteCustomer = useDeleteCustomer();
  const [actionError, setActionError] = useState("");
  const [search, setSearch] = useState("");
  const [type, setType] = useState<"all" | CustomerType>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const closeCustomerDetails = useCallback(() => setSelectedCustomer(null), []);

  const errorMessage = actionError || (error instanceof Error ? error.message : "");

  const filteredCustomers = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");
    return customers.filter((customer) => {
      const searchable = [customer.name, customer.tradeName, customer.document, customer.email, customer.phone].filter(Boolean).join(" ").toLocaleLowerCase("pt-BR");
      const matchesType = type === "all" || customer.type === type;
      const matchesStatus = status === "all" || (status === "active" ? customer.active : !customer.active);
      return (!normalizedSearch || searchable.includes(normalizedSearch)) && matchesType && matchesStatus;
    });
  }, [customers, search, status, type]);

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleCustomers = filteredCustomers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const activeCustomers = customers.filter((customer) => customer.active).length;
  const companyCustomers = customers.filter((customer) => customer.type === "COMPANY").length;

  function clearFilters() {
    setSearch("");
    setType("all");
    setStatus("all");
    setPage(1);
  }

  async function confirmDelete() {
    if (!customerToDelete) return;
    try {
      setActionError("");
      await deleteCustomer.mutateAsync({ id: customerToDelete.id });
      setSelectedCustomer((current) => (current?.id === customerToDelete.id ? null : current));
      setCustomerToDelete(null);
    } catch (requestError) {
      setActionError(requestError instanceof Error ? requestError.message : t("customers.deleteFailed"));
    }
  }

  return (
    <>
      <section>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-orange-600">{t("customers.details.relationship")}</p><h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{t("customers.title")}</h1><p className="mt-1 text-xs text-slate-500">{t("customers.subtitle")}</p></div>
          <Link href="/clientes?acao=novo" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 px-4 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:shadow-xl"><UserPlus className="size-4" />Novo cliente</Link>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <SummaryCard icon={Users} label={t("customers.metrics.total")} value={String(customers.length)} iconClassName="bg-orange-50 text-orange-600" />
          <SummaryCard icon={UserRoundCheck} label={t("customers.metrics.active")} value={String(activeCustomers)} iconClassName="bg-green-50 text-green-600" />
          <SummaryCard icon={Building2} label={t("customers.types.COMPANY_PLURAL")} value={String(companyCustomers)} iconClassName="bg-yellow-50 text-yellow-600" />
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(280px,1fr)_200px_170px]">
            <label className="relative"><span className="sr-only">Buscar clientes</span><Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input type="search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Buscar por nome, documento ou contato..." className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100" /></label>
            <FilterSelect label="Tipo" value={type} onChange={(value) => { setType(value as "all" | CustomerType); setPage(1); }} options={[{ value: "INDIVIDUAL", label: t("customers.types.INDIVIDUAL") }, { value: "COMPANY", label: t("customers.types.COMPANY") }]} />
            <FilterSelect label={t("customers.filters.status")} value={status} onChange={(value) => { setStatus(value as StatusFilter); setPage(1); }} options={[{ value: "active", label: t("customers.filters.active") }, { value: "inactive", label: t("customers.filters.inactive") }]} />
          </div>
        </div>

        {errorMessage && customers.length > 0 && <div role="alert" className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700"><span>{errorMessage}</span><button type="button" onClick={() => void loadCustomers()} className="shrink-0 font-bold underline">{t("customers.actions.retry")}</button></div>}

        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-80 items-center justify-center text-slate-500"><LoaderCircle className="size-5 animate-spin text-orange-600" /><span className="ml-2 text-xs font-semibold">{t("customers.loading")}</span></div>
          ) : errorMessage && customers.length === 0 ? (
            <div className="flex min-h-80 flex-col items-center justify-center px-6 py-12 text-center"><div className="flex size-12 items-center justify-center rounded-2xl bg-red-50 text-red-600"><AlertTriangle className="size-5" /></div><h2 className="mt-4 text-sm font-bold text-slate-900">{t("customers.loadFailed")}</h2><p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">{errorMessage}</p><button type="button" onClick={() => void loadCustomers()} className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-xs font-bold text-orange-600 hover:bg-orange-50"><RefreshCw className="size-3.5" />{t("customers.actions.retry")}</button></div>
          ) : visibleCustomers.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] border-collapse text-left">
                  <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500"><tr><th className="px-5 py-3">{t("customers.table.customer")}</th><th className="px-4 py-3">{t("customers.table.contact")}</th><th className="px-4 py-3">{t("customers.table.lastPurchase")}</th><th className="px-4 py-3">{t("customers.table.totalSpent")}</th><th className="px-4 py-3">Status</th><th className="w-16 px-4 py-3 text-center">{t("customers.table.actions")}</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {visibleCustomers.map((customer) => (
                      <tr key={customer.id} onClick={() => setSelectedCustomer(customer)} className="group cursor-pointer transition hover:bg-orange-50/60">
                        <td className="px-5 py-3.5"><div className="flex items-center gap-3"><div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-yellow-50 text-xs font-black text-orange-700">{getInitials(customer.name)}</div><div className="min-w-0"><button type="button" aria-label={`${t("customers.details.open")}: ${customer.name}`} className="max-w-64 truncate text-left text-xs font-bold text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400">{customer.tradeName || customer.name}</button><p className="mt-1 text-[10px] text-slate-400">{formatDocument(customer.document, customer.type)} · {customer.type === "INDIVIDUAL" ? t("customers.types.INDIVIDUAL") : t("customers.types.COMPANY")}</p></div><Eye className="ml-auto size-4 shrink-0 text-slate-300 opacity-0 transition group-hover:opacity-100" /></div></td>
                        <td className="px-4 py-3.5"><p className="max-w-52 truncate text-xs font-semibold text-slate-700">{customer.email}</p><p className="mt-1 text-[10px] text-slate-400">{formatPhone(customer.phone)}</p></td>
                        <td className="px-4 py-3.5 text-xs text-slate-600">{customer.lastPurchaseAt ? formatDate(new Date(customer.lastPurchaseAt)) : "Nunca"}</td>
                        <td className="px-4 py-3.5 text-xs font-bold text-slate-800">{formatCurrency(customer.totalSpent, locale)}</td>
                        <td className="px-4 py-3.5"><span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${customer.active ? "bg-green-50 text-green-600" : "bg-slate-100 text-slate-500"}`}>{customer.active ? "Ativo" : "Inativo"}</span></td>
                        <td className="px-4 py-3.5 text-center" onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}><details className="relative inline-block text-left"><summary aria-label={`Ações do cliente ${customer.name}`} className="flex size-8 cursor-pointer list-none items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><MoreHorizontal className="size-4" /></summary><div className="absolute right-0 z-20 mt-1 w-36 rounded-xl border border-slate-200 bg-white p-1.5 text-left shadow-xl"><button type="button" onClick={() => setSelectedCustomer(customer)} className="flex h-9 w-full items-center gap-2 rounded-lg px-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"><Eye className="size-3.5" />{t("customers.details.open")}</button><Link href={`/clientes?acao=editar&id=${customer.id}`} className="flex h-9 w-full items-center gap-2 rounded-lg px-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"><Pencil className="size-3.5" />{t("customers.actions.edit")}</Link><button type="button" onClick={() => setCustomerToDelete(customer)} className="flex h-9 w-full items-center gap-2 rounded-lg px-2.5 text-xs font-semibold text-red-600 hover:bg-red-50"><Trash2 className="size-3.5" />{t("customers.deleteDialog.confirm")}</button></div></details></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5"><p className="text-[11px] text-slate-500">Mostrando {visibleCustomers.length} de {filteredCustomers.length} cliente(s)</p><div className="flex items-center gap-2"><PageButton label={t("customers.pagination.previous")} disabled={currentPage === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}><ChevronLeft className="size-4" /></PageButton><span className="min-w-20 text-center text-[11px] font-semibold text-slate-600">{t("customers.pagination.page", { current: currentPage, total: totalPages })}</span><PageButton label={t("customers.pagination.next")} disabled={currentPage === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}><ChevronRight className="size-4" /></PageButton></div></div>
            </>
          ) : (
            <div className="flex min-h-80 flex-col items-center justify-center px-6 py-12 text-center"><div className="flex size-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600"><UserRoundX className="size-5" /></div><h2 className="mt-4 text-sm font-bold text-slate-900">{t("customers.empty.title")}</h2><p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">{customers.length === 0 ? t("customers.empty.hintFirst") : t("customers.empty.hint")}</p>{customers.length === 0 ? <Link href="/clientes?acao=novo" className="mt-4 inline-flex h-10 items-center rounded-xl bg-orange-600 px-4 text-xs font-bold text-white">{t("customers.actions.create")}</Link> : <button type="button" onClick={clearFilters} className="mt-4 h-10 rounded-xl border border-slate-200 px-4 text-xs font-bold text-orange-600 transition hover:bg-orange-50">{t("customers.actions.clearFilters")}</button>}</div>
          )}
        </div>
      </section>

      {selectedCustomer && <CustomerDetails customer={selectedCustomer} onClose={closeCustomerDetails} />}
      {customerToDelete && <DeleteCustomer customer={customerToDelete} loading={deleteCustomer.isPending} onCancel={() => setCustomerToDelete(null)} onConfirm={() => void confirmDelete()} />}
    </>
  );
}

function CustomerDetails({ customer, onClose }: { customer: Customer; onClose: () => void }) {
  const { formatCurrency, formatDate } = useFormatters();
  const t = useT();
  const { locale } = useI18n();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const location = [customer.street, customer.number, customer.district, customer.city, customer.state].filter(Boolean).join(", ") || t("customers.details.notInformed");
  const details = [
    [t("customers.details.fields.document"), formatDocument(customer.document, customer.type)],
    [t("customers.details.fields.type"), customer.type === "INDIVIDUAL" ? t("customers.types.INDIVIDUAL") : t("customers.types.COMPANY")],
    [t("customers.details.fields.email"), customer.email],
    [t("customers.details.fields.phone"), formatPhone(customer.phone)],
    [t("customers.details.fields.address"), location],
    [t("customers.details.fields.postalCode"), customer.postalCode ? customer.postalCode.replace(/^(\d{5})(\d{3})$/, "$1-$2") : t("customers.details.notInformed")],
  ];

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [onClose]);

  return (
    <div onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }} className="fixed inset-0 z-[70] flex justify-end bg-slate-950/40 backdrop-blur-sm">
      <aside ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="customer-details-title" tabIndex={-1} className="customer-drawer-enter flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
        <header className="relative overflow-hidden bg-[#173d2b] px-5 pb-6 pt-5 text-white sm:px-7 sm:pt-7">
          <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-20 size-56 rounded-full border-[30px] border-white/[.05]" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3.5">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-sm font-black text-orange-200 ring-1 ring-white/15">{getInitials(customer.tradeName || customer.name)}</span>
              <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[.15em] text-orange-200">{t("customers.details.title")}</p><h2 id="customer-details-title" className="mt-1 truncate text-lg font-black sm:text-xl">{customer.tradeName || customer.name}</h2>{customer.tradeName && <p className="mt-0.5 truncate text-xs text-white/65">{customer.name}</p>}</div>
            </div>
            <button ref={closeRef} type="button" onClick={onClose} aria-label={t("customers.details.close")} className="flex size-10 shrink-0 items-center justify-center rounded-xl text-white/70 transition hover:bg-white/10 hover:text-white"><X className="size-4.5" /></button>
          </div>
          <div className="relative mt-5 flex items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${customer.active ? "bg-emerald-300/15 text-emerald-100" : "bg-white/10 text-white/70"}`}>{customer.active ? t("customers.status.active") : t("customers.status.inactive")}</span><span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-white/75">{customer.type === "INDIVIDUAL" ? t("customers.types.INDIVIDUAL") : t("customers.types.COMPANY")}</span></div>
        </header>

        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7 sm:py-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-orange-100 bg-orange-50/60 p-4"><p className="text-[10px] font-semibold text-orange-800/70">{t("customers.details.totalSpent")}</p><p className="mt-1.5 truncate text-lg font-black tabular-nums text-[#173d2b]">{formatCurrency(customer.totalSpent, locale)}</p></div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-[10px] font-semibold text-slate-500">{t("customers.details.fields.lastPurchase")}</p><p className="mt-1.5 truncate text-sm font-black text-slate-800">{customer.lastPurchaseAt ? formatDate(new Date(customer.lastPurchaseAt)) : t("customers.details.never")}</p></div>
          </div>
          <section className="mt-6"><h3 className="text-xs font-black text-slate-900">{t("customers.details.relationship")}</h3><dl className="mt-3 grid gap-2.5 sm:grid-cols-2">{details.map(([label, value]) => <div key={label} className="min-w-0 rounded-xl border border-slate-100 bg-white p-3.5"><dt className="text-[10px] font-semibold text-slate-400">{label}</dt><dd className="mt-1.5 break-words text-xs font-bold leading-5 text-slate-800">{value || t("customers.details.notInformed")}</dd></div>)}</dl></section>
          {customer.notes && <section className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4"><h3 className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{t("customers.details.notes")}</h3><p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-slate-700">{customer.notes}</p></section>}
        </div>

        <footer className="border-t border-slate-100 bg-white px-5 py-4 sm:px-7"><Link href={`/clientes?acao=editar&id=${customer.id}`} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 text-xs font-bold text-white shadow-sm transition hover:bg-orange-700"><Pencil className="size-3.5" />{t("customers.actions.edit")}</Link></footer>
      </aside>
    </div>
  );
}

function DeleteCustomer({ customer, loading, onCancel, onConfirm }: { customer: Customer; loading: boolean; onCancel: () => void; onConfirm: () => void }) {
  const t = useT();
  return <div onMouseDown={(event) => { if (!loading && event.target === event.currentTarget) onCancel(); }} className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"><div role="alertdialog" aria-modal="true" className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl"><div className="flex size-10 items-center justify-center rounded-xl bg-red-50 text-red-600"><Trash2 className="size-4" /></div><h2 className="mt-4 text-base font-black text-slate-950">{t("customers.deleteDialog.title")}</h2><p className="mt-2 text-xs leading-5 text-slate-500">O cliente <strong className="text-slate-700">{customer.name}</strong> será removido permanentemente da empresa.</p><div className="mt-5 flex justify-end gap-2"><button type="button" disabled={loading} onClick={onCancel} className="h-10 rounded-xl border border-slate-200 px-4 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-60">Cancelar</button><button type="button" disabled={loading} onClick={onConfirm} className="inline-flex h-10 items-center gap-2 rounded-xl bg-red-600 px-4 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-60">{loading && <LoaderCircle className="size-3.5 animate-spin" />}{loading ? t("customers.deleteDialog.deleting") : "Excluir"}</button></div></div></div>;
}

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}
