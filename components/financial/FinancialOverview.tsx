"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Eye,
  LoaderCircle,
  MoreHorizontal,
  Plus,
  ReceiptText,
  RefreshCw,
  Search,
  WalletCards,
  X,
  XCircle,
  type LucideIcon,
} from "lucide-react";

import { apiRequest } from "@/lib/api/client";
import { financialStatusLabels, financialTypeLabels, type FinancialEntry, type FinancialEntryStatus, type FinancialOverview as FinancialOverviewData } from "@/types/financial";

const PAGE_SIZE = 7;
const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default function FinancialOverview() {
  const [entries, setEntries] = useState<FinancialEntry[]>([]);
  const [cashFlow, setCashFlow] = useState<FinancialOverviewData["cashFlow"]>([]);
  const [summary, setSummary] = useState<FinancialOverviewData["summary"]>({ balance: 0, paidIncome: 0, paidExpense: 0, receivable: 0, payable: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(false);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedEntry, setSelectedEntry] = useState<FinancialEntry | null>(null);
  const [entryToPay, setEntryToPay] = useState<FinancialEntry | null>(null);

  const applyOverview = useCallback((data: FinancialOverviewData) => {
    setEntries(data.entries);
    setSummary(data.summary);
    setCashFlow(data.cashFlow);
  }, []);

  const loadEntries = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      applyOverview(await apiRequest<FinancialOverviewData>("/financial"));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível carregar o financeiro.");
    } finally { setLoading(false); }
  }, [applyOverview]);

  useEffect(() => {
    let mounted = true;
    apiRequest<FinancialOverviewData>("/financial")
      .then((data) => { if (mounted) applyOverview(data); })
      .catch((requestError: unknown) => { if (mounted) setError(requestError instanceof Error ? requestError.message : "Não foi possível carregar o financeiro."); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [applyOverview]);

  const filteredEntries = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");
    return entries.filter((entry) => {
      const content = `${entry.id} ${entry.description} ${entry.contact} ${entry.category}`.toLocaleLowerCase("pt-BR");
      return (!normalizedSearch || content.includes(normalizedSearch)) && (type === "all" || entry.type === type) && (status === "all" || entry.displayStatus === status);
    });
  }, [entries, search, status, type]);

  const pendingEntries = entries.filter((entry) => entry.displayStatus === "PENDING" || entry.displayStatus === "OVERDUE").slice(0, 5);
  const chartMaximum = Math.max(1, ...cashFlow.flatMap((item) => [item.income, item.expense]));
  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleEntries = filteredEntries.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function clearFilters() {
    setSearch("");
    setType("all");
    setStatus("all");
    setPage(1);
  }

  async function confirmPayment() {
    if (!entryToPay) return;
    try {
      setPaying(true);
      setError("");
      await apiRequest(`/financial/${entryToPay.id}/pay`, { method: "PATCH", body: JSON.stringify({}) });
      setEntryToPay(null);
      await loadEntries();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível confirmar o pagamento.");
    } finally { setPaying(false); }
  }

  return (
    <>
      <section>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-violet-600">Gestão financeira</p><h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Financeiro</h1><p className="mt-1 text-xs text-slate-500">Acompanhe receitas, despesas e compromissos.</p></div>
          <Link href="/financeiro/novo" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-xl"><Plus className="size-4" />Novo lançamento</Link>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard icon={WalletCards} label="Saldo realizado" value={currencyFormatter.format(summary.balance)} description="Receitas menos despesas pagas" iconClassName="bg-violet-50 text-violet-600" />
          <SummaryCard icon={ArrowUpRight} label="Receitas realizadas" value={currencyFormatter.format(summary.paidIncome)} description="Entradas confirmadas" iconClassName="bg-emerald-50 text-emerald-600" />
          <SummaryCard icon={CircleDollarSign} label="Contas a receber" value={currencyFormatter.format(summary.receivable)} description="Receitas pendentes" iconClassName="bg-cyan-50 text-cyan-600" />
          <SummaryCard icon={ArrowDownRight} label="Contas a pagar" value={currencyFormatter.format(summary.payable)} description="Despesas pendentes ou vencidas" iconClassName="bg-amber-50 text-amber-600" />
        </div>

        <div className="mt-4 grid items-stretch gap-4 xl:grid-cols-[1.3fr_0.7fr]">
          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center justify-between gap-4"><div className="flex items-center gap-3"><div className="flex size-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600"><BarChart3 className="size-4" /></div><div><h2 className="text-sm font-bold text-slate-950">Fluxo de caixa</h2><p className="mt-0.5 text-[10px] text-slate-400">Receitas e despesas dos últimos 6 meses</p></div></div><div className="hidden items-center gap-3 text-[9px] sm:flex"><Legend color="bg-violet-600" label="Receitas" /><Legend color="bg-cyan-400" label="Despesas" /></div></div>
            <div className="mt-6 flex h-48 items-end gap-3 sm:gap-5">
              {cashFlow.map((item) => <div key={item.key} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><div className="flex h-full w-full items-end justify-center gap-1"><div title={currencyFormatter.format(item.income)} className="w-full max-w-5 rounded-t-md bg-violet-600" style={{ height: `${Math.max(item.income ? 3 : 0, item.income / chartMaximum * 100)}%` }} /><div title={currencyFormatter.format(item.expense)} className="w-full max-w-5 rounded-t-md bg-cyan-400" style={{ height: `${Math.max(item.expense ? 3 : 0, item.expense / chartMaximum * 100)}%` }} /></div><span className="text-[9px] font-semibold capitalize text-slate-400">{item.month}</span></div>)}
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-4 py-4 sm:px-5"><h2 className="text-sm font-bold text-slate-950">Próximos compromissos</h2><p className="mt-0.5 text-[10px] text-slate-400">Contas pendentes e vencidas</p></div>
            <div className="divide-y divide-slate-100">
              {pendingEntries.length ? pendingEntries.map((entry) => <div key={entry.id} className="flex items-center gap-3 px-4 py-3 sm:px-5"><div className={`flex size-8 shrink-0 items-center justify-center rounded-xl ${entry.displayStatus === "OVERDUE" ? "bg-red-50 text-red-600" : entry.type === "INCOME" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>{entry.type === "INCOME" ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-slate-800">{entry.description}</p><p className="mt-1 text-[9px] text-slate-400">Vence em {formatDate(entry.dueDate)}</p></div><div className="shrink-0 text-right"><p className={`text-xs font-black ${entry.type === "INCOME" ? "text-emerald-600" : "text-slate-800"}`}>{currencyFormatter.format(entry.amount)}</p><p className={`mt-1 text-[9px] font-bold ${entry.displayStatus === "OVERDUE" ? "text-red-600" : "text-amber-600"}`}>{financialStatusLabels[entry.displayStatus]}</p></div></div>) : <p className="px-5 py-8 text-center text-xs text-slate-400">Nenhum compromisso pendente.</p>}
            </div>
          </article>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(280px,1fr)_170px_170px]">
            <label className="relative"><span className="sr-only">Buscar lançamentos</span><Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input type="search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Buscar descrição, contato ou categoria..." className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100" /></label>
            <FilterSelect label="Tipo" value={type} options={[{ value: "INCOME", label: "Receita" }, { value: "EXPENSE", label: "Despesa" }]} onChange={(value) => { setType(value); setPage(1); }} />
            <FilterSelect label="Status" value={status} options={[{ value: "PAID", label: "Pago" }, { value: "PENDING", label: "Pendente" }, { value: "OVERDUE", label: "Vencido" }, { value: "CANCELLED", label: "Cancelado" }]} onChange={(value) => { setStatus(value); setPage(1); }} />
          </div>
        </div>

        {error && entries.length > 0 && <div role="alert" className="mt-4 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700"><span>{error}</span><button type="button" onClick={() => void loadEntries()} className="font-bold underline">Tentar novamente</button></div>}
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? <div className="flex min-h-72 items-center justify-center text-xs font-semibold text-slate-500"><LoaderCircle className="mr-2 size-5 animate-spin text-violet-600" />Carregando lançamentos...</div> : error && entries.length === 0 ? <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center"><AlertTriangle className="size-6 text-red-500" /><p className="mt-3 text-xs text-slate-500">{error}</p><button type="button" onClick={() => void loadEntries()} className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-xs font-bold text-violet-600"><RefreshCw className="size-3.5" />Tentar novamente</button></div> : visibleEntries.length ? <><div className="overflow-x-auto"><table className="w-full min-w-[980px] border-collapse text-left"><thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500"><tr><th className="px-5 py-3">Lançamento</th><th className="px-4 py-3">Categoria</th><th className="px-4 py-3">Vencimento</th><th className="px-4 py-3">Conta</th><th className="px-4 py-3">Valor</th><th className="px-4 py-3">Status</th><th className="w-16 px-4 py-3 text-center">Ações</th></tr></thead><tbody className="divide-y divide-slate-100">
            {visibleEntries.map((entry) => { const statusStyle = getStatusStyle(entry.displayStatus); const StatusIcon = statusStyle.icon; return <tr key={entry.id} className="transition hover:bg-slate-50"><td className="px-5 py-3.5"><div className="flex items-center gap-3"><div className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${entry.type === "INCOME" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>{entry.type === "INCOME" ? <ArrowUpRight className="size-4" /> : <ArrowDownRight className="size-4" />}</div><div className="min-w-0"><p className="max-w-64 truncate text-xs font-bold text-slate-800">{entry.description}</p><p className="mt-1 text-[10px] text-slate-400">{entry.code} · {entry.contact || "Sem contato"}</p></div></div></td><td className="px-4 py-3.5 text-xs text-slate-600">{entry.category}</td><td className="px-4 py-3.5 text-xs text-slate-600">{formatDate(entry.dueDate)}</td><td className="px-4 py-3.5 text-xs text-slate-600">{entry.account}</td><td className={`px-4 py-3.5 text-xs font-black ${entry.type === "INCOME" ? "text-emerald-600" : "text-red-600"}`}>{entry.type === "INCOME" ? "+" : "-"} {currencyFormatter.format(entry.amount)}</td><td className="px-4 py-3.5"><span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${statusStyle.className}`}><StatusIcon className="size-3" />{financialStatusLabels[entry.displayStatus]}</span></td><td className="px-4 py-3.5 text-center"><details className="relative inline-block text-left"><summary aria-label={`Ações do lançamento ${entry.code}`} className="flex size-8 cursor-pointer list-none items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"><MoreHorizontal className="size-4" /></summary><div className="absolute right-0 z-20 mt-1 w-40 rounded-xl border border-slate-200 bg-white p-1.5 text-left shadow-xl"><button type="button" onClick={() => setSelectedEntry(entry)} className="flex h-9 w-full items-center gap-2 rounded-lg px-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"><Eye className="size-3.5" />Visualizar</button>{(entry.displayStatus === "PENDING" || entry.displayStatus === "OVERDUE") && <button type="button" onClick={() => setEntryToPay(entry)} className="flex h-9 w-full items-center gap-2 rounded-lg px-2.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-50"><CheckCircle2 className="size-3.5" />Marcar como pago</button>}</div></details></td></tr>; })}
          </tbody></table></div><div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5"><p className="text-[11px] text-slate-500">Mostrando {visibleEntries.length} de {filteredEntries.length} lançamento(s)</p><div className="flex items-center gap-2"><PageButton label="Página anterior" disabled={currentPage === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}><ChevronLeft className="size-4" /></PageButton><span className="min-w-20 text-center text-[11px] font-semibold text-slate-600">Página {currentPage} de {totalPages}</span><PageButton label="Próxima página" disabled={currentPage === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}><ChevronRight className="size-4" /></PageButton></div></div></> : <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center"><ReceiptText className="size-6 text-slate-300" /><h2 className="mt-3 text-sm font-bold text-slate-900">Nenhum lançamento encontrado</h2><button type="button" onClick={clearFilters} className="mt-4 h-10 rounded-xl border border-slate-200 px-4 text-xs font-bold text-violet-600 hover:bg-violet-50">Limpar filtros</button></div>}
        </div>
      </section>

      {selectedEntry && <EntryDetails entry={selectedEntry} onClose={() => setSelectedEntry(null)} />}
      {entryToPay && <ConfirmPayment entry={entryToPay} loading={paying} onCancel={() => setEntryToPay(null)} onConfirm={() => void confirmPayment()} />}
    </>
  );
}

