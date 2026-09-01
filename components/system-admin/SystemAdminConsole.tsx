"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Activity, ArrowLeft, Building2, CheckCircle2, CreditCard, KeyRound, LayoutDashboard, LifeBuoy, LoaderCircle, LockKeyhole, LogOut, Pencil, RefreshCw, Search, ShieldCheck, Unlock, Users, X } from "lucide-react";
import BrandLogo from "@/components/brand/BrandLogo";
import { ApiError, apiRequest } from "@/lib/api/client";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";

type Tab = "overview" | "companies" | "users" | "plans";
type Overview = { metrics: { users: number; activeUsers: number; companies: number; activeCompanies: number; newCompanies: number; monthlyRecurringRevenue: number }; plans: Plan[]; recentCompanies: Company[] };
type Plan = { id: string; name: string; price: number | null; ownerLimit: number | null; employeeLimit: number | null; unitLimit: number | null; companies: number };
type User = { id: string; name: string; email: string; phone: string | null; status: string; isSystemAdmin: boolean; failedLoginAttempts: number; lockedUntil: string | null; createdAt: string; _count: { memberships: number; sessions: number } };
type UserDetail = { id: string; name: string; email: string; phone: string | null; status: string; isSystemAdmin: boolean; failedLoginAttempts: number; lockedUntil: string | null; passwordChangedAt: string | null; createdAt: string; updatedAt: string; memberships: Array<{ id: string; role: string; active: boolean; createdAt: string; company: { id: string; tradeName: string; slug: string; status: string; subscriptionPlan: string; subscriptionStatus: string } }>; sessions: Array<{ id: string; ipAddress: string | null; createdAt: string }> };
type Company = { id: string; tradeName: string; slug: string; email?: string | null; document?: string | null; status: string; subscriptionPlan: string; subscriptionStatus: string; subscriptionPrice?: number | string; trialEndsAt?: string | null; nextBillingAt?: string | null; createdAt: string; _count: { memberships: number; sales?: number } };

const nav = [
  { id: "overview" as const, label: "Visão geral", icon: LayoutDashboard },
  { id: "companies" as const, label: "Empresas", icon: Building2 },
  { id: "users" as const, label: "Usuários", icon: Users },
  { id: "plans" as const, label: "Planos", icon: CreditCard },
];

