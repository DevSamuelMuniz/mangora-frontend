"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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
  Landmark,
  Layers3,
  LoaderCircle,
  MoreHorizontal,
  Plus,
  ReceiptText,
  RefreshCw,
  RotateCcw,
  Search,
  Tags,
  WalletCards,
  X,
  XCircle,
} from "lucide-react";

import { formatCurrency, formatDate } from "@/lib/format";
import { brazilDateKey, brazilDateTimeToIso } from "@/lib/timezone";
import { PageButton } from "@/components/shared/PageButton";
import { FilterSelect } from "@/components/shared/FilterSelect";
import { SummaryCard } from "@/components/shared/SummaryCard";
import {
  useAccountCategories,
  useCostCenters,
  useCreateAccountCategory,
  useCreateCostCenter,
  useFinancialOverview,
  useGenerateRecurring,
  usePayFinancialEntry,
  useReverseFinancialEntry,
  useUpdateAccountCategory,
  useUpdateCostCenter,
} from "@/features/financial/hooks/useFinancialEntries";
import {
  financialStatusLabels,
  financialTypeLabels,
  recurrenceLabels,
  type AccountCategory,
  type CostCenter,
  type FinancialEntry,
  type FinancialEntryStatus,
  type FinancialEntryType,
  type FinancialOverview as FinancialOverviewData,
} from "@/types/financial";
import { paymentMethodLabels, type PaymentMethod } from "@/types/sale";

const PAGE_SIZE = 7;
const emptySummary: FinancialOverviewData["summary"] = { balance: 0, paidIncome: 0, paidExpense: 0, receivable: 0, payable: 0 };

type PaymentInput = { amount: number; interest?: number; discount?: number; paymentMethod: PaymentMethod; paidAt: string; notes?: string };

