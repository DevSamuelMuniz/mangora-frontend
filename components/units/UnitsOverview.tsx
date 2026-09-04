"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightLeft, Boxes, Building2, CircleDollarSign, LoaderCircle, Plus, ReceiptText, Store, TrendingUp, X } from "lucide-react";

import { formatCurrency, formatNumber } from "@/lib/format";
import { useConsolidated, useCreateGroup, useCreateUnit, useSwitchCompany, useUnitGroup } from "@/features/units/hooks/useUnits";
import { useToast } from "@/components/ui/toast";

type Period = "7d" | "30d" | "90d";

export default function UnitsOverview() {
  const router = useRouter();
  const [period, setPeriod] = useState<Period>("30d");
  const { data: group = null, isLoading: groupLoading, error: groupError } = useUnitGroup();
  const { data: consolidated = null, isLoading: consolidatedLoading, error: consolidatedError } = useConsolidated(period);
  const createGroupMutation = useCreateGroup();
  const createUnitMutation = useCreateUnit();
  const switchMutation = useSwitchCompany();
  const loading = groupLoading || consolidatedLoading;
  const saving = createGroupMutation.isPending || createUnitMutation.isPending || switchMutation.isPending;
  const [actionError, setActionError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [unit, setUnit] = useState({ tradeName: "", legalName: "", document: "", email: "", copyCatalog: true, confirmAdditionalCharge: false });
  const toast = useToast();

  const errorMessage = actionError
    || (groupError instanceof Error ? groupError.message : "")
    || (consolidatedError instanceof Error ? consolidatedError.message : "");
  const effectiveGroupName = groupName || (group?.units[0]?.company.tradeName ?? "");

  async function createGroup() {
    setActionError("");
    try {
      await createGroupMutation.mutateAsync({ name: effectiveGroupName });
      toast.success("Grupo de lojas ativado. Agora você pode adicionar até duas unidades.");
    } catch (requestError) { toast.error(requestError instanceof Error ? requestError.message : "Não foi possível ativar o grupo."); }
  }

  async function createUnit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setActionError("");
    try {
      await createUnitMutation.mutateAsync({ ...unit, confirmAdditionalCharge: true, document: unit.document || null });
      setUnit({ tradeName: "", legalName: "", document: "", email: "", copyCatalog: true, confirmAdditionalCharge: false });
      setModalOpen(false); toast.success("Nova loja criada com estoque independente.");
    } catch (requestError) { toast.error(requestError instanceof Error ? requestError.message : "Não foi possível criar a loja."); }
  }

  async function switchUnit(membershipId: string) {
    setActionError("");
    try {
      await switchMutation.mutateAsync({ membershipId });
      router.push("/dashboard?toast=Unidade%20alterada");
      router.refresh();
    } catch (requestError) { toast.error(requestError instanceof Error ? requestError.message : "Não foi possível trocar de loja."); }
  }

  const summary = consolidated?.summary;
  return <section className="space-y-5">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-orange-600">Operação multiunidade</p><h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Lojas e visão consolidada</h1><p className="mt-1 text-xs text-slate-500">A primeira loja está incluída. Cada loja adicional acrescenta uma mensalidade do plano atual à mesma assinatura.</p></div>
      <div className="flex gap-2"><select value={period} onChange={(event) => setPeriod(event.target.value as Period)} className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-xs font-bold text-slate-700 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"><option value="7d">Últimos 7 dias</option><option value="30d">Últimos 30 dias</option><option value="90d">Últimos 90 dias</option></select>{group?.canCreateUnit && <button type="button" onClick={() => setModalOpen(true)} className="inline-flex h-11 items-center gap-2 rounded-xl bg-orange-600 px-4 text-xs font-black text-white shadow-lg shadow-orange-200 transition hover:bg-orange-700"><Plus className="size-4" />Adicionar loja</button>}</div>
    </div>

    {errorMessage && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-800">{errorMessage}</div>}

    {!loading && group && !group.group && <article className="overflow-hidden rounded-[1.75rem] border border-[#174c36]/20 bg-[#174c36] p-6 text-white shadow-xl shadow-green-950/10 sm:p-8"><div className="grid gap-6 lg:grid-cols-[1fr_420px] lg:items-center"><div><span className="inline-flex rounded-full bg-yellow-300 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-green-950">Pronto para expandir</span><h2 className="mt-4 max-w-xl text-2xl font-black sm:text-3xl">Transforme sua empresa atual na Loja 1.</h2><p className="mt-2 max-w-xl text-sm leading-6 text-green-50/80">Cada loja terá caixa, vendas e estoque próprios. A visão consolidada reunirá os indicadores sem misturar a operação.</p></div><div className="rounded-2xl border border-white/15 bg-white/10 p-4"><label className="text-[10px] font-bold uppercase tracking-wider text-yellow-200">Nome do grupo</label><input value={effectiveGroupName} onChange={(event) => setGroupName(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-white/20 bg-white px-3 text-sm font-bold text-slate-950 outline-none focus:border-yellow-300" placeholder="Ex.: Grupo Mangora" /><button type="button" disabled={saving || effectiveGroupName.trim().length < 2} onClick={() => void createGroup()} className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-yellow-300 text-xs font-black text-green-950 transition hover:bg-yellow-200 disabled:opacity-50">{saving && <LoaderCircle className="size-4 animate-spin" />}Ativar gestão de lojas</button></div></div></article>}

    {group?.group && <>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric icon={CircleDollarSign} label="Faturamento consolidado" value={formatCurrency(summary?.revenue ?? 0)} tone="green" /><Metric icon={ReceiptText} label="Vendas do grupo" value={formatNumber(summary?.sales ?? 0)} tone="orange" /><Metric icon={TrendingUp} label="Ticket médio" value={formatCurrency(summary?.averageTicket ?? 0)} tone="yellow" /><Metric icon={Boxes} label="Estoque total" value={`${formatNumber(summary?.inventoryUnits ?? 0)} un.`} tone="amber" /></div>
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-sm font-black text-slate-950">{group.group.name}</h2><p className="mt-1 text-[10px] text-slate-500">{group.units.length} de {group.limit ?? "quantidade combinada"} lojas configuradas · {consolidated?.label}</p></div><span className="rounded-full bg-green-100 px-3 py-1 text-[10px] font-black text-green-800">Dados separados por unidade</span></div><div className="mt-4 grid gap-3 lg:grid-cols-3">{group.units.map((item) => { const metrics = consolidated?.units.find((entry) => entry.id === item.company.id); return <div key={item.company.id} className={`rounded-2xl border p-4 ${item.current ? "border-orange-300 bg-orange-50" : "border-slate-200 bg-slate-50"}`}><div className="flex items-start justify-between gap-3"><div className={`flex size-10 items-center justify-center rounded-xl ${item.current ? "bg-orange-600 text-white" : "bg-white text-green-700"}`}><Store className="size-4" /></div><span className="rounded-full bg-white px-2 py-1 text-[9px] font-black text-slate-600">{item.company.unitCode ?? "UNIDADE"}</span></div><h3 className="mt-4 text-sm font-black text-slate-950">{item.company.tradeName}</h3><p className="mt-1 text-[10px] text-slate-500">{item.current ? "Ambiente atual" : "Ambiente independente"}</p><div className="mt-4 grid grid-cols-2 gap-2"><Small label="Faturamento" value={formatCurrency(metrics?.revenue ?? 0)} /><Small label="Vendas" value={formatNumber(metrics?.sales ?? 0)} /><Small label="A receber" value={formatCurrency(metrics?.receivable ?? 0)} /><Small label="Estoque" value={`${formatNumber(metrics?.inventoryUnits ?? 0)} un.`} /></div>{!item.current && <button type="button" disabled={saving} onClick={() => void switchUnit(item.membershipId)} className="mt-4 flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-orange-300 bg-white text-[10px] font-black text-orange-700 hover:bg-orange-100"><ArrowRightLeft className="size-3.5" />Acessar esta loja</button>}</div>; })}</div></article>
    </>}

    {loading && <div className="flex min-h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white"><LoaderCircle className="size-5 animate-spin text-orange-600" /><span className="ml-2 text-xs font-bold text-slate-600">Consolidando as lojas...</span></div>}

    {modalOpen && <div className="fixed inset-0 z-[90] flex items-end justify-center bg-green-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-5"><button type="button" aria-label="Fechar formulário" onClick={() => setModalOpen(false)} className="absolute inset-0" /><form onSubmit={(event) => void createUnit(event)} className="relative w-full max-w-xl rounded-t-[1.75rem] border border-green-900/20 bg-[#fff8eb] p-6 shadow-2xl sm:rounded-[1.75rem]"><div className="flex items-start justify-between"><div><p className="text-[10px] font-black uppercase tracking-wider text-orange-600">Nova unidade</p><h2 className="mt-1 text-xl font-black text-slate-950">Adicionar loja ao grupo</h2></div><button type="button" onClick={() => setModalOpen(false)} className="flex size-9 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-600"><X className="size-4" /></button></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><Field label="Nome da loja *" value={unit.tradeName} onChange={(value) => setUnit((current) => ({ ...current, tradeName: value }))} /><Field label="Razão social" value={unit.legalName} onChange={(value) => setUnit((current) => ({ ...current, legalName: value }))} /><Field label="CNPJ (opcional)" value={unit.document} onChange={(value) => setUnit((current) => ({ ...current, document: value.replace(/\D/g, "").slice(0, 14) }))} /><Field label="E-mail" type="email" value={unit.email} onChange={(value) => setUnit((current) => ({ ...current, email: value }))} /></div><label className="mt-4 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-3"><input type="checkbox" checked={unit.copyCatalog} onChange={(event) => setUnit((current) => ({ ...current, copyCatalog: event.target.checked }))} className="mt-0.5 size-4 accent-orange-600" /><span><strong className="block text-xs text-green-950">Copiar catálogo da loja atual</strong><span className="mt-0.5 block text-[10px] text-green-700">Produtos e preços são copiados; o saldo de estoque começa zerado.</span></span></label><label className="mt-4 flex items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 p-3"><input type="checkbox" checked={unit.confirmAdditionalCharge} onChange={(event) => setUnit((current) => ({ ...current, confirmAdditionalCharge: event.target.checked }))} className="mt-0.5 size-4 accent-orange-600" /><span><strong className="block text-xs text-orange-950">Confirmo o acréscimo mensal</strong><span className="mt-0.5 block text-[10px] text-orange-800">A assinatura passará de {group?.currentMonthlyPrice === null ? "valor combinado" : formatCurrency(group?.currentMonthlyPrice ?? 0)} para {group?.nextMonthlyPrice === null ? "valor combinado" : formatCurrency(group?.nextMonthlyPrice ?? 0)} por mês.</span></span></label><button type="submit" disabled={saving || unit.tradeName.trim().length < 2 || !unit.confirmAdditionalCharge} className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-orange-600 text-xs font-black text-white shadow-lg shadow-orange-200 hover:bg-orange-700 disabled:opacity-50">{saving && <LoaderCircle className="size-4 animate-spin" />}Adicionar loja à assinatura</button></form></div>}
  </section>;
}

function Metric({ icon: Icon, label, value, tone }: { icon: typeof Building2; label: string; value: string; tone: "green" | "orange" | "yellow" | "amber" }) { const colors = { green: "bg-green-100 text-green-700", orange: "bg-orange-100 text-orange-700", yellow: "bg-yellow-100 text-yellow-700", amber: "bg-amber-100 text-amber-700" }; return <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className={`flex size-9 items-center justify-center rounded-xl ${colors[tone]}`}><Icon className="size-4" /></div><p className="mt-4 text-[10px] font-semibold text-slate-500">{label}</p><p className="mt-1 truncate text-xl font-black text-slate-950">{value}</p></article>; }
function Small({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-slate-200 bg-white p-2.5"><p className="text-[9px] font-semibold text-slate-500">{label}</p><p className="mt-1 truncate text-xs font-black text-slate-900">{value}</p></div>; }
function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) { return <label className="text-[10px] font-bold text-slate-700">{label}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100" /></label>; }
