"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCheck,
  CreditCard,
  FileText,
  Landmark,
  LoaderCircle,
  Plus,
  QrCode,
  Upload,
  Wallet,
  XCircle,
  type LucideIcon,
} from "lucide-react";

import { useBankAccounts, useBankTransactions, useCreateBankAccount, useIgnoreTransaction, useImportStatement, useMatchTransaction, useReconcileAccount } from "@/features/bank/hooks/useBank";
import { useFinancialOverview } from "@/features/financial/hooks/useFinancialEntries";
import { formatCurrency, formatDate } from "@/lib/format";
import type { FinancialEntry } from "@/types/financial";
import { accountTypeLabels, type AccountType, type BankAccount, type BankTransaction } from "@/types/bank";

const accountTypeConfig: Record<AccountType, { icon: LucideIcon; chip: string; dot: string; ring: string }> = {
  CASH: { icon: Wallet, chip: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500", ring: "ring-amber-300" },
  BANK: { icon: Landmark, chip: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500", ring: "ring-blue-300" },
  PIX: { icon: QrCode, chip: "bg-teal-50 text-teal-700 border-teal-200", dot: "bg-teal-500", ring: "ring-teal-300" },
  CARD: { icon: CreditCard, chip: "bg-violet-50 text-violet-700 border-violet-200", dot: "bg-violet-500", ring: "ring-violet-300" },
};

export default function BankReconciliation() {
  const { data: accounts, isLoading: loadingAccounts } = useBankAccounts();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const account = (accounts ?? []).find((item) => item.id === selectedId) ?? (accounts ?? [])[0] ?? null;
  const { data: transactions } = useBankTransactions(account?.id ?? null);
  const reconcile = useReconcileAccount();
  const importStatement = useImportStatement();
  const matchTransaction = useMatchTransaction();
  const ignoreTransaction = useIgnoreTransaction();

  async function runReconcile() {
    if (!account) return;
    try {
      setError("");
      const result = await reconcile.mutateAsync(account.id);
      setNotice(`${result.matched} transação(ões) conferida(s) automaticamente. ${result.unmatched} ainda aguardando conferência.`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível conferir automaticamente.");
    }
  }

  return (
    <section className="mx-auto max-w-6xl">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-orange-600">Gestão financeira</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Contas &amp; Conciliação</h1>
          <p className="mt-1 text-xs text-slate-500">Separe caixa, banco, Pix e cartão — e confira o extrato contra os lançamentos.</p>
        </div>
        <button type="button" onClick={() => setShowNew(true)} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 px-4 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:shadow-xl"><Plus className="size-4" />Nova conta</button>
      </div>

      {notice && <div role="status" className="mt-4 flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-xs font-semibold text-green-700"><span>{notice}</span><button type="button" onClick={() => setNotice("")} className="font-bold underline">Fechar</button></div>}
      {error && <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">{error}</div>}

      {loadingAccounts ? <div className="mt-5 flex min-h-40 items-center justify-center text-xs font-semibold text-slate-500"><LoaderCircle className="mr-2 size-5 animate-spin text-orange-600" />Carregando contas...</div> : !(accounts ?? []).length ? <EmptyAccounts onCreate={() => setShowNew(true)} /> : (
        <>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {(accounts ?? []).map((item) => <AccountCard key={item.id} account={item} selected={item.id === account?.id} onClick={() => { setSelectedId(item.id); setShowImport(false); }} />)}
          </div>

          {account && <AccountWorkspace
            account={account}
            transactions={transactions ?? []}
            showImport={showImport}
            onToggleImport={() => setShowImport((value) => !value)}
            onReconcile={() => void runReconcile()}
            reconciling={reconcile.isPending}
            onImport={(format, content) => {
              setError(""); setNotice("");
              importStatement.mutateAsync({ accountId: account.id, format, content })
                .then((result) => setNotice(`Extrato lido: ${result.parsed} linha(s), ${result.imported} importada(s), ${result.skipped} repetida(s).`))
                .catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Não foi possível importar o extrato."));
            }}
            importing={importStatement.isPending}
            onMatch={(transactionId, financialEntryId) => {
              setError("");
              matchTransaction.mutateAsync({ accountId: account.id, transactionId, financialEntryId })
                .then(() => setNotice("Transação conferida."))
                .catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Não foi possível casar a transação."));
            }}
            onIgnore={(transactionId) => {
              setError("");
              ignoreTransaction.mutateAsync({ accountId: account.id, transactionId })
                .then(() => setNotice("Transação ignorada."))
                .catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Não foi possível ignorar a transação."));
            }}
          />}
        </>
      )}

      {showNew && <NewAccountDialog onClose={() => setShowNew(false)} />}
    </section>
  );
}

function AccountCard({ account, selected, onClick }: { account: BankAccount; selected: boolean; onClick: () => void }) {
  const config = accountTypeConfig[account.type];
  const Icon = config.icon;
  return <button type="button" onClick={onClick} className={`rounded-2xl border bg-white p-4 text-left shadow-sm transition ${selected ? `border-orange-300 ring-2 ${config.ring}` : "border-slate-200 hover:border-slate-300"}`}>
    <div className="flex items-center justify-between gap-3"><div className={`flex size-9 items-center justify-center rounded-xl border ${config.chip}`}><Icon className="size-4" /></div><span className={`size-2.5 rounded-full ${config.dot}`} /></div>
    <p className="mt-3 truncate text-xs font-bold text-slate-800">{account.name}</p>
    <p className="mt-0.5 text-[10px] text-slate-400">{accountTypeLabels[account.type]}{account.institution ? ` · ${account.institution}` : ""}</p>
    <p className="mt-3 text-[10px] font-semibold text-slate-400">Saldo inicial</p>
    <p className="text-sm font-black tabular-nums text-slate-900">{formatCurrency(account.openingBalance)}</p>
  </button>;
}

function AccountWorkspace(props: {
  account: BankAccount;
  transactions: BankTransaction[];
  showImport: boolean;
  onToggleImport: () => void;
  onReconcile: () => void;
  reconciling: boolean;
  onImport: (format: "ofx" | "csv", content: string) => void;
  importing: boolean;
  onMatch: (transactionId: string, financialEntryId: string) => void;
  onIgnore: (transactionId: string) => void;
}) {
  const { account, transactions, showImport, onToggleImport, onReconcile, reconciling, onImport, importing, onMatch, onIgnore } = props;
  const { data: overview } = useFinancialOverview();
  const config = accountTypeConfig[account.type];

  const balance = useMemo(() => {
    const movement = transactions.reduce((sum, transaction) => sum + (transaction.direction === "CREDIT" ? transaction.amount : -transaction.amount), 0);
    return account.openingBalance + movement;
  }, [account.openingBalance, transactions]);

  const openEntries = useMemo(() => (overview?.entries ?? []).filter((entry) => entry.outstandingAmount > 0 && entry.status !== "CANCELLED" && !entry.reversed), [overview]);

  return (
    <div className="mt-5 space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className={`flex size-10 items-center justify-center rounded-xl border ${config.chip}`}>{(() => { const Icon = config.icon; return <Icon className="size-4" />; })()}</div>
            <div><h2 className="text-sm font-black text-slate-950">{account.name}</h2><p className="mt-0.5 text-[10px] text-slate-400">{accountTypeLabels[account.type]}{account.agency && account.accountNumber ? ` · Ag ${account.agency} C/C ${account.accountNumber}` : ""}</p></div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-xl bg-slate-50 px-3 py-2 text-right"><p className="text-[10px] font-semibold text-slate-400">Saldo conforme extrato</p><p className="text-sm font-black tabular-nums text-slate-900">{formatCurrency(balance)}</p></div>
            <button type="button" onClick={onToggleImport} className={`inline-flex h-10 items-center gap-2 rounded-xl border px-3.5 text-xs font-bold transition ${showImport ? "border-orange-300 bg-orange-50 text-orange-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}><Upload className="size-3.5" />Importar extrato</button>
            <button type="button" onClick={onReconcile} disabled={reconciling} className="inline-flex h-10 items-center gap-2 rounded-xl bg-green-600 px-3.5 text-xs font-bold text-white hover:bg-green-700 disabled:opacity-50">{reconciling ? <LoaderCircle className="size-3.5 animate-spin" /> : <CheckCheck className="size-3.5" />}Conferir automaticamente</button>
          </div>
        </div>

        {showImport && <ImportPanel onImport={onImport} importing={importing} />}
      </div>

      <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-4 sm:px-5"><h2 className="text-sm font-bold text-slate-950">Extrato importado</h2><p className="mt-0.5 text-[10px] text-slate-400">Cada linha precisa bater com um lançamento para fechar o mês.</p></div>
        {transactions.length ? <div className="divide-y divide-slate-100">{transactions.map((transaction) => <TransactionRow key={transaction.id} transaction={transaction} entries={openEntries} onMatch={(entryId) => onMatch(transaction.id, entryId)} onIgnore={() => onIgnore(transaction.id)} />)}</div> : <div className="flex min-h-44 flex-col items-center justify-center p-8 text-center"><FileText className="size-6 text-slate-300" /><p className="mt-3 text-xs text-slate-400">Nenhuma transação importada.</p><p className="mt-1 text-[11px] text-slate-400">Cole um extrato OFX ou CSV para começar a conferência.</p></div>}
      </article>
    </div>
  );
}

function ImportPanel({ onImport, importing }: { onImport: (format: "ofx" | "csv", content: string) => void; importing: boolean }) {
  const [format, setFormat] = useState<"ofx" | "csv">("ofx");
  const [content, setContent] = useState("");
  const example = format === "ofx" ? "<OFX>...<STMTTRN><DTPOSTED>20260901</DTPOSTED><TRNAMT>-250.50</TRNAMT><FITID>1</FITID><MEMO>Fornecedor</MEMO></STMTTRN>...</OFX>" : "Data;Descricao;Valor;Documento\n01/09/2026;Fornecedor;-250,50;A001";
  return <div className="mt-5 rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50/50 p-4 sm:p-5">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs font-black text-slate-800">Cole o extrato do banco</p><div className="flex gap-2">{(["ofx", "csv"] as const).map((value) => <button key={value} type="button" onClick={() => setFormat(value)} className={`h-8 rounded-lg px-3 text-[10px] font-bold uppercase tracking-wider ${format === value ? "bg-amber-500 text-white" : "border border-amber-200 bg-white text-amber-700"}`}>{value}</button>)}</div></div>
    <textarea value={content} onChange={(event) => setContent(event.target.value)} rows={6} placeholder={example} className="mt-3 w-full resize-y rounded-xl border border-amber-200 bg-white p-3.5 font-mono text-[11px] leading-5 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-100" />
    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-[10px] text-amber-700">Importamos só linhas novas (não duplicamos pelo identificador).</p><button type="button" onClick={() => onImport(format, content)} disabled={importing || !content.trim()} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 text-xs font-bold text-white hover:bg-amber-600 disabled:opacity-50">{importing ? <LoaderCircle className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}Importar extrato</button></div>
  </div>;
}

function TransactionRow({ transaction, entries, onMatch, onIgnore }: { transaction: BankTransaction; entries: FinancialEntry[]; onMatch: (entryId: string) => void; onIgnore: () => void }) {
  const [entryId, setEntryId] = useState("");
  const isCredit = transaction.direction === "CREDIT";
  const candidates = entries.filter((entry) => {
    const matchesDirection = isCredit ? entry.type === "INCOME" : entry.type === "EXPENSE";
    return matchesDirection && entry.outstandingAmount >= transaction.amount - 0.01;
  });

  if (transaction.status === "IGNORED") {
    return <div className="flex items-center gap-3 px-4 py-3 opacity-50 sm:px-5"><XCircle className="size-4 text-slate-300" /><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-slate-400 line-through">{transaction.description}</p><p className="mt-0.5 text-[10px] text-slate-300">{formatDate(transaction.date)} · ignorada</p></div></div>;
  }

  return <div className={`px-4 py-3 sm:px-5 ${transaction.status === "MATCHED" ? "bg-green-50/40" : "border-l-2 border-l-amber-300 bg-white"}`}>
    <div className="flex items-start justify-between gap-4">
      <div className="flex min-w-0 items-start gap-3">
        <div className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl ${isCredit ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>{isCredit ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}</div>
        <div className="min-w-0"><p className="truncate text-xs font-bold text-slate-800">{transaction.description}</p><p className="mt-1 text-[10px] text-slate-400">{formatDate(transaction.date)}{transaction.externalId ? ` · ${transaction.externalId}` : ""}</p></div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <p className={`text-xs font-black tabular-nums ${isCredit ? "text-green-600" : "text-red-600"}`}>{isCredit ? "+" : "−"} {formatCurrency(transaction.amount)}</p>
        {transaction.status === "MATCHED" ? <span className="rotate-[-6deg] rounded-md border border-green-300 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.18em] text-green-700">Conferido</span> : null}
      </div>
    </div>
    {transaction.status === "UNMATCHED" && <div className="mt-3 flex flex-col gap-2 rounded-xl bg-slate-50 p-3 sm:flex-row sm:items-center">
      <select value={entryId} onChange={(event) => setEntryId(event.target.value)} className="h-9 flex-1 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-800 outline-none focus:border-orange-300"><option value="">Casar com um lançamento...</option>{candidates.map((entry) => <option key={entry.id} value={entry.id}>{entry.description} · {formatCurrency(entry.outstandingAmount)}</option>)}</select>
      <div className="flex gap-2"><button type="button" onClick={() => entryId && onMatch(entryId)} disabled={!entryId} className="h-9 rounded-lg bg-green-600 px-3 text-[11px] font-bold text-white hover:bg-green-700 disabled:opacity-50">Casar</button><button type="button" onClick={onIgnore} className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-bold text-slate-500 hover:bg-slate-100">Ignorar</button></div>
    </div>}
  </div>;
}

function NewAccountDialog({ onClose }: { onClose: () => void }) {
  const createAccount = useCreateBankAccount();
  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("BANK");
  const [institution, setInstitution] = useState("");
  const [agency, setAgency] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [openingBalance, setOpeningBalance] = useState("");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    try {
      setError("");
      await createAccount.mutateAsync({
        name: name.trim(),
        type,
        institution: institution.trim() || undefined,
        agency: agency.trim() || undefined,
        accountNumber: accountNumber.trim() || undefined,
        pixKey: pixKey.trim() || undefined,
        openingBalance: openingBalance ? Number(openingBalance) : undefined,
      });
      onClose();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível criar a conta.");
    }
  }

  return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"><div role="dialog" aria-modal="true" className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-wider text-orange-600">Contas &amp; Conciliação</p><h2 className="mt-1 text-lg font-black text-slate-950">Nova conta</h2></div><button type="button" onClick={onClose} aria-label="Fechar" className="flex size-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100"><XCircle className="size-4" /></button></div><form onSubmit={(event) => void submit(event)} className="mt-4 space-y-3"><label className="block text-xs font-bold text-slate-700">Nome da conta<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: Itaú — conta PJ" className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm" /></label><label className="block text-xs font-bold text-slate-700">Tipo<select value={type} onChange={(event) => setType(event.target.value as AccountType)} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm">{(Object.keys(accountTypeLabels) as AccountType[]).map((value) => <option key={value} value={value}>{accountTypeLabels[value]}</option>)}</select></label><div className="grid grid-cols-2 gap-3"><label className="block text-xs font-bold text-slate-700">Instituição<input value={institution} onChange={(event) => setInstitution(event.target.value)} placeholder="Ex.: Itaú" className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm" /></label><label className="block text-xs font-bold text-slate-700">Agência<input value={agency} onChange={(event) => setAgency(event.target.value)} placeholder="0001" className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm" /></label></div><label className="block text-xs font-bold text-slate-700">Número da conta<input value={accountNumber} onChange={(event) => setAccountNumber(event.target.value)} placeholder="00000-0" className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm" /></label>{type === "PIX" && <label className="block text-xs font-bold text-slate-700">Chave Pix<input value={pixKey} onChange={(event) => setPixKey(event.target.value)} placeholder="CNPJ, e-mail ou chave aleatória" className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm" /></label>}<label className="block text-xs font-bold text-slate-700">Saldo inicial<input type="number" step="0.01" value={openingBalance} onChange={(event) => setOpeningBalance(event.target.value)} placeholder="0,00" className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm" /></label>{error && <p className="rounded-xl bg-red-50 p-3 text-xs text-red-700">{error}</p>}<div className="flex justify-end gap-2 pt-2"><button type="button" onClick={onClose} className="h-10 rounded-xl border border-slate-200 px-4 text-xs font-bold text-slate-600 hover:bg-slate-50">Cancelar</button><button type="submit" disabled={!name.trim() || createAccount.isPending} className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 px-4 text-xs font-bold text-white disabled:opacity-50">{createAccount.isPending && <LoaderCircle className="size-3.5 animate-spin" />}Criar conta</button></div></form></div></div>;
}

function EmptyAccounts({ onCreate }: { onCreate: () => void }) {
  return <div className="mt-5 flex min-h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white p-8 text-center"><Landmark className="size-8 text-slate-300" /><h2 className="mt-3 text-sm font-black text-slate-900">Nenhuma conta cadastrada</h2><p className="mt-1 max-w-sm text-xs text-slate-500">Crie caixa, conta bancária, carteira Pix ou cartão para separar o dinheiro e importar extratos.</p><button type="button" onClick={onCreate} className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-orange-600 px-4 text-xs font-bold text-white hover:bg-orange-700"><Plus className="size-4" />Criar primeira conta</button></div>;
}