export default function FinancialOverview() {
  const { data: overview, isLoading: loading, error, refetch: loadEntries } = useFinancialOverview();
  const payEntry = usePayFinancialEntry();
  const reverseEntry = useReverseFinancialEntry();
  const generateRecurring = useGenerateRecurring();
  const entries = useMemo(() => overview?.entries ?? [], [overview]);
  const summary = useMemo(() => overview?.summary ?? emptySummary, [overview]);
  const cashFlow = useMemo(() => overview?.cashFlow ?? [], [overview]);
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedEntry, setSelectedEntry] = useState<FinancialEntry | null>(null);
  const [entryToPay, setEntryToPay] = useState<FinancialEntry | null>(null);
  const [entryToReverse, setEntryToReverse] = useState<FinancialEntry | null>(null);
  const [showStructure, setShowStructure] = useState(false);

  const errorMessage = actionError || (error instanceof Error ? error.message : "");

  const filteredEntries = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");
    return entries.filter((entry) => {
      const content = `${entry.id} ${entry.description} ${entry.contact} ${entry.category}`.toLocaleLowerCase("pt-BR");
      return (!normalizedSearch || content.includes(normalizedSearch)) && (type === "all" || entry.type === type) && (status === "all" || entry.displayStatus === status);
    });
  }, [entries, search, status, type]);

  const pendingEntries = entries.filter((entry) => entry.displayStatus === "PENDING" || entry.displayStatus === "PARTIALLY_PAID" || entry.displayStatus === "OVERDUE").slice(0, 5);
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

  async function confirmPayment(input: PaymentInput) {
    if (!entryToPay) return;
    try {
      setActionError("");
      await payEntry.mutateAsync({ id: entryToPay.id, input: { ...input, paidAt: brazilDateTimeToIso(input.paidAt) } });
      setEntryToPay(null);
      setNotice("Pagamento registrado.");
    } catch (requestError) {
      setActionError(requestError instanceof Error ? requestError.message : "Não foi possível confirmar o pagamento.");
    }
  }

  async function confirmReverse(reason: string) {
    if (!entryToReverse) return;
    try {
      setActionError("");
      await reverseEntry.mutateAsync({ id: entryToReverse.id, reason });
      setEntryToReverse(null);
      setNotice("Estorno criado. O lançamento original foi marcado como revertido.");
    } catch (requestError) {
      setActionError(requestError instanceof Error ? requestError.message : "Não foi possível estornar o lançamento.");
    }
  }

  async function runRecurring() {
    try {
      setActionError("");
      const result = await generateRecurring.mutateAsync();
      setNotice(result.generated ? `${result.generated} lançamento(s) recorrente(s) gerado(s).` : "Nenhuma ocorrência nova para gerar.");
    } catch (requestError) {
      setActionError(requestError instanceof Error ? requestError.message : "Não foi possível gerar as ocorrências.");
    }
  }

  return (
    <>
      <section>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-orange-600">Gestão financeira</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Financeiro</h1>
            <p className="mt-1 text-xs text-slate-500">Acompanhe receitas, despesas e compromissos.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => void runRecurring()} disabled={generateRecurring.isPending} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50">
              {generateRecurring.isPending ? <LoaderCircle className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}Recorrências
            </button>
            <button type="button" onClick={() => setShowStructure(true)} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50">
              <Layers3 className="size-4" />Estrutura
            </button>
            <Link href="/financeiro/contas" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50">
              <Landmark className="size-4" />Contas &amp; Conciliação
            </Link>
            <Link href="/financeiro?acao=novo" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 px-4 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:shadow-xl"><Plus className="size-4" />Novo lançamento</Link>
          </div>
        </div>

        {notice && <div role="status" className="mt-4 flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-xs font-semibold text-green-700"><span>{notice}</span><button type="button" onClick={() => setNotice("")} className="font-bold underline">Fechar</button></div>}

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard icon={WalletCards} label="Saldo realizado" value={formatCurrency(summary.balance)} description="Receitas menos despesas pagas" iconClassName="bg-orange-50 text-orange-600" />
          <SummaryCard icon={ArrowUpRight} label="Receitas realizadas" value={formatCurrency(summary.paidIncome)} description="Entradas confirmadas" iconClassName="bg-green-50 text-green-600" />
          <SummaryCard icon={CircleDollarSign} label="Contas a receber" value={formatCurrency(summary.receivable)} description="Receitas pendentes" iconClassName="bg-yellow-50 text-yellow-600" />
          <SummaryCard icon={ArrowDownRight} label="Contas a pagar" value={formatCurrency(summary.payable)} description="Despesas pendentes ou vencidas" iconClassName="bg-amber-50 text-amber-600" />
        </div>

        <div className="mt-4 grid items-stretch gap-4 xl:grid-cols-[1.3fr_0.7fr]">
          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center justify-between gap-4"><div className="flex items-center gap-3"><div className="flex size-9 items-center justify-center rounded-xl bg-orange-50 text-orange-600"><BarChart3 className="size-4" /></div><div><h2 className="text-sm font-bold text-slate-950">Fluxo de caixa</h2><p className="mt-0.5 text-[10px] text-slate-400">Receitas e despesas dos últimos 6 meses</p></div></div><div className="hidden items-center gap-3 text-[9px] sm:flex"><Legend color="bg-orange-600" label="Receitas" /><Legend color="bg-yellow-400" label="Despesas" /></div></div>
            <div className="mt-6 flex h-48 items-end gap-3 sm:gap-5">
              {cashFlow.map((item) => <div key={item.key} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><div className="flex h-full w-full items-end justify-center gap-1"><div title={formatCurrency(item.income)} className="w-full max-w-5 rounded-t-md bg-orange-600" style={{ height: `${Math.max(item.income ? 3 : 0, item.income / chartMaximum * 100)}%` }} /><div title={formatCurrency(item.expense)} className="w-full max-w-5 rounded-t-md bg-yellow-400" style={{ height: `${Math.max(item.expense ? 3 : 0, item.expense / chartMaximum * 100)}%` }} /></div><span className="text-[9px] font-semibold capitalize text-slate-400">{item.month}</span></div>)}
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-4 py-4 sm:px-5"><h2 className="text-sm font-bold text-slate-950">Próximos compromissos</h2><p className="mt-0.5 text-[10px] text-slate-400">Contas pendentes e vencidas</p></div>
            <div className="divide-y divide-slate-100">
              {pendingEntries.length ? pendingEntries.map((entry) => <div key={entry.id} className="flex items-center gap-3 px-4 py-3 sm:px-5"><div className={`flex size-8 shrink-0 items-center justify-center rounded-xl ${entry.displayStatus === "OVERDUE" ? "bg-red-50 text-red-600" : entry.type === "INCOME" ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"}`}>{entry.type === "INCOME" ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-slate-800">{entry.description}</p><p className="mt-1 text-[9px] text-slate-400">Vence em {formatDate(entry.dueDate)}</p></div><div className="shrink-0 text-right"><p className={`text-xs font-black ${entry.type === "INCOME" ? "text-green-600" : "text-slate-800"}`}>{formatCurrency(entry.amount)}</p><p className={`mt-1 text-[9px] font-bold ${entry.displayStatus === "OVERDUE" ? "text-red-600" : "text-amber-600"}`}>{financialStatusLabels[entry.displayStatus]}</p></div></div>) : <p className="px-5 py-8 text-center text-xs text-slate-400">Nenhum compromisso pendente.</p>}
            </div>
          </article>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(280px,1fr)_170px_170px]">
            <label className="relative"><span className="sr-only">Buscar lançamentos</span><Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input type="search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Buscar descrição, contato ou categoria..." className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100" /></label>
            <FilterSelect label="Tipo" value={type} options={[{ value: "INCOME", label: "Receita" }, { value: "EXPENSE", label: "Despesa" }]} onChange={(value) => { setType(value); setPage(1); }} />
            <FilterSelect label="Status" value={status} options={[{ value: "PAID", label: "Pago" }, { value: "PARTIALLY_PAID", label: "Pago parcialmente" }, { value: "PENDING", label: "Pendente" }, { value: "OVERDUE", label: "Vencido" }, { value: "CANCELLED", label: "Cancelado" }]} onChange={(value) => { setStatus(value); setPage(1); }} />
          </div>
        </div>

        {errorMessage && entries.length > 0 && <div role="alert" className="mt-4 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700"><span>{errorMessage}</span><button type="button" onClick={() => void loadEntries()} className="font-bold underline">Tentar novamente</button></div>}
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? <div className="flex min-h-72 items-center justify-center text-xs font-semibold text-slate-500"><LoaderCircle className="mr-2 size-5 animate-spin text-orange-600" />Carregando lançamentos...</div> : errorMessage && entries.length === 0 ? <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center"><AlertTriangle className="size-6 text-red-500" /><p className="mt-3 text-xs text-slate-500">{errorMessage}</p><button type="button" onClick={() => void loadEntries()} className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-xs font-bold text-orange-600"><RefreshCw className="size-3.5" />Tentar novamente</button></div> : visibleEntries.length ? <><div className="overflow-x-auto"><table className="w-full min-w-[980px] border-collapse text-left"><thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500"><tr><th className="px-5 py-3">Lançamento</th><th className="px-4 py-3">Categoria</th><th className="px-4 py-3">Vencimento</th><th className="px-4 py-3">Conta</th><th className="px-4 py-3">Valor</th><th className="px-4 py-3">Status</th><th className="w-16 px-4 py-3 text-center">Ações</th></tr></thead><tbody className="divide-y divide-slate-100">
            {visibleEntries.map((entry) => { const statusStyle = getStatusStyle(entry.displayStatus); const StatusIcon = statusStyle.icon; return <tr key={entry.id} className="transition hover:bg-slate-50"><td className="px-5 py-3.5"><div className="flex items-center gap-3"><div className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${entry.type === "INCOME" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>{entry.type === "INCOME" ? <ArrowUpRight className="size-4" /> : <ArrowDownRight className="size-4" />}</div><div className="min-w-0"><p className="max-w-64 truncate text-xs font-bold text-slate-800">{entry.description}{entry.reversed && " (revertido)"}</p><p className="mt-1 text-[10px] text-slate-400">{entry.code} · {entry.contact || "Sem contato"}</p></div></div></td><td className="px-4 py-3.5 text-xs text-slate-600">{entry.category}</td><td className="px-4 py-3.5 text-xs text-slate-600">{formatDate(entry.dueDate)}</td><td className="px-4 py-3.5 text-xs text-slate-600">{entry.account}</td><td className={`px-4 py-3.5 text-xs font-black ${entry.type === "INCOME" ? "text-green-600" : "text-red-600"}`}>{entry.type === "INCOME" ? "+" : "-"} {formatCurrency(entry.amount)}</td><td className="px-4 py-3.5"><span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${statusStyle.className}`}><StatusIcon className="size-3" />{financialStatusLabels[entry.displayStatus]}</span></td><td className="px-4 py-3.5 text-center"><details className="relative inline-block text-left"><summary aria-label={`Ações do lançamento ${entry.code}`} className="flex size-8 cursor-pointer list-none items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"><MoreHorizontal className="size-4" /></summary><div className="absolute right-0 z-20 mt-1 w-44 rounded-xl border border-slate-200 bg-white p-1.5 text-left shadow-xl"><button type="button" onClick={() => setSelectedEntry(entry)} className="flex h-9 w-full items-center gap-2 rounded-lg px-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"><Eye className="size-3.5" />Visualizar</button>{entry.outstandingAmount > 0 && entry.status !== "CANCELLED" && !entry.reversed && <button type="button" onClick={() => setEntryToPay(entry)} className="flex h-9 w-full items-center gap-2 rounded-lg px-2.5 text-xs font-semibold text-green-600 hover:bg-green-50"><CheckCircle2 className="size-3.5" />Registrar pagamento</button>}</div></details></td></tr>; })}
          </tbody></table></div><div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5"><p className="text-[11px] text-slate-500">Mostrando {visibleEntries.length} de {filteredEntries.length} lançamento(s)</p><div className="flex items-center gap-2"><PageButton label="Página anterior" disabled={currentPage === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}><ChevronLeft className="size-4" /></PageButton><span className="min-w-20 text-center text-[11px] font-semibold text-slate-600">Página {currentPage} de {totalPages}</span><PageButton label="Próxima página" disabled={currentPage === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}><ChevronRight className="size-4" /></PageButton></div></div></> : <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center"><ReceiptText className="size-6 text-slate-300" /><h2 className="mt-3 text-sm font-bold text-slate-900">Nenhum lançamento encontrado</h2><button type="button" onClick={clearFilters} className="mt-4 h-10 rounded-xl border border-slate-200 px-4 text-xs font-bold text-orange-600 hover:bg-orange-50">Limpar filtros</button></div>}
        </div>
      </section>

      {selectedEntry && <EntryDetails entry={selectedEntry} onClose={() => setSelectedEntry(null)} onPay={() => { setEntryToPay(selectedEntry); setSelectedEntry(null); }} onReverse={() => { setEntryToReverse(selectedEntry); setSelectedEntry(null); }} />}
      {entryToPay && <ConfirmPayment entry={entryToPay} loading={payEntry.isPending} onCancel={() => setEntryToPay(null)} onConfirm={(input) => void confirmPayment(input)} />}
      {entryToReverse && <ReverseEntry entry={entryToReverse} loading={reverseEntry.isPending} onCancel={() => setEntryToReverse(null)} onConfirm={(reason) => void confirmReverse(reason)} />}
      {showStructure && <FinancialStructure onClose={() => setShowStructure(false)} />}
    </>
  );
}

function Legend({ color, label }: { color: string; label: string }) { return <span className="flex items-center gap-1.5 text-slate-500"><span className={`size-2 rounded-full ${color}`} />{label}</span>; }

function EntryDetails({ entry, onClose, onPay, onReverse }: { entry: FinancialEntry; onClose: () => void; onPay: () => void; onReverse: () => void }) {
  const details: Array<[string, string]> = [
    ["Tipo", financialTypeLabels[entry.type]],
    ["Categoria", entry.category],
    ["Contato", entry.contact || "Não informado"],
    ["Vencimento", formatDate(entry.dueDate)],
    ["Conta", entry.account],
    ["Valor", formatCurrency(entry.amount)],
    [entry.type === "INCOME" ? "Recebido" : "Pago", formatCurrency(entry.paidAmount)],
    ["Em aberto", formatCurrency(entry.outstandingAmount)],
  ];
  if (entry.competenceDate) details.push(["Competência", formatDate(entry.competenceDate)]);
  if (entry.recurrence !== "NONE") details.push(["Recorrência", `${recurrenceLabels[entry.recurrence]}${entry.recurrenceDay ? ` (dia ${entry.recurrenceDay})` : ""}`]);
  const canReverse = !entry.reversed && entry.status !== "CANCELLED" && !entry.reversalOfId;
  return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"><div role="dialog" aria-modal="true" className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-wider text-orange-600">Detalhes do lançamento</p><h2 className="mt-1 text-lg font-black text-slate-950">{entry.description}</h2><p className="mt-1 text-xs text-slate-500">{entry.code}</p></div><button type="button" onClick={onClose} aria-label="Fechar detalhes" className="flex size-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100"><X className="size-4" /></button></div><dl className="mt-5 grid gap-3 sm:grid-cols-2">{details.map(([label, value]) => <div key={label} className="rounded-xl bg-slate-50 p-3"><dt className="text-[10px] text-slate-400">{label}</dt><dd className="mt-1 truncate text-xs font-bold text-slate-800">{value}</dd></div>)}</dl>{entry.payments.length > 0 && <div className="mt-4"><h3 className="text-xs font-black text-slate-800">Histórico de pagamentos</h3><div className="mt-2 divide-y divide-slate-100 rounded-xl border border-slate-200">{entry.payments.map((payment) => <div key={payment.id} className="p-3"><div className="flex items-center justify-between gap-4"><div><p className="text-xs font-bold text-slate-800">{paymentMethodLabels[payment.paymentMethod]}</p><p className="mt-0.5 text-[10px] text-slate-400">{formatDate(payment.paidAt)} · {payment.receivedByName}</p></div><strong className="text-xs text-green-600">{formatCurrency(payment.amount)}</strong></div>{(payment.interest > 0 || payment.discount > 0 || payment.remainingAfter != null) && <p className="mt-1.5 text-[10px] text-slate-500">{payment.interest > 0 ? `Juros +${formatCurrency(payment.interest)} ` : ""}{payment.discount > 0 ? `Desconto -${formatCurrency(payment.discount)} ` : ""}{payment.remainingAfter != null ? `· Saldo restante ${formatCurrency(payment.remainingAfter)}` : ""}</p>}</div>)}</div></div>}{entry.reversed && entry.reversedAt && <p className="mt-3 rounded-xl bg-red-50 p-3 text-xs text-red-700"><strong>Revertido:</strong> este lançamento foi estornado em {formatDate(entry.reversedAt)}.</p>}{entry.outstandingAmount > 0 && entry.status !== "CANCELLED" && !entry.reversed && <button type="button" onClick={onPay} className="mt-4 h-10 w-full rounded-xl bg-green-600 text-xs font-bold text-white">Registrar pagamento</button>}{canReverse && <button type="button" onClick={onReverse} className="mt-2 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-red-200 text-xs font-bold text-red-600 hover:bg-red-50"><RotateCcw className="size-3.5" />Estornar (cria reversão)</button>}{entry.cancelReason && <p className="mt-3 rounded-xl bg-red-50 p-3 text-xs text-red-700"><strong>Cancelamento:</strong> {entry.cancelReason}</p>}</div></div>;
}

function ConfirmPayment({ entry, loading, onCancel, onConfirm }: { entry: FinancialEntry; loading: boolean; onCancel: () => void; onConfirm: (input: PaymentInput) => void }) {
  const [amount, setAmount] = useState(String(entry.outstandingAmount));
  const [interest, setInterest] = useState("");
  const [discount, setDiscount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("PIX");
  const [paidAt, setPaidAt] = useState(() => brazilDateKey());
  const [notes, setNotes] = useState("");
  const numericAmount = Number(amount);
  const numericInterest = Number(interest) || 0;
  const numericDiscount = Number(discount) || 0;
  const effective = numericAmount + numericInterest - numericDiscount;
  const valid = numericAmount > 0 && numericAmount <= entry.outstandingAmount && numericDiscount <= numericAmount + numericInterest && effective > 0;
  return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"><div role="dialog" aria-modal="true" className="max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl"><div className="flex size-10 items-center justify-center rounded-xl bg-green-50 text-green-600"><CheckCircle2 className="size-4" /></div><h2 className="mt-4 text-base font-black text-slate-950">Registrar pagamento</h2><p className="mt-2 text-xs leading-5 text-slate-500">Saldo em aberto de <strong className="text-slate-700">{formatCurrency(entry.outstandingAmount)}</strong> em {entry.description}.</p><div className="mt-4 space-y-3"><label className="block text-xs font-bold text-slate-700">{entry.type === "INCOME" ? "Valor recebido" : "Valor pago"}<input type="number" min="0.01" max={entry.outstandingAmount} step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm" /></label><div className="grid grid-cols-2 gap-3"><label className="block text-xs font-bold text-slate-700">Juros (opcional)<input type="number" min="0" step="0.01" value={interest} onChange={(event) => setInterest(event.target.value)} placeholder="0,00" className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm" /></label><label className="block text-xs font-bold text-slate-700">Desconto (opcional)<input type="number" min="0" step="0.01" value={discount} onChange={(event) => setDiscount(event.target.value)} placeholder="0,00" className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm" /></label></div><p className="rounded-xl bg-slate-50 p-3 text-xs font-semibold text-slate-700">Valor efetivo: <strong className="text-green-600">{formatCurrency(effective)}</strong></p><label className="block text-xs font-bold text-slate-700">Forma de pagamento<select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm">{(["PIX", "CREDIT_CARD", "DEBIT_CARD", "CASH", "BOLETO", "CHECK", "STORE_CREDIT"] as PaymentMethod[]).map((method) => <option key={method} value={method}>{paymentMethodLabels[method]}</option>)}</select></label><label className="block text-xs font-bold text-slate-700">Data<input type="date" value={paidAt} onChange={(event) => setPaidAt(event.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm" /></label><label className="block text-xs font-bold text-slate-700">Observação (opcional)<input value={notes} maxLength={500} onChange={(event) => setNotes(event.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm" /></label></div><div className="mt-5 flex justify-end gap-2"><button type="button" disabled={loading} onClick={onCancel} className="h-10 rounded-xl border border-slate-200 px-4 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50">Cancelar</button><button type="button" disabled={loading || !valid || !paidAt} onClick={() => onConfirm({ amount: numericAmount, interest: numericInterest || undefined, discount: numericDiscount || undefined, paymentMethod, paidAt, notes: notes.trim() || undefined })} className="inline-flex h-10 items-center gap-2 rounded-xl bg-green-600 px-4 text-xs font-bold text-white hover:bg-green-700 disabled:opacity-50">{loading && <LoaderCircle className="size-3.5 animate-spin" />}Registrar</button></div></div></div>;
}

function ReverseEntry({ entry, loading, onCancel, onConfirm }: { entry: FinancialEntry; loading: boolean; onCancel: () => void; onConfirm: (reason: string) => void }) {
  const [reason, setReason] = useState("");
  const valid = reason.trim().length >= 3;
  return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"><div role="dialog" aria-modal="true" className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl"><div className="flex size-10 items-center justify-center rounded-xl bg-red-50 text-red-600"><RotateCcw className="size-4" /></div><h2 className="mt-4 text-base font-black text-slate-950">Estornar lançamento</h2><p className="mt-2 text-xs leading-5 text-slate-500">Será criada uma <strong className="text-slate-700">reversão</strong> (tipo oposto) de {formatCurrency(entry.amount)} — {entry.description}. O lançamento original ficará marcado como revertido e nunca será alterado.</p><label className="mt-4 block text-xs font-bold text-slate-700">Motivo do estorno<textarea value={reason} maxLength={500} onChange={(event) => setReason(event.target.value)} placeholder="Ex.: cobrança duplicada, valor incorreto..." className="mt-1.5 h-24 w-full resize-none rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm" /></label><div className="mt-5 flex justify-end gap-2"><button type="button" disabled={loading} onClick={onCancel} className="h-10 rounded-xl border border-slate-200 px-4 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50">Cancelar</button><button type="button" disabled={loading || !valid} onClick={() => onConfirm(reason.trim())} className="inline-flex h-10 items-center gap-2 rounded-xl bg-red-600 px-4 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50">{loading && <LoaderCircle className="size-3.5 animate-spin" />}Estornar</button></div></div></div>;
}

function FinancialStructure({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<"cost" | "category">("cost");
  return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"><div role="dialog" aria-modal="true" className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-wider text-orange-600">Estrutura financeira</p><h2 className="mt-1 text-lg font-black text-slate-950">Centros de custo e plano de contas</h2></div><button type="button" onClick={onClose} aria-label="Fechar" className="flex size-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100"><X className="size-4" /></button></div><div className="mt-4 flex gap-2"><TabButton active={tab === "cost"} onClick={() => setTab("cost")} icon={<Tags className="size-3.5" />} label="Centros de custo" /><TabButton active={tab === "category"} onClick={() => setTab("category")} icon={<Layers3 className="size-3.5" />} label="Plano de contas" /></div>{tab === "cost" ? <CostCentersPanel /> : <AccountCategoriesPanel />}</div></div>;
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return <button type="button" onClick={onClick} className={`inline-flex h-9 items-center gap-2 rounded-xl px-3 text-xs font-bold ${active ? "bg-orange-600 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{icon}{label}</button>;
}

function CostCentersPanel() {
  const { data: items } = useCostCenters();
  const createItem = useCreateCostCenter();
  const updateItem = useUpdateCostCenter();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    try {
      setError("");
      await createItem.mutateAsync(name.trim());
      setName("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível criar o centro de custo.");
    }
  }
  async function toggle(item: CostCenter) {
    try {
      setError("");
      await updateItem.mutateAsync({ id: item.id, name: item.name, active: !item.active });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível atualizar o centro de custo.");
    }
  }
  return <div className="mt-4"><form onSubmit={(event) => void submit(event)} className="flex gap-2"><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: Loja física, Cozinha, Delivery..." className="h-11 flex-1 rounded-xl border border-slate-200 px-3.5 text-sm" /><button type="submit" disabled={!name.trim() || createItem.isPending} className="inline-flex h-11 items-center gap-2 rounded-xl bg-orange-600 px-4 text-xs font-bold text-white disabled:opacity-50"><Plus className="size-4" />Adicionar</button></form>{error && <p className="mt-3 rounded-xl bg-red-50 p-3 text-xs text-red-700">{error}</p>}<div className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-200">{(items ?? []).map((item) => <div key={item.id} className="flex items-center justify-between gap-4 p-3"><span className={`text-xs font-bold ${item.active ? "text-slate-800" : "text-slate-400 line-through"}`}>{item.name}</span><button type="button" onClick={() => void toggle(item)} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[10px] font-bold text-slate-600 hover:bg-slate-50">{item.active ? "Desativar" : "Ativar"}</button></div>)}{!items?.length && <p className="p-4 text-center text-xs text-slate-400">Nenhum centro de custo cadastrado.</p>}</div></div>;
}

function AccountCategoriesPanel() {
  const { data: items } = useAccountCategories();
  const createItem = useCreateAccountCategory();
  const updateItem = useUpdateAccountCategory();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState<FinancialEntryType>("EXPENSE");
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    try {
      setError("");
      await createItem.mutateAsync({ code: code.trim().toUpperCase(), name: name.trim(), type });
      setCode(""); setName("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível criar a categoria contábil.");
    }
  }
  async function toggle(item: AccountCategory) {
    try {
      setError("");
      await updateItem.mutateAsync({ id: item.id, code: item.code, name: item.name, type: item.type, active: !item.active });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível atualizar a categoria contábil.");
    }
  }
  return <div className="mt-4"><form onSubmit={(event) => void submit(event)} className="grid gap-2 sm:grid-cols-[90px_1fr_130px_auto]"><input value={code} onChange={(event) => setCode(event.target.value)} placeholder="Código (ex.: 1.1)" className="h-11 rounded-xl border border-slate-200 px-3.5 text-sm" /><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nome (ex.: Impostos)" className="h-11 rounded-xl border border-slate-200 px-3.5 text-sm" /><select value={type} onChange={(event) => setType(event.target.value as FinancialEntryType)} className="h-11 rounded-xl border border-slate-200 px-3 text-sm"><option value="EXPENSE">Despesa</option><option value="INCOME">Receita</option></select><button type="submit" disabled={!code.trim() || !name.trim() || createItem.isPending} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 text-xs font-bold text-white disabled:opacity-50"><Plus className="size-4" /></button></form>{error && <p className="mt-3 rounded-xl bg-red-50 p-3 text-xs text-red-700">{error}</p>}<div className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-200">{(items ?? []).map((item) => <div key={item.id} className="flex items-center justify-between gap-4 p-3"><div><p className={`text-xs font-bold ${item.active ? "text-slate-800" : "text-slate-400 line-through"}`}>{item.name}</p><p className="mt-0.5 text-[10px] text-slate-400">{item.code} · {financialTypeLabels[item.type]}</p></div><button type="button" onClick={() => void toggle(item)} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[10px] font-bold text-slate-600 hover:bg-slate-50">{item.active ? "Desativar" : "Ativar"}</button></div>)}{!items?.length && <p className="p-4 text-center text-xs text-slate-400">Nenhuma categoria contábil cadastrada.</p>}</div></div>;
}

function getStatusStyle(status: FinancialEntryStatus) { if (status === "PAID") return { className: "bg-green-50 text-green-600", icon: CheckCircle2 }; if (status === "OVERDUE" || status === "CANCELLED") return { className: "bg-red-50 text-red-600", icon: XCircle }; return { className: "bg-amber-50 text-amber-600", icon: Clock3 }; }
