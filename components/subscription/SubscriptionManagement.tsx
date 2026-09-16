"use client";

import { useState, type ReactNode } from "react";
import { useI18n, useT } from "@/i18n/provider";
import { ArrowRight, Building2, CalendarDays, Check, CheckCircle2, CreditCard, ExternalLink, FileText, LoaderCircle, ShieldCheck, Sparkles, Users } from "lucide-react";
import { subscriptionPlans } from "./subscription-data";
import ContractAndHistory from "./ContractAndHistory";
import type { SubscriptionOverview, SubscriptionPlan } from "@/types/subscription";
import { formatCurrency, formatDate } from "@/lib/format";
import { addDaysToBrazilDateKey } from "@/lib/timezone";
import { useCancelSubscription, useReactivateSubscription, useSubscription, useSubscriptionCheckout, useSubscriptionRequest } from "@/features/subscription/hooks/useSubscription";


export default function SubscriptionManagement() {
  const t = useT();
  const { locale } = useI18n();
  const { data: overview, isPending: loading, error } = useSubscription();
  const requestMutation = useSubscriptionRequest();
  const checkoutMutation = useSubscriptionCheckout();
  const cancelMutation = useCancelSubscription();
  const saving = requestMutation.isPending || checkoutMutation.isPending || cancelMutation.isPending;
  const [actionError, setActionError] = useState("");
  const [selected, setSelected] = useState<SubscriptionPlan | null>(null);
  const [billingType, setBillingType] = useState<"PIX" | "BOLETO">("PIX");
  const [nextDueDate, setNextDueDate] = useState(defaultDueDate);
  const [couponCode, setCouponCode] = useState("");
  const [message, setMessage] = useState("");

  const errorMessage = actionError || (error instanceof Error ? error.message : "");

  async function requestChange() {
    if (!selected || !overview) return;
    try {
      setActionError("");
      if (selected.id === "enterprise") {
        await requestMutation.mutateAsync({
          action: "CONTACT", targetPlan: "ENTERPRISE", notes: t("billing.toasts.contactNote"),
        });
        setMessage(t("billing.toasts.contactRequested"));
      } else {
        if (!overview.provider.configured) throw new Error(`Configure o ${overview.provider.name} no backend antes de contratar um plano.`);
        const checkout = await checkoutMutation.mutateAsync({
          targetPlan: selected.id.toUpperCase(),
          ...(overview.provider.name === "ASAAS" ? { billingType, nextDueDate, couponCode: couponCode.trim() || undefined } : {}),
        });
        if (checkout.checkoutUrl) window.location.assign(checkout.checkoutUrl);
        else setMessage((checkout.discount ?? 0) > 0 && checkout.firstCharge != null && checkout.recurringPrice != null ? t("billing.manage.couponAppliedLong", { first: formatCurrency(checkout.firstCharge, locale), recurring: formatCurrency(checkout.recurringPrice, locale) }) : `Cobrança criada no ${overview.provider.name}. O plano será ativado assim que o pagamento for confirmado.`);
      }
      setSelected(null);
    } catch (cause) { setActionError(cause instanceof Error ? cause.message : t("billing.errors.contact")); }
  }
  async function requestCancellation() {
    try {
      if (!window.confirm(t("billing.manage.cancelConfirm"))) return;
      await cancelMutation.mutateAsync();
      setMessage(t("billing.manage.cancelScheduled"));
    } catch (cause) { setActionError(cause instanceof Error ? cause.message : t("billing.errors.cancel")); }
  }
  const reactivateMutation = useReactivateSubscription();
  async function reactivateNow() {
    try {
      setActionError(""); setMessage("");
      await reactivateMutation.mutateAsync();
      setMessage(t("billing.manage.cancelledReverted"));
    } catch (cause) { setActionError(cause instanceof Error ? cause.message : t("billing.errors.reactivate")); }
  }

  if (loading && !overview) return <div className="flex min-h-72 items-center justify-center gap-2 text-sm text-slate-500"><LoaderCircle className="size-4 animate-spin" />{t("billing.loading")}</div>;
  if (!overview) return <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">{errorMessage}</div>;
  const currentPlanId = overview.plan.toLowerCase();
  const statusLabel = overview.trialExpired ? t("billing.status.FREE") : t(`billing.status.${subscriptionStatus(overview.status)}`);

  return <section className="space-y-5">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-orange-600">{t("billing.eyebrow")}</p><h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">{t("billing.title")}</h1><p className="mt-1 text-xs text-slate-500">{overview.trialExpired ? "O período completo terminou e sua conta continua ativa no Free." : overview.status === "TRIAL" ? `Você está nos 7 dias grátis${overview.trialDaysRemaining ? ` — restam ${overview.trialDaysRemaining} dia(s)` : ""}.` : t("billing.subtitle")}</p></div><span className={`w-fit rounded-full border px-3 py-1.5 text-[11px] font-bold ${overview.status === "ACTIVE" || overview.plan === "FREE" ? "border-green-200 bg-green-50 text-green-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}>{statusLabel}</span></div>
    {overview.cancellation?.requested && (
      <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <p className="text-xs font-semibold leading-5 text-amber-900"><strong className="font-black">{t("billing.history.cancelScheduled")}</strong> Você mantém o acesso até {overview.cancellation.effectiveAt ? formatDate(overview.cancellation.effectiveAt) : "o fim do ciclo"}{overview.cancellation.daysLeft != null ? ` (${overview.cancellation.daysLeft} dia(s))` : ""} e pode reativar a qualquer momento antes disso.
          </p>
          {overview.cancellation.active ? <button type="button" disabled={saving || reactivateMutation.isPending} onClick={() => void reactivateNow()} className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl bg-[#123d2b] px-4 text-xs font-black text-white hover:bg-[#147a45] disabled:opacity-50">Reativar assinatura</button> : <span className="shrink-0 rounded-full bg-red-100 px-3 py-1 text-[10px] font-bold text-red-700">Ciclo encerrado</span>}
        </div>
      </div>
    )}
    <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]"><div className="rounded-2xl bg-gradient-to-br from-orange-700 via-amber-700 to-yellow-600 p-6 text-white shadow-lg shadow-orange-200"><div className="flex justify-between gap-5"><div><div className="flex items-center gap-2 text-orange-100"><Sparkles className="size-4" /><span className="text-[10px] font-bold uppercase tracking-wider">Plano atual</span></div><h2 className="mt-3 text-2xl font-black">{overview.planName}</h2><p className="mt-1 text-xs text-white/70">{overview.pendingPlan ? `Plano ${overview.pendingPlan} aguardando confirmação do pagamento.` : overview.plan === "FREE" ? t("billing.plan.freeHint") : "Alterações de plano são ativadas após a confirmação do pagamento."}</p></div><div className="text-right"><p className="text-2xl font-black">{overview.price === 0 ? t("billing.plan.free") : formatCurrency(overview.price, locale)}</p>{overview.price === 0 ? <p className="text-[10px] text-white/60">para continuar</p> : <><p className="text-[10px] text-white/60">por mês</p>{overview.billingBreakdown && <p className="mt-2 max-w-44 text-right text-[9px] leading-4 text-white/70">{overview.billingBreakdown.calculationText}</p>}</>}</div></div><div className="mt-6 grid gap-3 border-t border-white/15 pt-5 sm:grid-cols-3"><Detail icon={CalendarDays} label="Próxima cobrança" value={overview.nextBillingAt ? formatDate(overview.nextBillingAt) : overview.plan === "FREE" ? t("billing.plan.noCharge") : t("billing.plan.toDefine")} /><Detail icon={CreditCard} label={t("billing.provider.billing")} value={overview.paymentMethod ?? t("billing.provider.notIntegrated")} /><Detail icon={ShieldCheck} label="Status" value={statusLabel} /></div></div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="text-sm font-bold text-slate-950">Uso do plano</h2><p className="text-[10px] text-slate-400">Calculado na empresa atual</p></div><Users className="size-4 text-orange-500" /></div><div className="mt-4 space-y-4">{overview.usage.map((item) => { const percentage = item.limit ? Math.min(item.current / item.limit * 100, 100) : 0; return <div key={item.key}><div className="flex justify-between text-[10px]"><span className="font-bold text-slate-600">{item.label}</span><span className="text-slate-400">{item.current} de {item.limit ?? "ilimitado"}</span></div><div className="mt-2 h-1.5 rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-orange-600 to-yellow-500" style={{ width: item.limit ? `${percentage}%` : "100%" }} /></div></div>; })}</div></div></div>
{overview && <ContractAndHistory overview={overview} />}
    {errorMessage && <Notice tone="error">{errorMessage}</Notice>}{message && <Notice tone="success"><CheckCircle2 className="size-4 shrink-0" />{message}</Notice>}
    {selected && <CheckoutCard selected={selected} overview={overview} saving={saving} billingType={billingType} nextDueDate={nextDueDate} couponCode={couponCode} onBillingType={setBillingType} onDueDate={setNextDueDate} onCoupon={setCouponCode} onClose={() => setSelected(null)} onConfirm={() => void requestChange()} />}
    <div><p className="text-[11px] font-bold uppercase tracking-wider text-orange-600">{t("billing.manage.availablePlans", { market: `${overview.market?.country ?? "BR"} / ${overview.market?.currency ?? "BRL"}` })}</p><h2 className="mt-1 text-lg font-black text-slate-950">{t("billing.manage.choosePlan")}</h2><div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">{subscriptionPlans.map((plan) => <PlanCard key={plan.id} plan={plan} displayPrice={overview.plans.find((item) => item.id.toLowerCase() === plan.id)?.regionalPrice?.formatted} current={plan.id === currentPlanId && (plan.id === "free" || (overview.status !== "CANCELLED" && overview.provider.subscriptionConnected))} onSelect={setSelected} />)}</div></div>
    <div className="grid gap-4 xl:grid-cols-[1fr_300px]"><div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5"><div><h2 className="text-sm font-bold text-slate-950">Cobranças</h2><p className="text-[10px] text-slate-400">Histórico recebido do Asaas</p></div><FileText className="size-4 text-slate-400" /></div>{overview.invoices.length ? <div className="divide-y divide-slate-100">{overview.invoices.map((invoice) => <div key={invoice.id} className="flex items-center justify-between gap-4 px-5 py-3.5"><div><p className="text-xs font-bold text-slate-800">{formatCurrency(invoice.amount, locale)} · {formatDate(invoice.dueDate)}</p><p className="mt-1 text-[10px] text-slate-400">{invoice.billingType ?? t("billing.provider.billing")} · {t(`billing.history.${invoiceStatus(invoice.status)}`)}</p></div>{(invoice.status === "PENDING" || invoice.status === "OVERDUE") ? (invoice.invoiceUrl || invoice.bankSlipUrl) && <a href={invoice.invoiceUrl ?? invoice.bankSlipUrl!} target="_blank" rel="noreferrer" className="flex items-center gap-1 rounded-lg bg-orange-600 px-2.5 py-1.5 text-[10px] font-black text-white hover:bg-orange-700">2ª via <ExternalLink className="size-3" /></a> : invoice.invoiceUrl && <a href={invoice.invoiceUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] font-bold text-orange-700">Ver fatura <ExternalLink className="size-3" /></a>}</div>)}</div> : <div className="p-8 text-center text-xs text-slate-400">Nenhuma cobrança recebida.</div>}</div><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><CreditCard className="size-5 text-orange-600" /><h2 className="mt-3 text-sm font-bold text-slate-950">Asaas</h2><p className="mt-1 text-[10px] leading-4 text-slate-500">{overview.provider.configured ? `${overview.provider.environment === "sandbox" ? t("billing.provider.sandbox") : t("billing.provider.production")} configurado. Cobranças via PIX e boleto.` : "Integração não configurada. Nenhuma cobrança externa será criada."}</p><div className={`mt-3 rounded-lg px-3 py-2 text-[10px] font-bold ${overview.provider.configured ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>{overview.provider.configured ? "Provedor disponível" : t("billing.provider.credentialPending")}</div><button disabled={saving || !overview.provider.subscriptionConnected || overview.status === "CANCELLED"} onClick={() => void requestCancellation()} className="mt-4 h-10 w-full rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-40">{t("billing.actions.cancel")}</button></div></div>
  </section>;
}

function CheckoutCard({ selected, overview, saving, billingType, nextDueDate, couponCode, onBillingType, onDueDate, onCoupon, onClose, onConfirm }: {
  selected: SubscriptionPlan; overview: SubscriptionOverview; saving: boolean; billingType: "PIX" | "BOLETO";
  nextDueDate: string; couponCode: string; onBillingType: (value: "PIX" | "BOLETO") => void;
  onDueDate: (value: string) => void; onCoupon: (value: string) => void; onClose: () => void; onConfirm: () => void;
}) {
  const t = useT();
  const enterprise = selected.id === "enterprise";
  const brazil = overview.provider.name === "ASAAS";
  const regional = overview.plans.find((item) => item.id.toLowerCase() === selected.id)?.regionalPrice;
  return <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4"><div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-bold text-orange-900">{enterprise ? t("billing.actions.contactSalesQuestion") : `Contratar ${selected.name} pelo ${overview.provider.name}`}</p><p className="mt-1 text-[10px] text-orange-700">{enterprise ? t("billing.toasts.contactHint") : `${regional?.formatted ?? t("billing.plan.pricePending")}/mês · ${overview.market?.country ?? "BR"}. O servidor confirma novamente país, preço, moeda e provedor antes da assinatura.`}</p>{!enterprise && brazil && <div className="mt-3 flex flex-wrap gap-3"><label className="text-[10px] font-bold text-orange-900">Pagamento<select value={billingType} onChange={(event) => onBillingType(event.target.value as "PIX" | "BOLETO")} className="mt-1 block h-10 rounded-xl border border-orange-200 bg-white px-3 text-xs"><option value="PIX">PIX</option><option value="BOLETO">Boleto</option></select></label><label className="text-[10px] font-bold text-orange-900">Primeiro vencimento<input type="date" min={defaultDueDate()} value={nextDueDate} onChange={(event) => onDueDate(event.target.value)} className="mt-1 block h-10 rounded-xl border border-orange-200 bg-white px-3 text-xs" /></label><label className="text-[10px] font-bold text-orange-900">Cupom (opcional)<input value={couponCode} onChange={(event) => onCoupon(event.target.value.toUpperCase())} maxLength={32} placeholder="EX.: BEMVINDO20" className="mt-1 block h-10 rounded-xl border border-orange-200 bg-white px-3 text-xs uppercase" /></label></div>}</div><div className="flex gap-2"><button onClick={onClose} className="h-10 rounded-xl border border-orange-200 bg-white px-4 text-xs font-bold text-orange-700">Voltar</button><button disabled={saving || (!enterprise && (!overview.provider.configured || !regional?.checkoutAvailable))} onClick={onConfirm} className="h-10 rounded-xl bg-orange-600 px-4 text-xs font-bold text-white disabled:opacity-60">{saving ? "Processando..." : enterprise ? "Solicitar contato" : brazil ? "Criar cobrança" : "Continuar para o checkout"}</button></div></div></div>;
}

function Detail({ icon: Icon, label, value }: { icon: typeof CalendarDays; label: string; value: string }) { return <div className="flex items-center gap-3"><div className="flex size-8 items-center justify-center rounded-lg bg-white/10"><Icon className="size-3.5" /></div><div><p className="text-[9px] text-white/55">{label}</p><p className="text-[11px] font-bold">{value}</p></div></div>; }
function PlanCard({ plan, displayPrice, current, onSelect }: { plan: SubscriptionPlan; displayPrice?: string; current: boolean; onSelect: (plan: SubscriptionPlan) => void }) { const t = useT(); const { locale } = useI18n(); const freeUnavailable = plan.id === "free" && !current; return <article className={`flex flex-col rounded-2xl border bg-white p-4 shadow-sm ${plan.highlighted ? "border-orange-300 ring-2 ring-orange-100" : "border-slate-200"}`}><div className="flex justify-between"><div><h3 className="text-sm font-black text-slate-950">{plan.name}</h3><p className="mt-1 min-h-8 text-[10px] leading-4 text-slate-500">{plan.description}</p></div><Building2 className="size-4 text-orange-500" /></div><p className="mt-4 border-b border-slate-100 pb-4 text-lg font-black text-slate-950">{plan.price === null ? t("billing.status.CONTACT") : plan.price === 0 ? t("billing.plan.free") : displayPrice ?? formatCurrency(plan.price, locale)}</p><ul className="my-4 flex-1 space-y-2.5">{plan.features.map((feature) => <li key={feature} className="flex gap-2 text-[10px] leading-4 text-slate-600"><Check className="size-3.5 shrink-0 text-green-500" />{feature}</li>)}</ul><button disabled={current || freeUnavailable} onClick={() => onSelect(plan)} className={`flex h-10 items-center justify-center gap-2 rounded-xl text-xs font-bold ${current ? "bg-orange-50 text-orange-700" : freeUnavailable ? "bg-slate-50 text-slate-400" : "border border-slate-200 text-slate-700 hover:bg-orange-50"}`}>{current ? <><CheckCircle2 className="size-3.5" />Plano atual</> : freeUnavailable ? t("billing.plan.included") : <>{plan.id === "enterprise" ? "Solicitar contato" : `Solicitar ${plan.name}`}<ArrowRight className="size-3.5" /></>}</button></article>; }
function Notice({ tone, children }: { tone: "error" | "success"; children: ReactNode }) { return <div role={tone === "error" ? "alert" : "status"} className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-xs font-semibold ${tone === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-700"}`}>{children}</div>; }

function defaultDueDate() { return addDaysToBrazilDateKey(1); }
function subscriptionStatus(status: SubscriptionOverview["status"]) { return ({ TRIAL: "TRIAL", ACTIVE: "ACTIVE", PENDING: "PENDING", PAST_DUE: "PAST_DUE", CANCELLED: "CANCELLED", CONTACT: "CONTACT" } as Record<string, string>)[status] ?? status; }
function invoiceStatus(status: SubscriptionOverview["invoices"][number]["status"]) { return ({ PENDING: "PENDING", CONFIRMED: "CONFIRMED", RECEIVED: "RECEIVED", OVERDUE: "OVERDUE", REFUNDED: "REFUNDED" } as Record<string, string>)[status] ?? status; }
