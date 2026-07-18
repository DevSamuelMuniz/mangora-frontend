"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowDownToLine, ArrowUpFromLine, Banknote, CheckCircle2, LoaderCircle, LockKeyhole, PlusCircle, RefreshCw, WalletCards } from "lucide-react";
import { apiRequest } from "@/lib/api/client";
import type { CashMovementType, CashRegister, CashRegisterHistory } from "@/types/cash-register";

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const dateTime = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });
const movementLabels: Record<CashMovementType, string> = { OPENING: "Abertura", SUPPLY: "Suprimento", WITHDRAWAL: "Sangria", SALE: "Venda em dinheiro", SALE_REVERSAL: "Estorno de venda" };

export default function CashRegisterPanel() {
  const [register, setRegister] = useState<CashRegister | null>(null);
  const [history, setHistory] = useState<CashRegisterHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [action, setAction] = useState<"SUPPLY" | "WITHDRAWAL" | "CLOSE" | null>(null);

  async function refresh() {
    const [current, previous] = await Promise.all([apiRequest<CashRegister | null>("/cash-registers/current"), apiRequest<CashRegisterHistory[]>("/cash-registers/history")]);
    setRegister(current); setHistory(previous);
  }

  useEffect(() => {
    let active = true;
    void Promise.all([apiRequest<CashRegister | null>("/cash-registers/current"), apiRequest<CashRegisterHistory[]>("/cash-registers/history")])
      .then(([current, previous]) => { if (active) { setRegister(current); setHistory(previous); } })
      .catch((cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : "Não foi possível carregar o caixa."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const totals = useMemo(() => ({
    sales: register?.movements.filter((item) => item.type === "SALE").reduce((sum, item) => sum + item.amount, 0) ?? 0,
    supplies: register?.movements.filter((item) => item.type === "SUPPLY").reduce((sum, item) => sum + item.amount, 0) ?? 0,
    withdrawals: Math.abs(register?.movements.filter((item) => item.type === "WITHDRAWAL" || item.type === "SALE_REVERSAL").reduce((sum, item) => sum + item.amount, 0) ?? 0),
  }), [register]);

  async function openRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const data = new FormData(event.currentTarget);
    await execute(async () => { await apiRequest("/cash-registers/open", { method: "POST", body: JSON.stringify({ openingAmount: Number(data.get("openingAmount")), notes: data.get("notes") }) }); await refresh(); setFeedback("Caixa aberto com sucesso."); });
  }

  async function submitAction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!action) return; const data = new FormData(event.currentTarget);
    await execute(async () => {
      if (action === "CLOSE") await apiRequest("/cash-registers/close", { method: "POST", body: JSON.stringify({ actualAmount: Number(data.get("actualAmount")), notes: data.get("notes") }) });
      else await apiRequest("/cash-registers/movements", { method: "POST", body: JSON.stringify({ type: action, amount: Number(data.get("amount")), description: data.get("description") }) });
      await refresh(); setAction(null); setFeedback(action === "CLOSE" ? "Caixa fechado e conferido." : "Movimentação registrada.");
    });
  }

  async function execute(operation: () => Promise<void>) {
    try { setBusy(true); setError(""); setFeedback(""); await operation(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível concluir a operação."); }
    finally { setBusy(false); }
  }

  if (loading) return <div className="flex min-h-72 items-center justify-center gap-2 text-sm text-slate-500"><LoaderCircle className="size-4 animate-spin text-violet-600" />Carregando caixa...</div>;

  return <section>
    <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-violet-600">Operação</p><h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">Controle de caixa</h1><p className="mt-1 text-xs text-slate-500">Abertura, movimentações em dinheiro e conferência do turno.</p></div>{register && <span className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-[10px] font-bold text-emerald-700"><span className="size-2 rounded-full bg-emerald-500" />Caixa aberto</span>}</div>

    {error && <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">{error}</div>}
    {feedback && <div role="status" className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-700"><CheckCircle2 className="size-4" />{feedback}</div>}

    {!register ? <div className="mt-5 grid items-start gap-4 lg:grid-cols-[1fr_0.75fr]"><form onSubmit={openRegister} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-3 border-b border-slate-100 pb-4"><div className="flex size-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600"><Banknote className="size-4" /></div><div><h2 className="text-sm font-bold text-slate-950">Abrir caixa</h2><p className="text-[10px] text-slate-400">Informe o dinheiro disponível no início do turno.</p></div></div><label htmlFor="openingAmount" className="mt-4 block text-xs font-bold text-slate-700">Saldo inicial</label><div className="relative mt-1.5"><span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">R$</span><input id="openingAmount" name="openingAmount" type="number" required min="0" step="0.01" defaultValue="0" className={`${inputClass} pl-10`} /></div><label htmlFor="openingNotes" className="mt-4 block text-xs font-bold text-slate-700">Observação (opcional)</label><textarea id="openingNotes" name="notes" rows={3} maxLength={500} className={textareaClass} /><button disabled={busy} className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-sm font-bold text-white disabled:opacity-60">{busy ? <LoaderCircle className="size-4 animate-spin" /> : <PlusCircle className="size-4" />}Abrir caixa</button></form><div className="rounded-2xl border border-violet-100 bg-violet-50 p-5"><LockKeyhole className="size-5 text-violet-600" /><h2 className="mt-3 text-sm font-black text-violet-950">Caixa fechado</h2><p className="mt-2 text-xs leading-5 text-violet-700">Vendas em dinheiro e recebimentos de pedidos exigem um caixa aberto. Pagamentos eletrônicos continuam disponíveis normalmente.</p></div></div> : <>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric icon={WalletCards} label="Saldo esperado" value={register.expectedAmount} tone="violet" /><Metric icon={Banknote} label="Vendas em dinheiro" value={totals.sales} tone="green" /><Metric icon={ArrowDownToLine} label="Suprimentos" value={totals.supplies} tone="cyan" /><Metric icon={ArrowUpFromLine} label="Saídas e estornos" value={totals.withdrawals} tone="red" /></div>
      <div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => setAction("SUPPLY")} className={secondaryButton}><ArrowDownToLine className="size-4" />Adicionar suprimento</button><button type="button" onClick={() => setAction("WITHDRAWAL")} className={secondaryButton}><ArrowUpFromLine className="size-4" />Registrar sangria</button><button type="button" onClick={() => setAction("CLOSE")} className="flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-4 text-xs font-bold text-white"><LockKeyhole className="size-4" />Fechar caixa</button></div>
      {action && <form onSubmit={submitAction} className="mt-4 rounded-2xl border border-violet-200 bg-violet-50/50 p-4"><div className="flex items-center justify-between"><div><h2 className="text-sm font-black text-slate-900">{action === "CLOSE" ? "Conferência e fechamento" : action === "SUPPLY" ? "Novo suprimento" : "Nova sangria"}</h2><p className="mt-1 text-[10px] text-slate-500">{action === "CLOSE" ? `O sistema espera ${money.format(register.expectedAmount)}.` : "A movimentação será vinculada ao caixa atual."}</p></div><button type="button" onClick={() => setAction(null)} className="text-xs font-bold text-slate-500">Cancelar</button></div><div className="mt-3 grid gap-3 sm:grid-cols-[180px_1fr_auto]">{action === "CLOSE" ? <><input aria-label="Valor contado" name="actualAmount" type="number" min="0" step="0.01" required placeholder="Valor contado" className={inputClass} /><input aria-label="Observação do fechamento" name="notes" maxLength={500} placeholder="Observação (opcional)" className={inputClass} /></> : <><input aria-label="Valor da movimentação" name="amount" type="number" min="0.01" step="0.01" required placeholder="Valor" className={inputClass} /><input aria-label="Descrição da movimentação" name="description" required minLength={3} maxLength={180} placeholder="Descrição" className={inputClass} /></>}<button disabled={busy} className="h-11 rounded-xl bg-violet-600 px-5 text-xs font-bold text-white disabled:opacity-60">Confirmar</button></div></form>}
      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="text-sm font-bold text-slate-950">Movimentações do turno</h2><p className="mt-0.5 text-[10px] text-slate-400">Aberto por {register.openedByName} em {dateTime.format(new Date(register.openedAt))}</p></div><RefreshCw className="size-4 text-slate-300" /></div><div className="divide-y divide-slate-100">{register.movements.map((movement) => <div key={movement.id} className="flex items-center gap-3 px-5 py-3"><span className={`flex size-8 items-center justify-center rounded-xl ${movement.amount >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>{movement.amount >= 0 ? <ArrowDownToLine className="size-3.5" /> : <ArrowUpFromLine className="size-3.5" />}</span><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-slate-800">{movement.description}</p><p className="mt-0.5 text-[9px] text-slate-400">{movementLabels[movement.type]} · {movement.createdByName} · {dateTime.format(new Date(movement.createdAt))}</p></div><strong className={`text-xs ${movement.amount >= 0 ? "text-emerald-600" : "text-red-600"}`}>{movement.amount >= 0 ? "+ " : "- "}{money.format(Math.abs(movement.amount))}</strong></div>)}</div></div>
    </>}

    <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 px-5 py-4"><h2 className="text-sm font-bold text-slate-950">Histórico de caixas</h2><p className="mt-0.5 text-[10px] text-slate-400">Últimas aberturas e conferências da empresa.</p></div><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left"><thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-400"><tr><th className="px-5 py-3">Abertura</th><th className="px-4 py-3">Operador</th><th className="px-4 py-3">Esperado</th><th className="px-4 py-3">Contado</th><th className="px-5 py-3">Diferença</th></tr></thead><tbody className="divide-y divide-slate-100">{history.filter((item) => item.status === "CLOSED").map((item) => <tr key={item.id}><td className="px-5 py-3 text-xs text-slate-600">{dateTime.format(new Date(item.openedAt))}</td><td className="px-4 py-3 text-xs font-bold text-slate-700">{item.openedByName}</td><td className="px-4 py-3 text-xs">{money.format(item.expectedAmount ?? 0)}</td><td className="px-4 py-3 text-xs">{money.format(item.actualAmount ?? 0)}</td><td className={`px-5 py-3 text-xs font-black ${(item.difference ?? 0) === 0 ? "text-emerald-600" : "text-red-600"}`}>{money.format(item.difference ?? 0)}</td></tr>)}{!history.some((item) => item.status === "CLOSED") && <tr><td colSpan={5} className="px-5 py-8 text-center text-xs text-slate-400">Nenhum caixa fechado ainda.</td></tr>}</tbody></table></div></div>
  </section>;
}

function Metric({ icon: Icon, label, value, tone }: { icon: typeof Banknote; label: string; value: number; tone: "violet" | "green" | "cyan" | "red" }) { const colors = { violet: "bg-violet-50 text-violet-600", green: "bg-emerald-50 text-emerald-600", cyan: "bg-cyan-50 text-cyan-600", red: "bg-red-50 text-red-600" }; return <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className={`flex size-9 items-center justify-center rounded-xl ${colors[tone]}`}><Icon className="size-4" /></div><p className="mt-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 text-xl font-black text-slate-950">{money.format(value)}</p></div>; }
const inputClass = "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-950 outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100";
const textareaClass = "mt-1.5 w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100";
const secondaryButton = "flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 hover:border-violet-200 hover:text-violet-700";