export default function SystemAdminConsole({ operatorName }: { operatorName: string }) {
  const [tab, setTab] = useState<Tab>("overview");
  const [overview, setOverview] = useState<Overview | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [accessDenied, setAccessDenied] = useState(false);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [supportingUser, setSupportingUser] = useState<User | null>(null);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  async function load() {
    setLoading(true); setError(""); setAccessDenied(false);
    try {
      const [summary, userList, companyList] = await Promise.all([
        apiRequest<Overview>("/system-admin/overview"),
        apiRequest<User[]>("/system-admin/users"),
        apiRequest<Company[]>("/system-admin/companies"),
      ]);
      setOverview(summary); setUsers(userList); setCompanies(companyList);
    } catch (cause) {
      const denied = cause instanceof ApiError && cause.status === 403;
      setAccessDenied(denied);
      setError(denied ? "Sua conta está autenticada, mas não possui permissão de administrador da plataforma." : cause instanceof Error ? cause.message : "Não foi possível carregar a central.");
    } finally { setLoading(false); }
  }
  useEffect(() => {
    let active = true;
    Promise.all([
      apiRequest<Overview>("/system-admin/overview"),
      apiRequest<User[]>("/system-admin/users"),
      apiRequest<Company[]>("/system-admin/companies"),
    ]).then(([summary, userList, companyList]) => {
      if (!active) return;
      setOverview(summary); setUsers(userList); setCompanies(companyList); setLoading(false);
    }).catch((cause: unknown) => {
      if (!active) return;
      const denied = cause instanceof ApiError && cause.status === 403;
      setAccessDenied(denied);
      setError(denied ? "Sua conta está autenticada, mas não possui permissão de administrador da plataforma." : cause instanceof Error ? cause.message : "Não foi possível carregar a central.");
      setLoading(false);
    });
    return () => { active = false; };
  }, []);
  const normalized = search.trim().toLocaleLowerCase("pt-BR");
  const visibleUsers = useMemo(() => users.filter((user) => !normalized || `${user.name} ${user.email}`.toLowerCase().includes(normalized)), [users, normalized]);
  const visibleCompanies = useMemo(() => companies.filter((company) => !normalized || `${company.tradeName} ${company.email ?? ""} ${company.document ?? ""}`.toLowerCase().includes(normalized)), [companies, normalized]);
  const title = nav.find((item) => item.id === tab)?.label ?? "Central";

  function notify(text: string) { setMessage(text); window.setTimeout(() => setMessage(""), 3500); }

  if (accessDenied) return <RestrictedPage message={error} />;

  return <main className="mangora-app min-h-screen bg-[#e9dfd2]">
    <div className="min-h-screen lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="border-b border-white/10 bg-[#123d2b] px-4 py-4 text-white lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:px-5 lg:py-6">
        <div className="flex items-center justify-between lg:block"><BrandLogo className="h-8" surface="light" priority /><span className="rounded-full bg-white/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[.18em] text-[#ffcf5a]">System</span></div>
        <div className="mt-5 hidden rounded-2xl border border-white/10 bg-white/[.06] p-3 lg:block"><p className="text-[9px] font-bold uppercase tracking-[.16em] text-white/45">Operador</p><p className="mt-1 truncate text-xs font-extrabold">{operatorName}</p><p className="mt-1 flex items-center gap-1 text-[9px] text-emerald-200"><ShieldCheck className="size-3" />Acesso de plataforma</p></div>
        <nav className="mt-4 flex gap-2 overflow-x-auto lg:mt-7 lg:block lg:space-y-1.5">{nav.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => { setTab(id); setSearch(""); }} className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold transition lg:w-full ${tab === id ? "bg-[#ce4a0a] text-white shadow-[3px_3px_0_#ffb21a]" : "text-white/65 hover:bg-white/10 hover:text-white"}`}><Icon className="size-4" />{label}</button>)}</nav>
        <Link href="/dashboard" className="mt-6 hidden items-center gap-2 border-t border-white/10 pt-5 text-xs font-bold text-white/55 hover:text-white lg:flex"><ArrowLeft className="size-4" />Voltar ao sistema</Link>
      </aside>
      <section className="min-w-0">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#123d2b]/15 bg-[#fffdf8]/95 px-4 backdrop-blur sm:px-7"><div><p className="text-[9px] font-black uppercase tracking-[.18em] text-[#a93a05]">Central Mangora</p><h1 className="text-lg font-black text-[#123d2b]">{title}</h1></div><div className="flex items-center gap-2"><button onClick={() => void load()} disabled={loading} aria-label="Atualizar dados" className="grid size-9 place-items-center rounded-xl border border-[#123d2b]/15 bg-white text-[#315847] hover:text-[#ce4a0a]"><RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} /></button><Link href="/dashboard" className="grid size-9 place-items-center rounded-xl border border-[#123d2b]/15 bg-white text-[#315847] lg:hidden"><ArrowLeft className="size-4" /></Link></div></header>
        <div className="p-4 sm:p-7">
          {message && <div role="status" className="mb-4 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-xs font-bold text-green-700"><CheckCircle2 className="size-4" />{message}</div>}
          {loading ? <Loading /> : error ? <Denied message={error} /> : overview && <>
            {(tab === "companies" || tab === "users") && <SearchBar value={search} onChange={setSearch} placeholder={tab === "companies" ? "Buscar por empresa, e-mail ou documento" : "Buscar por nome ou e-mail"} />}
            {tab === "overview" && <OverviewPanel data={overview} onCompanies={() => setTab("companies")} />}
            {tab === "companies" && <CompaniesPanel items={visibleCompanies} onEdit={setEditingCompany} />}
            {tab === "users" && <UsersPanel items={visibleUsers} onEdit={setEditingUser} onSupport={setSupportingUser} />}
            {tab === "plans" && <PlansPanel plans={overview.plans} />}
          </>}
        </div>
      </section>
    </div>
    {editingUser && <UserEditor user={editingUser} onClose={() => setEditingUser(null)} onSaved={(updated) => { setUsers((items) => items.map((item) => item.id === updated.id ? { ...item, ...updated } : item)); setEditingUser(null); notify("Usuário atualizado."); }} />}
    {supportingUser && <SupportEditor user={supportingUser} onClose={() => setSupportingUser(null)} onChanged={(next) => { setUsers((items) => items.map((item) => item.id === next.id ? { ...item, ...next } : item)); }} notify={notify} />}
    {editingCompany && <CompanyEditor company={editingCompany} onClose={() => setEditingCompany(null)} onSaved={(updated) => { setCompanies((items) => items.map((item) => item.id === updated.id ? { ...item, ...updated } : item)); setEditingCompany(null); notify("Empresa e assinatura atualizadas."); void load(); }} />}
  </main>;
}

function OverviewPanel({ data, onCompanies }: { data: Overview; onCompanies: () => void }) { const cards = [
  { label: "Empresas", value: formatNumber(data.metrics.companies), note: `${data.metrics.activeCompanies} ativas`, icon: Building2, tone: "bg-[#123d2b] text-white" },
  { label: "Usuários", value: formatNumber(data.metrics.users), note: `${data.metrics.activeUsers} ativos`, icon: Users, tone: "bg-[#fffdf8] text-[#123d2b]" },
  { label: "MRR cadastrado", value: formatCurrency(data.metrics.monthlyRecurringRevenue), note: "soma dos planos atuais", icon: Activity, tone: "bg-[#ffb21a] text-[#123d2b]" },
  { label: "Novas no mês", value: formatNumber(data.metrics.newCompanies), note: "cadastros desde o dia 1", icon: CheckCircle2, tone: "bg-[#d4ecdc] text-[#123d2b]" },
]; return <div className="space-y-5"><section className="overflow-hidden rounded-3xl border-2 border-[#123d2b] bg-[#fff8ea] shadow-[7px_8px_0_#ffb21a]"><div className="grid gap-5 p-5 md:grid-cols-[1fr_auto] md:items-end sm:p-7"><div><span className="inline-flex rounded-full bg-[#123d2b] px-3 py-1 text-[9px] font-black uppercase tracking-[.16em] text-[#ffcf5a]">Operação da plataforma</span><h2 className="mt-4 max-w-2xl text-3xl font-black leading-none text-[#123d2b] sm:text-4xl">Toda a Mangora,<br/><span className="text-[#ce4a0a]">em uma mesa só.</span></h2><p className="mt-3 max-w-xl text-xs leading-5 text-[#315847]">Acompanhe contas, planos e acessos sem misturar a administração da plataforma com os dados de cada loja.</p></div><button onClick={onCompanies} className="h-11 rounded-xl bg-[#ce4a0a] px-5 text-xs font-black text-white shadow-[0_4px_0_#963203]">Gerenciar empresas</button></div></section><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({ label, value, note, icon: Icon, tone }) => <article key={label} className={`rounded-2xl border border-[#123d2b]/15 p-5 shadow-sm ${tone}`}><div className="flex items-start justify-between"><p className="text-[9px] font-black uppercase tracking-[.14em] opacity-65">{label}</p><Icon className="size-4 opacity-65" /></div><p className="mt-5 text-2xl font-black">{value}</p><p className="mt-1 text-[10px] opacity-65">{note}</p></article>)}</div><section className="rounded-2xl border border-[#123d2b]/15 bg-[#fffdf8] shadow-sm"><div className="border-b border-[#123d2b]/10 px-5 py-4"><h2 className="text-sm font-black">Cadastros recentes</h2><p className="text-[10px] text-[#597064]">As últimas empresas que entraram na plataforma.</p></div><CompanyRows items={data.recentCompanies} onEdit={onCompanies} compact /></section></div>; }

function SearchBar({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) { return <label className="mb-4 flex h-11 max-w-xl items-center gap-2 rounded-xl border border-[#123d2b]/15 bg-white px-3 shadow-sm"><Search className="size-4 text-[#597064]" /><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-full min-w-0 flex-1 border-0 bg-transparent text-xs outline-none" /></label>; }
function CompaniesPanel({ items, onEdit }: { items: Company[]; onEdit: (item: Company) => void }) { return <section className="overflow-hidden rounded-2xl border border-[#123d2b]/15 bg-[#fffdf8] shadow-sm"><PanelTitle title="Empresas e assinaturas" description={`${items.length} registros exibidos · até 100 contas recentes`} /><CompanyRows items={items} onEdit={onEdit} /></section>; }
function CompanyRows({ items, onEdit, compact = false }: { items: Company[]; onEdit: ((item: Company) => void) | (() => void); compact?: boolean }) { return <div className="divide-y divide-[#123d2b]/10">{items.map((company) => <div key={company.id} className="grid gap-3 px-5 py-4 hover:bg-[#ffb21a]/5 md:grid-cols-[minmax(0,1.5fr)_1fr_1fr_auto] md:items-center"><div><p className="truncate text-xs font-black text-[#123d2b]">{company.tradeName}</p><p className="mt-1 truncate text-[9px] text-[#597064]">{company.email ?? company.slug} · desde {formatDate(company.createdAt)}</p></div><div><Badge value={company.status} /><p className="mt-1 text-[9px] text-[#597064]">{company._count.memberships} usuário(s)</p></div><div><p className="text-[10px] font-black text-[#a93a05]">{company.subscriptionPlan}</p><p className="mt-1 text-[9px] text-[#597064]">{company.subscriptionStatus}</p></div><button onClick={() => onEdit(company)} className="flex h-8 items-center justify-center gap-1 rounded-lg border border-[#123d2b]/15 bg-white px-3 text-[10px] font-bold hover:border-[#ce4a0a] hover:text-[#a93a05]"><Pencil className="size-3" />{compact ? "Abrir" : "Editar"}</button></div>)}{!items.length && <Empty text="Nenhuma empresa encontrada." />}</div>; }
function UsersPanel({ items, onEdit, onSupport }: { items: User[]; onEdit: (item: User) => void; onSupport: (item: User) => void }) { return <section className="overflow-hidden rounded-2xl border border-[#123d2b]/15 bg-[#fffdf8] shadow-sm"><PanelTitle title="Usuários da plataforma" description={`${items.length} registros exibidos · edite dados e controle acessos`} /><div className="divide-y divide-[#123d2b]/10">{items.map((user) => <div key={user.id} className="grid gap-3 px-5 py-4 hover:bg-[#ffb21a]/5 md:grid-cols-[minmax(0,1.5fr)_1fr_1fr_auto] md:items-center"><div><div className="flex items-center gap-2"><p className="truncate text-xs font-black">{user.name}</p>{user.isSystemAdmin && <ShieldCheck className="size-3.5 text-[#147a45]" />}</div><p className="mt-1 truncate text-[9px] text-[#597064]">{user.email}</p></div><div><Badge value={user.status} /><p className="mt-1 text-[9px] text-[#597064]">{user._count.memberships} empresa(s)</p></div><div><p className="text-[10px] font-bold">{user._count.sessions} sessões</p><p className="mt-1 text-[9px] text-[#597064]">desde {formatDate(user.createdAt)}</p></div><div className="flex gap-2"><button onClick={() => onSupport(user)} className="flex h-8 items-center justify-center gap-1 rounded-lg border border-[#147a45]/25 bg-[#dff4e7] px-3 text-[10px] font-black text-[#147a45] hover:bg-[#c9ecd6]"><LifeBuoy className="size-3" />Suporte</button><button onClick={() => onEdit(user)} className="flex h-8 items-center justify-center gap-1 rounded-lg border border-[#123d2b]/15 bg-white px-3 text-[10px] font-bold hover:border-[#ce4a0a] hover:text-[#a93a05]"><Pencil className="size-3" />Editar</button></div></div>)}{!items.length && <Empty text="Nenhum usuário encontrado." />}</div></section>; }
function PlansPanel({ plans }: { plans: Plan[] }) { return <div><div className="mb-5"><p className="text-[9px] font-black uppercase tracking-[.16em] text-[#a93a05]">Catálogo comercial</p><h2 className="mt-1 text-2xl font-black">Planos da Mangora</h2><p className="mt-1 text-xs text-[#597064]">Valores e limites vigentes no backend. A distribuição atual é calculada pelas empresas cadastradas.</p></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{plans.map((plan, index) => <article key={plan.id} className={`rounded-2xl border-2 p-5 ${index === 2 ? "border-[#ce4a0a] bg-[#fff8ea] shadow-[5px_5px_0_#ffb21a]" : "border-[#123d2b]/15 bg-[#fffdf8]"}`}><div className="flex items-start justify-between"><div><p className="text-[9px] font-black uppercase tracking-[.14em] text-[#597064]">{plan.id}</p><h3 className="mt-1 text-xl font-black">{plan.name}</h3></div><span className="rounded-full bg-[#d4ecdc] px-2.5 py-1 text-[9px] font-black text-[#147a45]">{plan.companies} empresa(s)</span></div><p className="mt-6 text-2xl font-black text-[#ce4a0a]">{plan.price === null ? "Sob consulta" : plan.price === 0 ? "Grátis" : `${formatCurrency(plan.price)}/mês`}</p><div className="mt-5 grid grid-cols-3 gap-2 border-t border-[#123d2b]/10 pt-4 text-[10px]"><span className="text-[#597064]">Donos<strong className="mt-1 block text-xs text-[#123d2b]">{plan.ownerLimit ?? "A combinar"}</strong></span><span className="text-[#597064]">Funcionários<strong className="mt-1 block text-xs text-[#123d2b]">{plan.employeeLimit ?? "A combinar"}</strong></span><span className="text-[#597064]">Lojas<strong className="mt-1 block text-xs text-[#123d2b]">{plan.unitLimit ?? "A combinar"}</strong></span></div></article>)}</div><p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-[10px] leading-4 text-amber-800">Para evitar divergência de cobrança, a edição do catálogo deve permanecer versionada no backend. Nesta central você pode atribuir qualquer plano e valor diretamente a uma empresa.</p></div>; }

function UserEditor({ user, onClose, onSaved }: { user: User; onClose: () => void; onSaved: (user: Partial<User> & { id: string }) => void }) { const [form, setForm] = useState({ name: user.name, email: user.email, phone: user.phone ?? "", status: user.status, isSystemAdmin: user.isSystemAdmin }); return <Editor title="Editar usuário" description={form.isSystemAdmin ? "Administrador global da plataforma" : "Conta de acesso Mangora"} onClose={onClose} onSave={async () => { const updated = await apiRequest<Partial<User> & { id: string }>(`/system-admin/users/${user.id}`, { method: "PATCH", body: JSON.stringify(form) }); onSaved(updated); }}><Field label="Nome"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field><Field label="E-mail"><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field><Field label="Telefone"><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field><Field label="Status"><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="ACTIVE">Ativo</option><option value="BLOCKED">Bloqueado</option></select></Field><label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-[#123d2b]/15 bg-white px-4 py-3 sm:col-span-2"><span className="flex items-center gap-2 text-[10px] font-bold text-[#315847]"><ShieldCheck className="size-4 text-[#147a45]" />Administrador do sistema</span><input type="checkbox" checked={form.isSystemAdmin} onChange={(e) => setForm({ ...form, isSystemAdmin: e.target.checked })} className="size-5 accent-[#147a45]" /></label></Editor>; }
function CompanyEditor({ company, onClose, onSaved }: { company: Company; onClose: () => void; onSaved: (company: Partial<Company> & { id: string }) => void }) { const [form, setForm] = useState({ status: company.status, subscriptionPlan: company.subscriptionPlan, subscriptionStatus: company.subscriptionStatus, subscriptionPrice: String(company.subscriptionPrice ?? 0), trialEndsAt: company.trialEndsAt?.slice(0, 10) ?? "" }); return <Editor title={company.tradeName} description="Plano, acesso e período gratuito" onClose={onClose} onSave={async () => { const updated = await apiRequest<Partial<Company> & { id: string }>(`/system-admin/companies/${company.id}`, { method: "PATCH", body: JSON.stringify({ ...form, subscriptionPrice: Number(form.subscriptionPrice), trialEndsAt: form.trialEndsAt ? `${form.trialEndsAt}T23:59:59.000-03:00` : undefined }) }); onSaved(updated); }}><Field label="Acesso da empresa"><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="ACTIVE">Ativa</option><option value="SUSPENDED">Suspensa</option></select></Field><Field label="Plano"><select value={form.subscriptionPlan} onChange={(e) => setForm({ ...form, subscriptionPlan: e.target.value })}>{["FREE", "START", "BUSINESS", "PREMIUM", "ENTERPRISE"].map((plan) => <option key={plan}>{plan}</option>)}</select></Field><Field label="Status da assinatura"><select value={form.subscriptionStatus} onChange={(e) => setForm({ ...form, subscriptionStatus: e.target.value })}>{["TRIAL", "PENDING", "ACTIVE", "PAST_DUE", "CANCELLED"].map((status) => <option key={status}>{status}</option>)}</select></Field><Field label="Valor mensal"><input type="number" min="0" step="0.01" value={form.subscriptionPrice} onChange={(e) => setForm({ ...form, subscriptionPrice: e.target.value })} /></Field><Field label="Fim do período grátis"><input type="date" value={form.trialEndsAt} onChange={(e) => setForm({ ...form, trialEndsAt: e.target.value })} /></Field></Editor>; }
function Editor({ title, description, onClose, onSave, children }: { title: string; description: string; onClose: () => void; onSave: () => Promise<void>; children: React.ReactNode }) { const [saving, setSaving] = useState(false); const [error, setError] = useState(""); return <div className="fixed inset-0 z-50 grid place-items-center bg-[#082016]/60 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><form onSubmit={(event) => { event.preventDefault(); setSaving(true); setError(""); void onSave().catch((cause) => setError(cause instanceof Error ? cause.message : "Não foi possível salvar.")).finally(() => setSaving(false)); }} className="mangora-app max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border-2 border-[#123d2b] bg-[#fffdf8] p-5 shadow-[8px_9px_0_#ffb21a] sm:p-6"><div className="flex items-start justify-between"><div><p className="text-[9px] font-black uppercase tracking-[.16em] text-[#a93a05]">Edição administrativa</p><h2 className="mt-1 text-xl font-black">{title}</h2><p className="mt-1 text-[10px] text-[#597064]">{description}</p></div><button type="button" onClick={onClose} className="grid size-8 place-items-center rounded-lg border border-[#123d2b]/15 bg-white"><X className="size-4" /></button></div><div className="mt-5 grid gap-4 sm:grid-cols-2">{children}</div>{error && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700">{error}</p>}<div className="mt-6 flex justify-end gap-2"><button type="button" onClick={onClose} className="h-10 rounded-xl border border-[#123d2b]/15 bg-white px-4 text-xs font-bold">Cancelar</button><button disabled={saving} className="flex h-10 items-center gap-2 rounded-xl bg-[#ce4a0a] px-5 text-xs font-black text-white disabled:opacity-60">{saving && <LoaderCircle className="size-4 animate-spin" />}Salvar alterações</button></div></form></div>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="text-[10px] font-bold text-[#315847] [&_input]:mt-1.5 [&_input]:h-10 [&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-[#123d2b]/15 [&_input]:bg-white [&_input]:px-3 [&_input]:text-xs [&_select]:mt-1.5 [&_select]:h-10 [&_select]:w-full [&_select]:rounded-xl [&_select]:border [&_select]:border-[#123d2b]/15 [&_select]:bg-white [&_select]:px-3 [&_select]:text-xs">{label}{children}</label>; }
function PanelTitle({ title, description }: { title: string; description: string }) { return <div className="border-b border-[#123d2b]/10 px-5 py-4"><h2 className="text-sm font-black">{title}</h2><p className="mt-1 text-[10px] text-[#597064]">{description}</p></div>; }
function Badge({ value }: { value: string }) { const positive = value === "ACTIVE"; return <span className={`inline-flex rounded-full px-2 py-1 text-[8px] font-black uppercase tracking-wider ${positive ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-800"}`}>{value}</span>; }
function Loading() { return <div className="grid min-h-[55vh] place-items-center"><div className="text-center"><LoaderCircle className="mx-auto size-7 animate-spin text-[#ce4a0a]" /><p className="mt-3 text-xs font-bold text-[#597064]">Carregando a operação…</p></div></div>; }
function Denied({ message }: { message: string }) { return <div className="mx-auto mt-12 max-w-lg rounded-3xl border-2 border-[#123d2b] bg-[#fffdf8] p-7 text-center shadow-[7px_8px_0_#ffb21a]"><LockKeyhole className="mx-auto size-9 text-[#ce4a0a]" /><h2 className="mt-4 text-xl font-black">Área restrita</h2><p className="mt-2 text-xs leading-5 text-[#597064]">{message}</p><Link href="/dashboard" className="mt-5 inline-flex h-10 items-center rounded-xl bg-[#123d2b] px-5 text-xs font-black text-white">Voltar ao dashboard</Link></div>; }
function RestrictedPage({ message }: { message: string }) { return <main className="mangora-public grid min-h-screen place-items-center bg-[#e9dfd2] p-5"><section className="w-full max-w-md rounded-3xl border-2 border-[#123d2b] bg-[#fffdf8] p-7 text-center shadow-[7px_8px_0_#ffb21a] sm:p-9"><div className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#ffe4c7] text-[#ce4a0a]"><LockKeyhole className="size-7" /></div><p className="mt-5 text-[9px] font-black uppercase tracking-[.18em] text-[#a93a05]">Acesso protegido</p><h1 className="mt-2 text-2xl font-black text-[#123d2b]">Área restrita</h1><p className="mt-3 text-xs leading-5 text-[#597064]">{message}</p><Link href="/dashboard" className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-[#123d2b] px-5 text-xs font-black text-white transition hover:-translate-y-0.5"><ArrowLeft className="size-4" />Voltar ao dashboard</Link></section></main>; }
function Empty({ text }: { text: string }) { return <div className="p-10 text-center text-xs font-bold text-[#597064]">{text}</div>; }

function SupportEditor({ user, onClose, onChanged, notify }: { user: User; onClose: () => void; onChanged: (user: Partial<User> & { id: string }) => void; notify: (text: string) => void }) {
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let alive = true;
    apiRequest<UserDetail>(`/system-admin/users/${user.id}`)
      .then((data) => { if (alive) setDetail(data); })
      .catch((cause) => { if (alive) setError(cause instanceof Error ? cause.message : "Não foi possível carregar o diagnóstico."); });
    return () => { alive = false; };
  }, [user.id]);

  async function runAction(actionName: string, successText: string) {
    setBusy(true);
    setError("");
    try {
      const result = await apiRequest<{ revoked?: number; previewUrl?: string }>(`/system-admin/users/${user.id}/${actionName}`, { method: "POST" });
      if (actionName === "revoke-sessions") notify(`Sessões encerradas: ${result.revoked ?? 0}.`);
      else notify(successText);
      if (result.previewUrl) notify(`Link de redefinição (dev): ${result.previewUrl}`);
      const fresh = await apiRequest<UserDetail>(`/system-admin/users/${user.id}`);
      setDetail(fresh);
      onChanged(fresh);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Falha na ação de suporte.");
    } finally {
      setBusy(false);
    }
  }

  const locked = detail ? detail.status !== "ACTIVE" || Boolean(detail.lockedUntil) || detail.failedLoginAttempts > 0 : false;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#082016]/60 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose(); }}>
      <div className="mangora-app max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border-2 border-[#123d2b] bg-[#fffdf8] p-5 shadow-[8px_9px_0_#ffb21a] sm:p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[.16em] text-[#a93a05]">Central de suporte</p>
            <h2 className="mt-1 text-xl font-black">{user.name}</h2>
            <p className="mt-1 text-[10px] text-[#597064]">{user.email}</p>
          </div>
          <button type="button" onClick={onClose} disabled={busy} className="grid size-8 place-items-center rounded-lg border border-[#123d2b]/15 bg-white disabled:opacity-50"><X className="size-4" /></button>
        </div>

        {error && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700">{error}</p>}

        {!detail ? (
          <div className="flex min-h-40 items-center justify-center text-xs text-[#597064]"><LoaderCircle className="mr-2 size-4 animate-spin" />Carregando diagnóstico...</div>
        ) : (
          <>
            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
              <InfoCard label="Status da conta"><Badge value={detail.status} /></InfoCard>
              <InfoCard label="Admin do sistema">{detail.isSystemAdmin ? <span className="flex items-center gap-1 text-[10px] font-black text-[#147a45]"><ShieldCheck className="size-3.5" />Sim</span> : <span className="text-[10px] font-bold text-[#597064]">Não</span>}</InfoCard>
              <InfoCard label="Tentativas de login">{detail.failedLoginAttempts > 0 ? <span className="text-[10px] font-black text-red-600">{detail.failedLoginAttempts}</span> : <span className="text-[10px] font-bold text-[#597064]">0</span>}</InfoCard>
              <InfoCard label="Bloqueado até">{detail.lockedUntil ? <span className="text-[10px] font-black text-red-600">{formatDate(detail.lockedUntil)}</span> : <span className="text-[10px] font-bold text-[#597064]">—</span>}</InfoCard>
              <InfoCard label="Senha alterada em">{detail.passwordChangedAt ? <span className="text-[10px] font-bold text-[#315847]">{formatDate(detail.passwordChangedAt)}</span> : <span className="text-[10px] font-bold text-[#597064]">nunca</span>}</InfoCard>
              <InfoCard label="Cadastro">{formatDate(detail.createdAt)}</InfoCard>
            </div>

            <div className="mt-5">
              <p className="text-[9px] font-black uppercase tracking-[.16em] text-[#315847]">Empresas do usuário ({detail.memberships.length})</p>
              <div className="mt-2 space-y-2">
                {detail.memberships.length ? detail.memberships.map((membership) => (
                  <div key={membership.id} className="flex items-center justify-between gap-3 rounded-xl border border-[#123d2b]/10 bg-white px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-black">{membership.company.tradeName}</p>
                      <p className="mt-0.5 font-mono text-[9px] text-[#597064]">{membership.company.slug} · {membership.role}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[10px] font-black text-[#a93a05]">{membership.company.subscriptionPlan}</p>
                      <p className="mt-0.5 text-[9px] text-[#597064]">{membership.active ? "Vínculo ativo" : "Vínculo inativo"} · {membership.company.status}</p>
                    </div>
                  </div>
                )) : <p className="rounded-xl border border-dashed border-[#123d2b]/15 px-4 py-3 text-center text-[10px] text-[#597064]">Usuário sem vínculo com nenhuma empresa.</p>}
              </div>
            </div>

            <div className="mt-5">
              <p className="text-[9px] font-black uppercase tracking-[.16em] text-[#315847]">Sessões ativas ({detail.sessions.length})</p>
              <div className="mt-2 space-y-1.5">
                {detail.sessions.length ? detail.sessions.slice(0, 5).map((session) => (
                  <div key={session.id} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 font-mono text-[9px] text-[#597064]">
                    <span>{session.ipAddress ?? "IP não registrado"}</span><span>{formatDate(session.createdAt)}</span>
                  </div>
                )) : <p className="rounded-xl border border-dashed border-[#123d2b]/15 px-4 py-3 text-center text-[10px] text-[#597064]">Nenhuma sessão ativa.</p>}
              </div>
            </div>

            <div className="mt-6 grid gap-2 sm:grid-cols-3">
              <ActionButton disabled={busy} onClick={() => void runAction("unlock", "Acesso desbloqueado.")} tone={locked ? "bg-[#147a45]" : "bg-[#123d2b]/40"}><Unlock className="size-4" />Desbloquear acesso</ActionButton>
              <ActionButton disabled={busy || !detail.sessions.length} onClick={() => void runAction("revoke-sessions", "Sessões encerradas.")} tone="bg-[#ce4a0a]"><LogOut className="size-4" />Encerrar sessões</ActionButton>
              <ActionButton disabled={busy} onClick={() => void runAction("reset-password", "E-mail de redefinição de senha enviado.")} tone="bg-[#123d2b]"><KeyRound className="size-4" />Redefinir senha</ActionButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
function InfoCard({ label, children }: { label: string; children: React.ReactNode }) { return <div className="rounded-xl border border-[#123d2b]/10 bg-white p-3"><p className="text-[9px] text-[#597064]">{label}</p><div className="mt-1.5">{children}</div></div>; }
function ActionButton({ children, disabled, onClick, tone }: { children: React.ReactNode; disabled?: boolean; onClick: () => void; tone: string }) { return <button type="button" disabled={disabled} onClick={onClick} className={`flex h-11 items-center justify-center gap-2 rounded-xl px-3 text-[10px] font-black text-white transition disabled:cursor-not-allowed disabled:opacity-40 ${tone}`}>{children}</button>; }
