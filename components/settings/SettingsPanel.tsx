"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState, type ReactNode } from "react";
import { Activity, Bell, Building2, CheckCircle2, ExternalLink, Globe2, KeyRound, LoaderCircle, Monitor, RefreshCw, Save, ShieldCheck, ShoppingCart, SlidersHorizontal, type LucideIcon } from "lucide-react";
import { apiRequest } from "@/lib/api/client";
import type { CompanySettings, SettingsTab } from "@/types/settings";

const tabs: { id: SettingsTab; label: string; description: string; icon: LucideIcon }[] = [
  { id: "company", label: "Empresa", description: "Dados cadastrais", icon: Building2 },
  { id: "preferences", label: "Preferências", description: "Idioma e operação", icon: SlidersHorizontal },
  { id: "sales", label: "Vendas", description: "Regras comerciais", icon: ShoppingCart },
  { id: "notifications", label: "Notificações", description: "Alertas e resumos", icon: Bell },
  { id: "online", label: "Página online", description: "Catálogo público", icon: Globe2 },
  { id: "security", label: "Segurança", description: "Sessão e acesso", icon: ShieldCheck },
];
const segments = [
  ["RETAIL", "Loja ou comércio"], ["RESTAURANT", "Restaurante"], ["SNACK_BAR", "Lanchonete"],
  ["MARKET", "Mercado ou minimercado"], ["BAKERY", "Padaria"], ["SALON", "Salão de beleza"],
  ["BARBERSHOP", "Barbearia"], ["TECHNICAL_ASSISTANCE", "Assistência técnica"],
  ["SERVICE_PROVIDER", "Prestador de serviços"], ["OTHER", "Outro segmento"],
];

export default function SettingsPanel() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("company");
  const [company, setCompany] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;
    void apiRequest<CompanySettings>("/companies/current")
      .then((data) => { if (active) setCompany(data); })
      .catch((cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : "Não foi possível carregar as configurações."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    let payload: Record<string, unknown>;
    if (activeTab === "company") payload = {
      legalName: data.get("legalName"), tradeName: data.get("tradeName"), document: data.get("document"),
      segment: data.get("segment"), email: data.get("email"), phone: data.get("phone"),
      postalCode: data.get("postalCode"), street: data.get("street"), number: data.get("number"),
      city: data.get("city"), state: data.get("state"),
    };
    else if (activeTab === "preferences") payload = { timezone: data.get("timezone") };
    else if (activeTab === "sales") payload = {
      defaultPayment: data.get("defaultPayment"), maximumDiscount: Number(data.get("maximumDiscount")),
      requireCustomer: data.get("requireCustomer") === "on", allowPendingSales: data.get("allowPendingSales") === "on",
    };
    else if (activeTab === "notifications") payload = {
      lowStockNotification: data.get("lowStockNotification") === "on",
      overdueAccountNotification: data.get("overdueAccountNotification") === "on",
      saleNotification: data.get("saleNotification") === "on",
      summaryEmail: data.get("summaryEmail"), summaryFrequency: data.get("summaryFrequency"),
    };
    else if (activeTab === "online") payload = {
      publicPageEnabled: data.get("publicPageEnabled") === "on",
      publicDescription: data.get("publicDescription"), publicWhatsapp: data.get("publicWhatsapp"),
      publicPickupEnabled: data.get("publicPickupEnabled") === "on",
      publicDeliveryEnabled: data.get("publicDeliveryEnabled") === "on",
    };
    else payload = { sessionTimeout: Number(data.get("sessionTimeout")), loginAttempts: Number(data.get("loginAttempts")) };

    try {
      setSaving(true); setError(""); setSuccess("");
      setCompany(await apiRequest<CompanySettings>("/companies/current", { method: "PATCH", body: JSON.stringify(payload) }));
      setSuccess("Configurações salvas e aplicadas à empresa atual.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível salvar as configurações."); }
    finally { setSaving(false); }
  }

  const tab = tabs.find((item) => item.id === activeTab) ?? tabs[0];
  const ActiveIcon = tab.icon;
  if (loading) return <div className="flex min-h-72 items-center justify-center gap-2 text-sm text-slate-500"><LoaderCircle className="size-4 animate-spin" />Carregando configurações...</div>;

  return <section>
    <div><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-violet-600">Administração</p><h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">Configurações</h1><p className="mt-1 text-xs text-slate-500">Personalize os dados e as regras reais da empresa.</p></div>
    {error && !company ? <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">{error}</div> : company && <div className="mt-5 grid items-start gap-4 lg:grid-cols-[240px_1fr]">
      <nav aria-label="Seções de configurações" className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm lg:sticky lg:top-20"><div className="flex min-w-max gap-1 lg:min-w-0 lg:flex-col">{tabs.map((item) => { const Icon = item.icon; const active = activeTab === item.id; return <button key={item.id} type="button" onClick={() => { setActiveTab(item.id); setError(""); setSuccess(""); }} className={`flex min-w-44 items-center gap-3 rounded-xl px-3 py-2.5 text-left lg:min-w-0 ${active ? "bg-violet-50 text-violet-700" : "text-slate-600 hover:bg-slate-50"}`}><div className={`flex size-8 items-center justify-center rounded-lg ${active ? "bg-violet-100" : "bg-slate-100 text-slate-400"}`}><Icon className="size-4" /></div><div><p className="text-xs font-bold">{item.label}</p><p className="text-[9px] text-slate-400">{item.description}</p></div></button>; })}</div></nav>
      <form key={activeTab} onSubmit={handleSubmit} className="space-y-4"><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-3 border-b border-slate-100 pb-4"><div className="flex size-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600"><ActiveIcon className="size-4" /></div><div><h2 className="text-sm font-bold text-slate-950">{tab.label}</h2><p className="text-[10px] text-slate-400">{tab.description}</p></div></div><div className="mt-4">{activeTab === "company" && <CompanyForm company={company} />}{activeTab === "preferences" && <PreferencesForm company={company} />}{activeTab === "sales" && <SalesForm company={company} />}{activeTab === "notifications" && <NotificationsForm company={company} />}{activeTab === "online" && <OnlineStoreForm company={company} />}{activeTab === "security" && <SecurityForm company={company} />}</div></div>
      {error && <Alert tone="error">{error}</Alert>}{success && <Alert tone="success"><CheckCircle2 className="size-4 shrink-0" />{success}</Alert>}<div className="flex justify-end"><button disabled={saving} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 text-sm font-bold text-white disabled:opacity-70">{saving ? <><LoaderCircle className="size-4 animate-spin" />Salvando...</> : <><Save className="size-4" />Salvar alterações</>}</button></div></form>
    </div>}
  </section>;
}

