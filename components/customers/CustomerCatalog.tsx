"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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
import { formatCurrency, formatDate, formatDocument, formatPhone } from "@/lib/format";
import { useCustomers, useDeleteCustomer } from "@/features/customers/hooks/useCustomers";
import { FilterSelect } from "@/components/shared/FilterSelect";
import { PageButton } from "@/components/shared/PageButton";
import { SummaryCard } from "@/components/shared/SummaryCard";

const PAGE_SIZE = 6;
type StatusFilter = "all" | "active" | "inactive";

export default function CustomerCatalog() {
  const { data: customers = [], isLoading: loading, error, refetch: loadCustomers } = useCustomers();
  const deleteCustomer = useDeleteCustomer();
  const [actionError, setActionError] = useState("");
  const [search, setSearch] = useState("");
  const [type, setType] = useState<"all" | CustomerType>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

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
      setActionError(requestError instanceof Error ? requestError.message : "Não foi possível excluir o cliente.");
    }
  }

  return (
    <>
      <section>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-orange-600">Relacionamento</p><h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Clientes</h1><p className="mt-1 text-xs text-slate-500">Consulte contatos e acompanhe o histórico da sua base.</p></div>
          <Link href="/clientes?acao=novo" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 px-4 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:shadow-xl"><UserPlus className="size-4" />Novo cliente</Link>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <SummaryCard icon={Users} label="Total de clientes" value={String(customers.length)} iconClassName="bg-orange-50 text-orange-600" />
          <SummaryCard icon={UserRoundCheck} label="Clientes ativos" value={String(activeCustomers)} iconClassName="bg-green-50 text-green-600" />
          <SummaryCard icon={Building2} label="Pessoas jurídicas" value={String(companyCustomers)} iconClassName="bg-yellow-50 text-yellow-600" />
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(280px,1fr)_200px_170px]">
            <label className="relative"><span className="sr-only">Buscar clientes</span><Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input type="search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Buscar por nome, documento ou contato..." className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100" /></label>
            <FilterSelect label="Tipo" value={type} onChange={(value) => { setType(value as "all" | CustomerType); setPage(1); }} options={[{ value: "INDIVIDUAL", label: "Pessoa física" }, { value: "COMPANY", label: "Pessoa jurídica" }]} />
            <FilterSelect label="Status" value={status} onChange={(value) => { setStatus(value as StatusFilter); setPage(1); }} options={[{ value: "active", label: "Ativos" }, { value: "inactive", label: "Inativos" }]} />
          </div>
        </div>

        {errorMessage && customers.length > 0 && <div role="alert" className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700"><span>{errorMessage}</span><button type="button" onClick={() => void loadCustomers()} className="shrink-0 font-bold underline">Tentar novamente</button></div>}

        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-80 items-center justify-center text-slate-500"><LoaderCircle className="size-5 animate-spin text-orange-600" /><span className="ml-2 text-xs font-semibold">Carregando clientes...</span></div>
          ) : errorMessage && customers.length === 0 ? (
            <div className="flex min-h-80 flex-col items-center justify-center px-6 py-12 text-center"><div className="flex size-12 items-center justify-center rounded-2xl bg-red-50 text-red-600"><AlertTriangle className="size-5" /></div><h2 className="mt-4 text-sm font-bold text-slate-900">Não foi possível carregar os clientes</h2><p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">{errorMessage}</p><button type="button" onClick={() => void loadCustomers()} className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-xs font-bold text-orange-600 hover:bg-orange-50"><RefreshCw className="size-3.5" />Tentar novamente</button></div>
          ) : visibleCustomers.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] border-collapse text-left">
                  <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500"><tr><th className="px-5 py-3">Cliente</th><th className="px-4 py-3">Contato</th><th className="px-4 py-3">Última compra</th><th className="px-4 py-3">Total comprado</th><th className="px-4 py-3">Status</th><th className="w-16 px-4 py-3 text-center">Ações</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {visibleCustomers.map((customer) => (
                      <tr key={customer.id} className="transition hover:bg-slate-50">
                        <td className="px-5 py-3.5"><div className="flex items-center gap-3"><div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-yellow-50 text-xs font-black text-orange-700">{getInitials(customer.name)}</div><div className="min-w-0"><p className="max-w-64 truncate text-xs font-bold text-slate-800">{customer.tradeName || customer.name}</p><p className="mt-1 text-[10px] text-slate-400">{formatDocument(customer.document, customer.type)} · {customer.type === "INDIVIDUAL" ? "Pessoa física" : "Pessoa jurídica"}</p></div></div></td>
                        <td className="px-4 py-3.5"><p className="max-w-52 truncate text-xs font-semibold text-slate-700">{customer.email}</p><p className="mt-1 text-[10px] text-slate-400">{formatPhone(customer.phone)}</p></td>
                        <td className="px-4 py-3.5 text-xs text-slate-600">{customer.lastPurchaseAt ? formatDate(new Date(customer.lastPurchaseAt)) : "Nunca"}</td>
                        <td className="px-4 py-3.5 text-xs font-bold text-slate-800">{formatCurrency(customer.totalSpent)}</td>
                        <td className="px-4 py-3.5"><span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${customer.active ? "bg-green-50 text-green-600" : "bg-slate-100 text-slate-500"}`}>{customer.active ? "Ativo" : "Inativo"}</span></td>
                        <td className="px-4 py-3.5 text-center"><details className="relative inline-block text-left"><summary aria-label={`Ações do cliente ${customer.name}`} className="flex size-8 cursor-pointer list-none items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><MoreHorizontal className="size-4" /></summary><div className="absolute right-0 z-20 mt-1 w-36 rounded-xl border border-slate-200 bg-white p-1.5 text-left shadow-xl"><button type="button" onClick={() => setSelectedCustomer(customer)} className="flex h-9 w-full items-center gap-2 rounded-lg px-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"><Eye className="size-3.5" />Visualizar</button><Link href={`/clientes?acao=editar&id=${customer.id}`} className="flex h-9 w-full items-center gap-2 rounded-lg px-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"><Pencil className="size-3.5" />Editar</Link><button type="button" onClick={() => setCustomerToDelete(customer)} className="flex h-9 w-full items-center gap-2 rounded-lg px-2.5 text-xs font-semibold text-red-600 hover:bg-red-50"><Trash2 className="size-3.5" />Excluir</button></div></details></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5"><p className="text-[11px] text-slate-500">Mostrando {visibleCustomers.length} de {filteredCustomers.length} cliente(s)</p><div className="flex items-center gap-2"><PageButton label="Página anterior" disabled={currentPage === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}><ChevronLeft className="size-4" /></PageButton><span className="min-w-20 text-center text-[11px] font-semibold text-slate-600">Página {currentPage} de {totalPages}</span><PageButton label="Próxima página" disabled={currentPage === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}><ChevronRight className="size-4" /></PageButton></div></div>
            </>
          ) : (
            <div className="flex min-h-80 flex-col items-center justify-center px-6 py-12 text-center"><div className="flex size-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600"><UserRoundX className="size-5" /></div><h2 className="mt-4 text-sm font-bold text-slate-900">Nenhum cliente encontrado</h2><p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">{customers.length === 0 ? "Cadastre o primeiro cliente para começar sua base." : "Ajuste os filtros para visualizar sua base."}</p>{customers.length === 0 ? <Link href="/clientes?acao=novo" className="mt-4 inline-flex h-10 items-center rounded-xl bg-orange-600 px-4 text-xs font-bold text-white">Cadastrar cliente</Link> : <button type="button" onClick={clearFilters} className="mt-4 h-10 rounded-xl border border-slate-200 px-4 text-xs font-bold text-orange-600 transition hover:bg-orange-50">Limpar filtros</button>}</div>
          )}
        </div>
      </section>

      {selectedCustomer && <CustomerDetails customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} />}
      {customerToDelete && <DeleteCustomer customer={customerToDelete} loading={deleteCustomer.isPending} onCancel={() => setCustomerToDelete(null)} onConfirm={() => void confirmDelete()} />}
    </>
  );
}

function CustomerDetails({ customer, onClose }: { customer: Customer; onClose: () => void }) {
  const location = [customer.street, customer.number, customer.district, customer.city, customer.state].filter(Boolean).join(", ") || "Não informado";
  const details = [["Documento", formatDocument(customer.document, customer.type)], ["Tipo", customer.type === "INDIVIDUAL" ? "Pessoa física" : "Pessoa jurídica"], ["E-mail", customer.email], ["Telefone", formatPhone(customer.phone)], ["Endereço", location], ["CEP", customer.postalCode ? customer.postalCode.replace(/^(\d{5})(\d{3})$/, "$1-$2") : "Não informado"], ["Total comprado", formatCurrency(customer.totalSpent)], ["Última compra", customer.lastPurchaseAt ? formatDate(new Date(customer.lastPurchaseAt)) : "Nunca"]];
  return <div onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }} className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"><div role="dialog" aria-modal="true" className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-wider text-orange-600">Detalhes do cliente</p><h2 className="mt-1 text-lg font-black text-slate-950">{customer.tradeName || customer.name}</h2>{customer.tradeName && <p className="mt-1 text-xs text-slate-500">{customer.name}</p>}</div><button type="button" onClick={onClose} aria-label="Fechar detalhes" className="flex size-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100"><X className="size-4" /></button></div><dl className="mt-5 grid gap-3 sm:grid-cols-2">{details.map(([label, value]) => <div key={label} className="min-w-0 rounded-xl bg-slate-50 p-3"><dt className="text-[10px] font-semibold text-slate-400">{label}</dt><dd className="mt-1 break-words text-xs font-bold text-slate-800">{value}</dd></div>)}</dl>{customer.notes && <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">{customer.notes}</p>}<div className="mt-5 flex justify-end"><Link href={`/clientes?acao=editar&id=${customer.id}`} className="inline-flex h-10 items-center gap-2 rounded-xl bg-orange-600 px-4 text-xs font-bold text-white"><Pencil className="size-3.5" />Editar cliente</Link></div></div></div>;
}

function DeleteCustomer({ customer, loading, onCancel, onConfirm }: { customer: Customer; loading: boolean; onCancel: () => void; onConfirm: () => void }) {
  return <div onMouseDown={(event) => { if (!loading && event.target === event.currentTarget) onCancel(); }} className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"><div role="alertdialog" aria-modal="true" className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl"><div className="flex size-10 items-center justify-center rounded-xl bg-red-50 text-red-600"><Trash2 className="size-4" /></div><h2 className="mt-4 text-base font-black text-slate-950">Excluir cliente?</h2><p className="mt-2 text-xs leading-5 text-slate-500">O cliente <strong className="text-slate-700">{customer.name}</strong> será removido permanentemente da empresa.</p><div className="mt-5 flex justify-end gap-2"><button type="button" disabled={loading} onClick={onCancel} className="h-10 rounded-xl border border-slate-200 px-4 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-60">Cancelar</button><button type="button" disabled={loading} onClick={onConfirm} className="inline-flex h-10 items-center gap-2 rounded-xl bg-red-600 px-4 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-60">{loading && <LoaderCircle className="size-3.5 animate-spin" />}{loading ? "Excluindo..." : "Excluir"}</button></div></div></div>;
}

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}
