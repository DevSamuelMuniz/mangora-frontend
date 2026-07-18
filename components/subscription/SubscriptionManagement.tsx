"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ArrowRight, Building2, CalendarDays, Check, CheckCircle2, CreditCard, ExternalLink, FileText, LoaderCircle, ShieldCheck, Sparkles, Users } from "lucide-react";
import { apiRequest } from "@/lib/api/client";
import { subscriptionPlans } from "./subscription-data";
import type { SubscriptionOverview, SubscriptionPlan } from "@/types/subscription";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default function SubscriptionManagement() {
  const [overview, setOverview] = useState<SubscriptionOverview | null>(null);
  const [selected, setSelected] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [billingType, setBillingType] = useState<"PIX" | "BOLETO">("PIX");
  const [nextDueDate, setNextDueDate] = useState(defaultDueDate);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    void apiRequest<SubscriptionOverview>("/subscription")
      .then((data) => { if (active) setOverview(data); })
      .catch((cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : "Não foi possível carregar a assinatura."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  async function loadOverview() {
    try { setLoading(true); setOverview(await apiRequest<SubscriptionOverview>("/subscription")); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível carregar a assinatura."); }
    finally { setLoading(false); }
  }
  async function requestChange() {
    if (!selected || !overview) return;
    try {
      setSaving(true); setError("");
      if (selected.id === "enterprise") {
        await apiRequest("/subscription/requests", { method: "POST", body: JSON.stringify({
          action: "CONTACT", targetPlan: "ENTERPRISE", notes: "Solicitação de contato comercial pelo painel.",
        }) });
        setMessage("Solicitação de contato comercial registrada.");
      } else {
        if (!overview.provider.configured) throw new Error("Configure o Asaas no backend antes de contratar um plano.");
        await apiRequest("/subscription/checkout", { method: "POST", body: JSON.stringify({
          targetPlan: selected.id.toUpperCase(), billingType, nextDueDate,
        }) });
        setMessage("Cobrança criada no Asaas. O plano será ativado assim que o pagamento for confirmado.");
      }
      setSelected(null);
      await loadOverview();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível registrar a solicitação."); }
    finally { setSaving(false); }
  }
  async function requestCancellation() {
    try {
      setSaving(true); setError("");
      if (!window.confirm("Cancelar a assinatura recorrente no Asaas? Novas cobranças deixarão de ser geradas.")) return;
      await apiRequest("/subscription/cancel", { method: "POST" });
      setMessage("Assinatura recorrente cancelada no Asaas."); await loadOverview();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível cancelar a assinatura."); }
    finally { setSaving(false); }
  }

  if (loading && !overview) return <div className="flex min-h-72 items-center justify-center gap-2 text-sm text-slate-500"><LoaderCircle className="size-4 animate-spin" />Carregando assinatura...</div>;
  if (!overview) return <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">{error}</div>;
  const currentPlanId = overview.plan.toLowerCase();

  return <section className="space-y-5">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-violet-600">Administração</p><h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">Assinatura e planos</h1><p className="mt-1 text-xs text-slate-500">Acompanhe o estado real, o uso e as cobranças da assinatura.</p></div><span className={`w-fit rounded-full border px-3 py-1.5 text-[11px] font-bold ${overview.status === "ACTIVE" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}>{subscriptionStatus(overview.status)}</span></div>
    <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]"><div className="rounded-2xl bg-gradient-to-br from-violet-700 via-indigo-700 to-cyan-600 p-6 text-white shadow-lg shadow-violet-200"><div className="flex justify-between gap-5"><div><div className="flex items-center gap-2 text-violet-100"><Sparkles className="size-4" /><span className="text-[10px] font-bold uppercase tracking-wider">Plano atual</span></div><h2 className="mt-3 text-2xl font-black">{overview.planName}</h2><p className="mt-1 text-xs text-white/70">{overview.pendingPlan ? `Plano ${overview.pendingPlan} aguardando confirmação do pagamento.` : "Alterações de plano são ativadas após a confirmação do pagamento."}</p></div><div className="text-right"><p className="text-2xl font-black">{currency.format(overview.price)}</p><p className="text-[10px] text-white/60">por mês</p></div></div><div className="mt-6 grid gap-3 border-t border-white/15 pt-5 sm:grid-cols-3"><Detail icon={CalendarDays} label="Próxima cobrança" value={overview.nextBillingAt ? formatDate(overview.nextBillingAt) : "A definir"} /><Detail icon={CreditCard} label="Pagamento" value={overview.paymentMethod ?? "Não integrado"} /><Detail icon={ShieldCheck} label="Status" value={subscriptionStatus(overview.status)} /></div></div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="text-sm font-bold text-slate-950">Uso do plano</h2><p className="text-[10px] text-slate-400">Calculado na empresa atual</p></div><Users className="size-4 text-violet-500" /></div><div className="mt-4 space-y-4">{overview.usage.map((item) => { const percentage = item.limit ? Math.min(item.current / item.limit * 100, 100) : 0; return <div key={item.key}><div className="flex justify-between text-[10px]"><span className="font-bold text-slate-600">{item.label}</span><span className="text-slate-400">{item.current} de {item.limit ?? "ilimitado"}</span></div><div className="mt-2 h-1.5 rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-cyan-500" style={{ width: item.limit ? `${percentage}%` : "100%" }} /></div></div>; })}</div></div></div>
    {error && <Notice tone="error">{error}</Notice>}{message && <Notice tone="success"><CheckCircle2 className="size-4 shrink-0" />{message}</Notice>}
    {selected && <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4"><div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-bold text-violet-900">{selected.id === "enterprise" ? "Solicitar contato sobre Enterprise?" : `Contratar ${selected.name} pelo Asaas`}</p><p className="mt-1 text-[10px] text-violet-600">{selected.id === "enterprise" ? "Nossa equipe comercial entrará em contato." : overview.provider.configured ? "O plano atual só será alterado após a confirmação do pagamento." : "A integração ainda precisa ser configurada no backend."}</p>{selected.id !== "enterprise" && <div className="mt-3 flex flex-wrap gap-3"><label className="text-[10px] font-bold text-violet-900">Pagamento<select value={billingType} onChange={(event) => setBillingType(event.target.value as "PIX" | "BOLETO")} className="mt-1 block h-10 rounded-xl border border-violet-200 bg-white px-3 text-xs"><option value="PIX">PIX</option><option value="BOLETO">Boleto</option></select></label><label className="text-[10px] font-bold text-violet-900">Primeiro vencimento<input type="date" min={defaultDueDate()} value={nextDueDate} onChange={(event) => setNextDueDate(event.target.value)} className="mt-1 block h-10 rounded-xl border border-violet-200 bg-white px-3 text-xs" /></label></div>}</div><div className="flex gap-2"><button onClick={() => setSelected(null)} className="h-10 rounded-xl border border-violet-200 bg-white px-4 text-xs font-bold text-violet-700">Voltar</button><button disabled={saving || (selected.id !== "enterprise" && !overview.provider.configured)} onClick={() => void requestChange()} className="h-10 rounded-xl bg-violet-600 px-4 text-xs font-bold text-white disabled:opacity-60">{saving ? "Processando..." : selected.id === "enterprise" ? "Solicitar contato" : "Criar cobrança"}</button></div></div></div>}
    <div><p className="text-[11px] font-bold uppercase tracking-wider text-violet-600">Planos disponíveis</p><h2 className="mt-1 text-lg font-black text-slate-950">Escolha o plano ideal</h2><div className="mt-4 grid gap-4 md:grid-cols-2 2xl:grid-cols-4">{subscriptionPlans.map((plan) => <PlanCard key={plan.id} plan={plan} current={plan.id === currentPlanId && overview.status !== "CANCELLED" && overview.provider.subscriptionConnected} onSelect={setSelected} />)}</div></div>
    <div className="grid gap-4 xl:grid-cols-[1fr_300px]"><div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5"><div><h2 className="text-sm font-bold text-slate-950">Cobranças</h2><p className="text-[10px] text-slate-400">Histórico recebido do Asaas</p></div><FileText className="size-4 text-slate-400" /></div>{overview.invoices.length ? <div className="divide-y divide-slate-100">{overview.invoices.map((invoice) => <div key={invoice.id} className="flex items-center justify-between gap-4 px-5 py-3.5"><div><p className="text-xs font-bold text-slate-800">{currency.format(invoice.amount)} · {formatDate(invoice.dueDate)}</p><p className="mt-1 text-[10px] text-slate-400">{invoice.billingType ?? "Pagamento"} · {invoiceStatus(invoice.status)}</p></div>{invoice.invoiceUrl && <a href={invoice.invoiceUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] font-bold text-violet-700">Abrir <ExternalLink className="size-3" /></a>}</div>)}</div> : <div className="p-8 text-center text-xs text-slate-400">Nenhuma cobrança recebida.</div>}</div><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><CreditCard className="size-5 text-violet-600" /><h2 className="mt-3 text-sm font-bold text-slate-950">Asaas</h2><p className="mt-1 text-[10px] leading-4 text-slate-500">{overview.provider.configured ? `${overview.provider.environment === "sandbox" ? "Sandbox" : "Produção"} configurado. Cobranças via PIX e boleto.` : "Integração não configurada. Nenhuma cobrança externa será criada."}</p><div className={`mt-3 rounded-lg px-3 py-2 text-[10px] font-bold ${overview.provider.configured ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{overview.provider.configured ? "Provedor disponível" : "Credencial pendente"}</div><button disabled={saving || !overview.provider.subscriptionConnected || overview.status === "CANCELLED"} onClick={() => void requestCancellation()} className="mt-4 h-10 w-full rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-40">Cancelar assinatura</button></div></div>
  </section>;
}

function Detail({ icon: Icon, label, value }: { icon: typeof CalendarDays; label: string; value: string }) { return <div className="flex items-center gap-3"><div className="flex size-8 items-center justify-center rounded-lg bg-white/10"><Icon className="size-3.5" /></div><div><p className="text-[9px] text-white/55">{label}</p><p className="text-[11px] font-bold">{value}</p></div></div>; }
function PlanCard({ plan, current, onSelect }: { plan: SubscriptionPlan; current: boolean; onSelect: (plan: SubscriptionPlan) => void }) { return <article className={`flex flex-col rounded-2xl border bg-white p-4 shadow-sm ${plan.highlighted ? "border-violet-300 ring-2 ring-violet-100" : "border-slate-200"}`}><div className="flex justify-between"><div><h3 className="text-sm font-black text-slate-950">{plan.name}</h3><p className="mt-1 min-h-8 text-[10px] leading-4 text-slate-500">{plan.description}</p></div><Building2 className="size-4 text-violet-500" /></div><p className="mt-4 border-b border-slate-100 pb-4 text-lg font-black text-slate-950">{plan.price === null ? "Sob consulta" : currency.format(plan.price)}</p><ul className="my-4 flex-1 space-y-2.5">{plan.features.map((feature) => <li key={feature} className="flex gap-2 text-[10px] leading-4 text-slate-600"><Check className="size-3.5 shrink-0 text-emerald-500" />{feature}</li>)}</ul><button disabled={current} onClick={() => onSelect(plan)} className={`flex h-10 items-center justify-center gap-2 rounded-xl text-xs font-bold ${current ? "bg-violet-50 text-violet-700" : "border border-slate-200 text-slate-700 hover:bg-violet-50"}`}>{current ? <><CheckCircle2 className="size-3.5" />Plano atual</> : <>{plan.id === "enterprise" ? "Solicitar contato" : `Solicitar ${plan.name}`}<ArrowRight className="size-3.5" /></>}</button></article>; }
function Notice({ tone, children }: { tone: "error" | "success"; children: ReactNode }) { return <div role={tone === "error" ? "alert" : "status"} className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-xs font-semibold ${tone === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>{children}</div>; }
function formatDate(value: string) { return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(value)); }
function defaultDueDate() { const value = new Date(); value.setDate(value.getDate() + 1); return value.toISOString().slice(0, 10); }
function subscriptionStatus(status: SubscriptionOverview["status"]) { return { ACTIVE: "Assinatura ativa", PENDING: "Aguardando pagamento", PAST_DUE: "Pagamento atrasado", CANCELLED: "Assinatura cancelada" }[status]; }
function invoiceStatus(status: SubscriptionOverview["invoices"][number]["status"]) { return { PENDING: "Pendente", CONFIRMED: "Confirmada", RECEIVED: "Recebida", OVERDUE: "Atrasada", REFUNDED: "Estornada", CANCELLED: "Cancelada" }[status]; }