function CompanyForm({ company }: { company: CompanySettings }) { return <div className="space-y-5"><div className="grid gap-4 sm:grid-cols-2"><Field label="Razão social" id="legalName"><input id="legalName" name="legalName" required minLength={2} defaultValue={company.legalName ?? ""} className={inputClass} /></Field><Field label="Nome fantasia" id="tradeName"><input id="tradeName" name="tradeName" required minLength={2} defaultValue={company.tradeName} className={inputClass} /></Field><Field label="CNPJ" id="document"><input id="document" name="document" required defaultValue={company.document ?? ""} inputMode="numeric" className={inputClass} /></Field><Field label="Segmento" id="segment"><select id="segment" name="segment" defaultValue={company.segment} className={inputClass}>{segments.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field><Field label="E-mail comercial" id="email"><input id="email" name="email" type="email" required defaultValue={company.email ?? ""} className={inputClass} /></Field><Field label="Telefone" id="phone"><input id="phone" name="phone" required defaultValue={company.phone ?? ""} className={inputClass} /></Field></div><h3 className="border-t border-slate-100 pt-5 text-xs font-bold text-slate-800">Endereço da empresa</h3><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Field label="CEP" id="postalCode"><input id="postalCode" name="postalCode" required defaultValue={company.postalCode ?? ""} className={inputClass} /></Field><Field label="Endereço" id="street" className="lg:col-span-2"><input id="street" name="street" required defaultValue={company.street ?? ""} className={inputClass} /></Field><Field label="Número" id="number"><input id="number" name="number" required defaultValue={company.number ?? ""} className={inputClass} /></Field><Field label="Cidade" id="city" className="lg:col-span-2"><input id="city" name="city" required defaultValue={company.city ?? ""} className={inputClass} /></Field><Field label="Estado" id="state"><input id="state" name="state" required maxLength={2} defaultValue={company.state ?? ""} className={inputClass} /></Field></div></div>; }
function PreferencesForm({ company }: { company: CompanySettings }) { return <div className="grid gap-4 sm:grid-cols-2"><Field label="Idioma" id="language"><input id="language" value="Português (Brasil)" disabled className={inputClass} /></Field><Field label="Fuso horário" id="timezone"><select id="timezone" name="timezone" defaultValue={company.timezone} className={inputClass}><option value="America/Sao_Paulo">Brasília — São Paulo</option><option value="America/Manaus">Manaus</option><option value="America/Recife">Recife</option></select></Field><Field label="Moeda" id="currency"><input id="currency" value="Real brasileiro (R$)" disabled className={inputClass} /></Field><div className="rounded-xl border border-violet-100 bg-violet-50 p-3 text-[10px] leading-4 text-violet-700">O tema oficial permanece claro e o formato de data é brasileiro.</div></div>; }
function SalesForm({ company }: { company: CompanySettings }) { return <div className="space-y-5"><div className="grid gap-4 sm:grid-cols-2"><Field label="Pagamento padrão" id="defaultPayment"><select id="defaultPayment" name="defaultPayment" defaultValue={company.defaultPayment} className={inputClass}><option value="PIX">PIX</option><option value="CASH">Dinheiro</option><option value="DEBIT_CARD">Cartão de débito</option><option value="CREDIT_CARD">Cartão de crédito</option><option value="BOLETO">Boleto</option></select></Field><Field label="Desconto máximo (%)" id="maximumDiscount"><input id="maximumDiscount" name="maximumDiscount" type="number" min={0} max={100} step="0.5" defaultValue={company.maximumDiscount} className={inputClass} /></Field></div><SettingsGroup title="Regras aplicadas"><Toggle name="requireCustomer" title="Exigir cliente identificado" description="Bloqueia venda e pedido sem cliente cadastrado." defaultChecked={company.requireCustomer} /><Toggle name="allowPendingSales" title="Permitir vendas pendentes" description="Preferência preparada para o fluxo de recebimentos." defaultChecked={company.allowPendingSales} /></SettingsGroup></div>; }
function NotificationsForm({ company }: { company: CompanySettings }) { return <div className="space-y-5"><SettingsGroup title="Alertas no sistema"><Toggle name="lowStockNotification" title="Estoque baixo" description="Avisa gestores quando produtos atingem o estoque mínimo." defaultChecked={company.lowStockNotification} /><Toggle name="overdueAccountNotification" title="Contas vencidas" description="Avisa gestores sobre compromissos financeiros atrasados." defaultChecked={company.overdueAccountNotification} /><Toggle name="saleNotification" title="Novas vendas" description="Registra a preferência para alertas comerciais." defaultChecked={company.saleNotification} /></SettingsGroup><div className="grid gap-4 sm:grid-cols-2"><Field label="E-mail para resumos" id="summaryEmail"><input id="summaryEmail" name="summaryEmail" type="email" defaultValue={company.summaryEmail ?? ""} className={inputClass} /></Field><Field label="Frequência" id="summaryFrequency"><select id="summaryFrequency" name="summaryFrequency" defaultValue={company.summaryFrequency} className={inputClass}><option value="daily">Diariamente</option><option value="weekly">Semanalmente</option><option value="disabled">Desativado</option></select></Field></div><p className="text-[10px] text-slate-400">Os resumos são processados automaticamente, sem duplicação, e os e-mails com falha entram em reenvio gradual.</p></div>; }
function OnlineStoreForm({ company }: { company: CompanySettings }) { return <div className="space-y-5"><div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-violet-100 bg-violet-50 p-4"><div><p className="text-xs font-black text-violet-950">gestaomais.local/loja/{company.slug}</p><p className="mt-1 text-[10px] text-violet-700">Endereço público baseado no identificador da empresa.</p></div><Link href={`/loja/${company.slug}`} target="_blank" className="flex h-9 items-center gap-2 rounded-xl bg-white px-3 text-[10px] font-bold text-violet-700 shadow-sm"><ExternalLink className="size-3.5" />Visualizar página</Link></div><SettingsGroup title="Disponibilidade"><Toggle name="publicPageEnabled" title="Ativar página online" description="Publica o catálogo e permite receber pedidos." defaultChecked={company.publicPageEnabled} /><Toggle name="publicPickupEnabled" title="Permitir retirada" description="Cliente retira o pedido no estabelecimento." defaultChecked={company.publicPickupEnabled} /><Toggle name="publicDeliveryEnabled" title="Permitir entrega" description="A empresa combinará a entrega com o cliente." defaultChecked={company.publicDeliveryEnabled} /></SettingsGroup><div className="grid gap-4 sm:grid-cols-2"><Field label="WhatsApp público" id="publicWhatsapp"><input id="publicWhatsapp" name="publicWhatsapp" inputMode="tel" defaultValue={company.publicWhatsapp ?? ""} placeholder="(81) 99999-9999" className={inputClass} /></Field><Field label="Descrição pública" id="publicDescription"><textarea id="publicDescription" name="publicDescription" rows={3} maxLength={500} defaultValue={company.publicDescription ?? ""} placeholder="Conte aos clientes o que sua empresa oferece." className="w-full resize-none rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100" /></Field></div><p className="text-[10px] leading-4 text-slate-400">A visibilidade de cada item é controlada no cadastro do produto. Produtos sem estoque disponível não aparecem ao público.</p></div>; }
type SecuritySession = { id: string; current: boolean; ipAddress: string | null; userAgent: string | null; createdAt: string; expiresAt: string };
type AuditEntry = { id: string; action: string; userName: string; entityType: string; createdAt: string };
type JobStatusData = { emails: { queued: number; sent: number; failed: number }; recentRuns: { id: string; name: string; status: string; processed: number; error: string | null; startedAt: string }[] };
function SecurityForm({ company }: { company: CompanySettings }) {
  const [sessions, setSessions] = useState<SecuritySession[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [jobs, setJobs] = useState<JobStatusData>({ emails: { queued: 0, sent: 0, failed: 0 }, recentRuns: [] });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");
  useEffect(() => {
    let active = true;
    void Promise.all([apiRequest<SecuritySession[]>("/auth/sessions"), apiRequest<AuditEntry[]>("/audit"), apiRequest<JobStatusData>("/jobs/status")])
      .then(([sessionData, auditData, jobData]) => { if (active) { setSessions(sessionData); setAudit(auditData); setJobs(jobData); } })
      .catch((cause: unknown) => { if (active) setFeedback(cause instanceof Error ? cause.message : "Não foi possível carregar os dados de segurança."); });
    return () => { active = false; };
  }, []);
  async function changePassword() {
    if (newPassword.length < 8) return setFeedback("A nova senha deve ter ao menos 8 caracteres.");
    if (newPassword !== confirmation) return setFeedback("A confirmação da nova senha não confere.");
    try { setBusy(true); setFeedback(""); await apiRequest("/auth/change-password", { method: "POST", body: JSON.stringify({ currentPassword, newPassword }) }); setCurrentPassword(""); setNewPassword(""); setConfirmation(""); setFeedback("Senha alterada. As demais sessões foram encerradas."); }
    catch (cause) { setFeedback(cause instanceof Error ? cause.message : "Não foi possível alterar a senha."); }
    finally { setBusy(false); }
  }
  async function revokeSession(id: string) {
    try { setBusy(true); await apiRequest(`/auth/sessions/${id}`, { method: "DELETE" }); setSessions((items) => items.filter((item) => item.id !== id)); setFeedback("Sessão encerrada."); }
    catch (cause) { setFeedback(cause instanceof Error ? cause.message : "Não foi possível encerrar a sessão."); }
    finally { setBusy(false); }
  }
  async function revokeOthers() {
    try { setBusy(true); const result = await apiRequest<{ revoked: number }>("/auth/sessions/revoke-others", { method: "POST" }); setSessions((items) => items.filter((item) => item.current)); setFeedback(`${result.revoked} outra(s) sessão(ões) encerrada(s).`); }
    catch (cause) { setFeedback(cause instanceof Error ? cause.message : "Não foi possível encerrar as sessões."); }
    finally { setBusy(false); }
  }
  async function runJob(path: "email" | "summaries") {
    try {
      setBusy(true); setFeedback("");
      await apiRequest(`/jobs/run/${path}`, { method: "POST" });
      setJobs(await apiRequest<JobStatusData>("/jobs/status"));
      setFeedback(path === "email" ? "Fila de e-mails processada." : "Resumo e alertas processados.");
    } catch (cause) { setFeedback(cause instanceof Error ? cause.message : "Não foi possível executar o processamento."); }
    finally { setBusy(false); }
  }
  return <div className="space-y-5">
    <div className="grid gap-4 sm:grid-cols-2"><Field label="Duração máxima da sessão (minutos)" id="sessionTimeout"><input id="sessionTimeout" name="sessionTimeout" type="number" min={5} max={480} step={5} defaultValue={company.sessionTimeout} className={inputClass} /></Field><Field label="Tentativas antes do bloqueio" id="loginAttempts"><input id="loginAttempts" name="loginAttempts" type="number" min={3} max={10} defaultValue={company.loginAttempts} className={inputClass} /></Field></div>
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-[10px] leading-4 text-emerald-800">As políticas são aplicadas no próximo login. O bloqueio dura 15 minutos após o limite de tentativas inválidas.</div>
    <section className="rounded-xl border border-slate-200 p-4"><div className="flex items-center gap-2"><KeyRound className="size-4 text-violet-600" /><h3 className="text-xs font-bold text-slate-800">Alterar minha senha</h3></div><div className="mt-4 grid gap-4 sm:grid-cols-3"><Field label="Senha atual" id="currentPassword"><input id="currentPassword" type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className={inputClass} /></Field><Field label="Nova senha" id="newPassword"><input id="newPassword" type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className={inputClass} /></Field><Field label="Confirmar nova senha" id="passwordConfirmation"><input id="passwordConfirmation" type="password" autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className={inputClass} /></Field></div><button type="button" disabled={busy || !currentPassword || !newPassword} onClick={() => void changePassword()} className="mt-3 h-10 rounded-xl bg-violet-600 px-4 text-xs font-bold text-white disabled:opacity-50">Alterar senha</button></section>
    <section className="rounded-xl border border-slate-200 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2"><Monitor className="size-4 text-violet-600" /><div><h3 className="text-xs font-bold text-slate-800">Sessões e dispositivos</h3><p className="text-[10px] text-slate-400">Somente acessos desta empresa.</p></div></div><button type="button" disabled={busy || sessions.length < 2} onClick={() => void revokeOthers()} className="h-9 rounded-xl border border-slate-200 px-3 text-[10px] font-bold text-slate-600 disabled:opacity-40">Encerrar outras sessões</button></div><div className="mt-3 divide-y divide-slate-100">{sessions.map((session) => <div key={session.id} className="flex items-center justify-between gap-3 py-3"><div className="min-w-0"><p className="truncate text-xs font-bold text-slate-700">{session.userAgent || "Navegador não identificado"}</p><p className="mt-1 text-[10px] text-slate-400">{session.ipAddress || "IP não informado"} · expira {formatSecurityDate(session.expiresAt)}</p></div>{session.current ? <span className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-bold text-emerald-700">Sessão atual</span> : <button type="button" disabled={busy} onClick={() => void revokeSession(session.id)} className="text-[10px] font-bold text-red-600">Encerrar</button>}</div>)}</div></section>
    <section className="rounded-xl border border-slate-200 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2"><Activity className="size-4 text-violet-600" /><div><h3 className="text-xs font-bold text-slate-800">Processamento assíncrono</h3><p className="text-[10px] text-slate-400">Fila, reenvios e resumos desta empresa.</p></div></div><div className="flex gap-2"><button type="button" disabled={busy} onClick={() => void runJob("email")} className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-[10px] font-bold text-slate-600 disabled:opacity-40"><RefreshCw className="size-3" /> Processar fila</button><button type="button" disabled={busy} onClick={() => void runJob("summaries")} className="h-9 rounded-xl bg-violet-600 px-3 text-[10px] font-bold text-white disabled:opacity-40">Gerar resumo</button></div></div><div className="mt-4 grid grid-cols-3 gap-2"><JobMetric label="Na fila" value={jobs.emails.queued} tone="amber" /><JobMetric label="Enviados" value={jobs.emails.sent} tone="green" /><JobMetric label="Falhas" value={jobs.emails.failed} tone="red" /></div><div className="mt-3 divide-y divide-slate-100">{jobs.recentRuns.slice(0, 5).map((run) => <div key={run.id} className="flex items-center justify-between gap-3 py-2.5"><div><p className="text-[10px] font-bold text-slate-700">{run.name === "EMAIL_DELIVERY" ? "Entrega de e-mails" : "Resumo e alertas"}</p><p className="text-[9px] text-slate-400">{run.processed} item(ns) · {formatSecurityDate(run.startedAt)}</p></div><span className={`rounded-full px-2 py-1 text-[9px] font-bold ${jobStatusClass(run.status)}`}>{jobStatusLabel(run.status)}</span></div>)}{!jobs.recentRuns.length && <p className="py-3 text-[10px] text-slate-400">Nenhum processamento registrado.</p>}</div></section>
    <section className="rounded-xl border border-slate-200 p-4"><h3 className="text-xs font-bold text-slate-800">Auditoria recente</h3><div className="mt-3 divide-y divide-slate-100">{audit.slice(0, 8).map((entry) => <div key={entry.id} className="flex justify-between gap-3 py-2.5"><div><p className="text-[10px] font-bold text-slate-700">{auditLabel(entry.action)}</p><p className="text-[9px] text-slate-400">{entry.userName} · {entry.entityType}</p></div><time className="text-[9px] text-slate-400">{formatSecurityDate(entry.createdAt)}</time></div>)}{!audit.length && <p className="py-3 text-[10px] text-slate-400">Nenhum evento registrado.</p>}</div></section>
    {feedback && <div role="status" className="rounded-xl border border-cyan-200 bg-cyan-50 p-3 text-[10px] font-semibold text-cyan-800">{feedback}</div>}
  </div>;
}
function JobMetric({ label, value, tone }: { label: string; value: number; tone: "amber" | "green" | "red" }) { const colors = { amber: "bg-amber-50 text-amber-700", green: "bg-emerald-50 text-emerald-700", red: "bg-red-50 text-red-700" }; return <div className={`rounded-xl p-3 ${colors[tone]}`}><p className="text-lg font-black">{value}</p><p className="text-[9px] font-bold uppercase tracking-wide">{label}</p></div>; }
function jobStatusLabel(status: string) { return ({ COMPLETED: "Concluído", FAILED: "Falhou", SKIPPED: "Ignorado", RUNNING: "Executando" } as Record<string, string>)[status] ?? status; }
function jobStatusClass(status: string) { return status === "COMPLETED" ? "bg-emerald-50 text-emerald-700" : status === "FAILED" ? "bg-red-50 text-red-700" : status === "RUNNING" ? "bg-cyan-50 text-cyan-700" : "bg-slate-100 text-slate-600"; }
function formatSecurityDate(value: string) { return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value)); }
function auditLabel(action: string) { return ({ LOGIN_SUCCESS: "Login realizado", LOGIN_FAILURE: "Tentativa de login inválida", PASSWORD_CHANGED: "Senha alterada", SESSION_REVOKED: "Sessão encerrada", COMPANY_UPDATED: "Empresa atualizada", EMPLOYEE_CREATED: "Funcionário criado", EMPLOYEE_ROLE_CHANGED: "Papel alterado", EMPLOYEE_STATUS_CHANGED: "Acesso alterado", SUBSCRIPTION_REQUESTED: "Solicitação de assinatura", CASH_REGISTER_OPENED: "Caixa aberto", CASH_REGISTER_CLOSED: "Caixa fechado", CASH_MOVEMENT_RECORDED: "Movimentação de caixa", SUPPLIER_CREATED: "Fornecedor criado", SUPPLIER_UPDATED: "Fornecedor atualizado", PURCHASE_CREATED: "Compra criada", PURCHASE_RECEIVED: "Compra recebida", PURCHASE_CANCELLED: "Compra cancelada", CATEGORY_CREATED: "Categoria criada", CATEGORY_UPDATED: "Categoria atualizada", SERVICE_CREATED: "Serviço criado", SERVICE_UPDATED: "Serviço atualizado" } as Record<string, string>)[action] ?? action; }

const inputClass = "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-950 outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100 disabled:bg-slate-50 disabled:text-slate-400";
function Field({ label, id, children, className = "" }: { label: string; id: string; children: ReactNode; className?: string }) { return <div className={className}><label htmlFor={id} className="mb-1.5 block text-xs font-bold text-slate-700">{label}</label>{children}</div>; }
function SettingsGroup({ title, children }: { title: string; children: ReactNode }) { return <fieldset className="overflow-hidden rounded-xl border border-slate-200"><legend className="sr-only">{title}</legend><div className="border-b border-slate-200 bg-slate-50 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">{title}</div><div className="divide-y divide-slate-100">{children}</div></fieldset>; }
function Toggle({ name, title, description, defaultChecked }: { name: string; title: string; description: string; defaultChecked: boolean }) { return <label className="flex cursor-pointer items-center justify-between gap-4 px-4 py-3"><span><span className="block text-xs font-bold text-slate-700">{title}</span><span className="text-[10px] text-slate-400">{description}</span></span><span className="relative shrink-0"><input type="checkbox" name={name} defaultChecked={defaultChecked} className="peer sr-only" /><span className="block h-6 w-11 rounded-full bg-slate-200 peer-checked:bg-violet-600" /><span className="absolute left-1 top-1 size-4 rounded-full bg-white shadow-sm transition peer-checked:translate-x-5" /></span></label>; }
function Alert({ tone, children }: { tone: "error" | "success"; children: ReactNode }) { return <div role={tone === "error" ? "alert" : "status"} className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-xs font-semibold ${tone === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>{children}</div>; }