function SummaryCard({ icon: Icon, label, value, description, iconClassName }: { icon: LucideIcon; label: string; value: string; description: string; iconClassName: string }) { return <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center gap-3"><div className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}><Icon className="size-4" /></div><div className="min-w-0"><p className="text-[10px] font-semibold text-slate-400">{label}</p><p className="mt-0.5 truncate text-lg font-black text-slate-950">{value}</p></div></div><p className="mt-2 text-[9px] text-slate-400">{description}</p></article>; }
function Legend({ color, label }: { color: string; label: string }) { return <span className="flex items-center gap-1.5 text-slate-500"><span className={`size-2 rounded-full ${color}`} />{label}</span>; }
function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (value: string) => void }) { return <label><span className="sr-only">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-600 outline-none focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100"><option value="all">{label}: todos</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>; }
function PageButton({ label, disabled, onClick, children }: { label: string; disabled: boolean; onClick: () => void; children: ReactNode }) { return <button type="button" aria-label={label} disabled={disabled} onClick={onClick} className="flex size-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">{children}</button>; }

function EntryDetails({ entry, onClose }: { entry: FinancialEntry; onClose: () => void }) { const details = [["Tipo", financialTypeLabels[entry.type]], ["Categoria", entry.category], ["Contato", entry.contact || "Não informado"], ["Vencimento", formatDate(entry.dueDate)], ["Conta", entry.account], ["Valor", currencyFormatter.format(entry.amount)]]; return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"><div role="dialog" aria-modal="true" className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-wider text-violet-600">Detalhes do lançamento</p><h2 className="mt-1 text-lg font-black text-slate-950">{entry.description}</h2><p className="mt-1 text-xs text-slate-500">{entry.code}</p></div><button type="button" onClick={onClose} aria-label="Fechar detalhes" className="flex size-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100"><X className="size-4" /></button></div><dl className="mt-5 grid gap-3 sm:grid-cols-2">{details.map(([label, value]) => <div key={label} className="rounded-xl bg-slate-50 p-3"><dt className="text-[10px] text-slate-400">{label}</dt><dd className="mt-1 truncate text-xs font-bold text-slate-800">{value}</dd></div>)}</dl>{entry.cancelReason && <p className="mt-3 rounded-xl bg-red-50 p-3 text-xs text-red-700"><strong>Cancelamento:</strong> {entry.cancelReason}</p>}</div></div>; }
function ConfirmPayment({ entry, loading, onCancel, onConfirm }: { entry: FinancialEntry; loading: boolean; onCancel: () => void; onConfirm: () => void }) { return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"><div role="alertdialog" aria-modal="true" className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl"><div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><CheckCircle2 className="size-4" /></div><h2 className="mt-4 text-base font-black text-slate-950">Marcar como pago?</h2><p className="mt-2 text-xs leading-5 text-slate-500">O lançamento <strong className="text-slate-700">{entry.description}</strong> entrará no saldo realizado.</p><div className="mt-5 flex justify-end gap-2"><button type="button" disabled={loading} onClick={onCancel} className="h-10 rounded-xl border border-slate-200 px-4 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50">Cancelar</button><button type="button" disabled={loading} onClick={onConfirm} className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50">{loading && <LoaderCircle className="size-3.5 animate-spin" />}Confirmar pagamento</button></div></div></div>; }

function getStatusStyle(status: FinancialEntryStatus) { if (status === "PAID") return { className: "bg-emerald-50 text-emerald-600", icon: CheckCircle2 }; if (status === "OVERDUE" || status === "CANCELLED") return { className: "bg-red-50 text-red-600", icon: XCircle }; return { className: "bg-amber-50 text-amber-600", icon: Clock3 }; }
function formatDate(date: string) { return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(date)); }
