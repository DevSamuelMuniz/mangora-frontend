"use client";

import { useFormatters } from "@/i18n/provider";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Activity, ArrowLeft, Building2, Check, CheckCircle2, CreditCard, Globe2, KeyRound, LayoutDashboard, LifeBuoy, LoaderCircle, LockKeyhole, LogOut, Pencil, RefreshCw, Search, ShieldCheck, Tags, Unlock, Users, X } from "lucide-react";
import BrandLogo from "@/components/brand/BrandLogo";
import { useT } from "@/i18n/provider";
import type { Translate } from "@/i18n/runtime";
import { ApiError, apiRequest } from "@/lib/api/client";


type Tab = "overview" | "companies" | "users" | "plans" | "prices" | "coupons";
type Overview = { metrics: { users: number; activeUsers: number; companies: number; activeCompanies: number; newCompanies: number; monthlyRecurringRevenue: number }; plans: Plan[]; recentCompanies: Company[] };
type Plan = { id: string; name: string; price: number | null; ownerLimit: number | null; employeeLimit: number | null; unitLimit: number | null; companies: number };
type User = { id: string; name: string; email: string; phone: string | null; status: string; isSystemAdmin: boolean; failedLoginAttempts: number; lockedUntil: string | null; createdAt: string; _count: { memberships: number; sessions: number } };
type UserDetail = { id: string; name: string; email: string; phone: string | null; status: string; isSystemAdmin: boolean; failedLoginAttempts: number; lockedUntil: string | null; passwordChangedAt: string | null; createdAt: string; updatedAt: string; memberships: Array<{ id: string; role: string; active: boolean; createdAt: string; company: { id: string; tradeName: string; slug: string; status: string; subscriptionPlan: string; subscriptionStatus: string } }>; sessions: Array<{ id: string; ipAddress: string | null; createdAt: string }> };
type Company = { id: string; tradeName: string; slug: string; email?: string | null; document?: string | null; status: string; subscriptionPlan: string; subscriptionStatus: string; subscriptionPrice?: number | string; subscriptionUnitPriceOverride?: number | string | null; subscriptionOwnerLimitOverride?: number | null; subscriptionEmployeeLimitOverride?: number | null; subscriptionUnitLimitOverride?: number | null; trialEndsAt?: string | null; nextBillingAt?: string | null; billingDueAt?: string | null; billingNoticeAt?: string | null; billingSuspendsAt?: string | null; timezone?: string | null; createdAt: string; _count: { memberships: number; sales?: number } };
type Coupon = { id: string; code: string; type: "PERCENT" | "FIXED"; value: number; planScope: string | null; maxUses: number; usedCount: number; status: string };
type PlanPrice = { id: string; market: string | null; country: string | null; currency: string; amount: number; interval: string; provider: string; providerPriceId: string | null; active: boolean };
type PlanPricing = { id: string; code: string; name: string; active: boolean; prices: PlanPrice[] };

function buildNav(t: Translate) {
  return [
    { id: "overview" as const, label: t("systemAdmin.nav.overview"), icon: LayoutDashboard },
    { id: "companies" as const, label: t("systemAdmin.nav.companies"), icon: Building2 },
    { id: "users" as const, label: t("systemAdmin.nav.users"), icon: Users },
    { id: "plans" as const, label: t("systemAdmin.nav.plans"), icon: CreditCard },
    { id: "prices" as const, label: t("systemAdmin.nav.prices"), icon: Globe2 },
    { id: "coupons" as const, label: t("systemAdmin.nav.coupons"), icon: Tags },
  ];
}

/** Traduz códigos conhecidos (status, plano) e devolve o código cru quando não há tradução. */
function codeLabel(prefix: string, value: string, t: Translate) {
  const key = `${prefix}.${value}`;
  const translated = t(key);
  return translated === key ? value : translated;
}

export default function SystemAdminConsole({ operatorName }: { operatorName: string }) {
  const t = useT();
  const nav = buildNav(t);
  const [tab, setTab] = useState<Tab>("overview");
  const [overview, setOverview] = useState<Overview | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [planPrices, setPlanPrices] = useState<PlanPricing[]>([]);
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
      const [summary, userList, companyList, couponList, prices] = await Promise.all([
        apiRequest<Overview>("/system-admin/overview"),
        apiRequest<User[]>("/system-admin/users"),
        apiRequest<Company[]>("/system-admin/companies"),
        apiRequest<Coupon[]>("/system-admin/coupons"),
        apiRequest<PlanPricing[]>("/system-admin/plan-prices"),
      ]);
      setOverview(summary); setUsers(userList); setCompanies(companyList); setCoupons(couponList); setPlanPrices(prices);
    } catch (cause) {
      const denied = cause instanceof ApiError && cause.status === 403;
      setAccessDenied(denied);
      setError(denied ? t("systemAdmin.errors.forbidden") : cause instanceof Error ? cause.message : t("systemAdmin.errors.loadCentral"));
    } finally { setLoading(false); }
  }
  useEffect(() => {
    let active = true;
    Promise.all([
      apiRequest<Overview>("/system-admin/overview"),
      apiRequest<User[]>("/system-admin/users"),
      apiRequest<Company[]>("/system-admin/companies"),
      apiRequest<Coupon[]>("/system-admin/coupons"),
      apiRequest<PlanPricing[]>("/system-admin/plan-prices"),
    ]).then(([summary, userList, companyList, couponList, prices]) => {
      if (!active) return;
      setOverview(summary); setUsers(userList); setCompanies(companyList); setCoupons(couponList); setPlanPrices(prices); setLoading(false);
    }).catch((cause: unknown) => {
      if (!active) return;
      const denied = cause instanceof ApiError && cause.status === 403;
      setAccessDenied(denied);
      setError(denied ? t("systemAdmin.errors.forbidden") : cause instanceof Error ? cause.message : t("systemAdmin.errors.loadCentral"));
      setLoading(false);
    });
    return () => { active = false; };
  }, [t]);
  const normalized = search.trim().toLocaleLowerCase("pt-BR");
  const visibleUsers = useMemo(() => users.filter((user) => !normalized || `${user.name} ${user.email}`.toLowerCase().includes(normalized)), [users, normalized]);
  const visibleCompanies = useMemo(() => companies.filter((company) => !normalized || `${company.tradeName} ${company.email ?? ""} ${company.document ?? ""}`.toLowerCase().includes(normalized)), [companies, normalized]);
  const title = nav.find((item) => item.id === tab)?.label ?? t("systemAdmin.nav.central");

  function notify(text: string) { setMessage(text); window.setTimeout(() => setMessage(""), 3500); }

  if (accessDenied) return <RestrictedPage message={error} />;

  return <main className="mangora-app min-h-screen bg-[#e9dfd2]">
    <div className="min-h-screen lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="border-b border-white/10 bg-[#123d2b] px-4 py-4 text-white lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:px-5 lg:py-6">
        <div className="flex items-center justify-between lg:block"><BrandLogo className="h-8" surface="light" priority /><span className="rounded-full bg-white/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[.18em] text-[#ffcf5a]">{t("systemAdmin.header.badge")}</span></div>
        <div className="mt-5 hidden rounded-2xl border border-white/10 bg-white/[.06] p-3 lg:block"><p className="text-[9px] font-bold uppercase tracking-[.16em] text-white/45">{t("systemAdmin.header.operator")}</p><p className="mt-1 truncate text-xs font-extrabold">{operatorName}</p><p className="mt-1 flex items-center gap-1 text-[9px] text-emerald-200"><ShieldCheck className="size-3" />{t("systemAdmin.header.platformAccess")}</p></div>
        <nav className="mt-4 flex gap-2 overflow-x-auto lg:mt-7 lg:block lg:space-y-1.5">{nav.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => { setTab(id); setSearch(""); }} className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold transition lg:w-full ${tab === id ? "bg-[#ce4a0a] text-white shadow-[3px_3px_0_#ffb21a]" : "text-white/65 hover:bg-white/10 hover:text-white"}`}><Icon className="size-4" />{label}</button>)}</nav>
        <Link href="/dashboard" className="mt-6 hidden items-center gap-2 border-t border-white/10 pt-5 text-xs font-bold text-white/55 hover:text-white lg:flex"><ArrowLeft className="size-4" />{t("systemAdmin.header.backToSystem")}</Link>
      </aside>
      <section className="min-w-0">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#123d2b]/15 bg-[#fffdf8]/95 px-4 backdrop-blur sm:px-7"><div><p className="text-[9px] font-black uppercase tracking-[.18em] text-[#a93a05]">{t("systemAdmin.header.eyebrow")}</p><h1 className="text-lg font-black text-[#123d2b]">{title}</h1></div><div className="flex items-center gap-2"><button onClick={() => void load()} disabled={loading} aria-label={t("systemAdmin.header.refresh")} className="grid size-9 place-items-center rounded-xl border border-[#123d2b]/15 bg-white text-[#315847] hover:text-[#ce4a0a]"><RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} /></button><Link href="/dashboard" className="grid size-9 place-items-center rounded-xl border border-[#123d2b]/15 bg-white text-[#315847] lg:hidden"><ArrowLeft className="size-4" /></Link></div></header>
        <div className="p-4 sm:p-7">
          {message && <div role="status" className="mb-4 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-xs font-bold text-green-700"><CheckCircle2 className="size-4" />{message}</div>}
          {loading ? <Loading /> : error ? <Denied message={error} /> : overview && <>
            {(tab === "companies" || tab === "users") && <SearchBar value={search} onChange={setSearch} placeholder={tab === "companies" ? t("systemAdmin.search.companies") : t("systemAdmin.search.users")} />}
            {tab === "overview" && <OverviewPanel data={overview} onCompanies={() => setTab("companies")} />}
            {tab === "companies" && <CompaniesPanel items={visibleCompanies} onEdit={setEditingCompany} />}
            {tab === "users" && <UsersPanel items={visibleUsers} onEdit={setEditingUser} onSupport={setSupportingUser} />}
            {tab === "plans" && <PlansPanel plans={overview.plans} />}
            {tab === "prices" && <PlanPricesPanel plans={planPrices} onReload={() => void load()} notify={notify} />}
            {tab === "coupons" && <CouponsPanel items={coupons} onCreated={(coupon) => { setCoupons((current) => [coupon, ...current]); notify(t("systemAdmin.messages.couponCreated")); }} />}
          </>}
        </div>
      </section>
    </div>
    {editingUser && <UserEditor user={editingUser} onClose={() => setEditingUser(null)} onSaved={(updated) => { setUsers((items) => items.map((item) => item.id === updated.id ? { ...item, ...updated } : item)); setEditingUser(null); notify(t("systemAdmin.messages.userUpdated")); }} />}
    {supportingUser && <SupportEditor user={supportingUser} onClose={() => setSupportingUser(null)} onChanged={(next) => { setUsers((items) => items.map((item) => item.id === next.id ? { ...item, ...next } : item)); }} notify={notify} />}
    {editingCompany && <CompanyEditor company={editingCompany} onClose={() => setEditingCompany(null)} onSaved={(updated) => { setCompanies((items) => items.map((item) => item.id === updated.id ? { ...item, ...updated } : item)); setEditingCompany(null); notify(t("systemAdmin.messages.companyUpdated")); void load(); }} />}
  </main>;
}

function OverviewPanel({ data, onCompanies }: { data: Overview; onCompanies: () => void }) {
  const { formatNumber, formatCurrency } = useFormatters();
  const t = useT();
  const cards = [
  { label: t("systemAdmin.overview.cardCompanies"), value: formatNumber(data.metrics.companies), note: t("systemAdmin.overview.activeCompanies", { count: data.metrics.activeCompanies }), icon: Building2, tone: "bg-[#123d2b] text-white" },
  { label: t("systemAdmin.overview.cardUsers"), value: formatNumber(data.metrics.users), note: t("systemAdmin.overview.activeUsers", { count: data.metrics.activeUsers }), icon: Users, tone: "bg-[#fffdf8] text-[#123d2b]" },
  { label: t("systemAdmin.overview.cardMrr"), value: formatCurrency(data.metrics.monthlyRecurringRevenue), note: t("systemAdmin.overview.mrrNote"), icon: Activity, tone: "bg-[#ffb21a] text-[#123d2b]" },
  { label: t("systemAdmin.overview.cardNew"), value: formatNumber(data.metrics.newCompanies), note: t("systemAdmin.overview.newNote"), icon: CheckCircle2, tone: "bg-[#d4ecdc] text-[#123d2b]" },
]; return <div className="space-y-5"><section className="overflow-hidden rounded-3xl border-2 border-[#123d2b] bg-[#fff8ea] shadow-[7px_8px_0_#ffb21a]"><div className="grid gap-5 p-5 md:grid-cols-[1fr_auto] md:items-end sm:p-7"><div><span className="inline-flex rounded-full bg-[#123d2b] px-3 py-1 text-[9px] font-black uppercase tracking-[.16em] text-[#ffcf5a]">{t("systemAdmin.overview.eyebrow")}</span><h2 className="mt-4 max-w-2xl text-3xl font-black leading-none text-[#123d2b] sm:text-4xl">{t("systemAdmin.overview.titleLine1")}<br/><span className="text-[#ce4a0a]">{t("systemAdmin.overview.titleLine2")}</span></h2><p className="mt-3 max-w-xl text-xs leading-5 text-[#315847]">{t("systemAdmin.overview.copy")}</p></div><button onClick={onCompanies} className="h-11 rounded-xl bg-[#ce4a0a] px-5 text-xs font-black text-white shadow-[0_4px_0_#963203]">{t("systemAdmin.overview.manageCompanies")}</button></div></section><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({ label, value, note, icon: Icon, tone }) => <article key={label} className={`rounded-2xl border border-[#123d2b]/15 p-5 shadow-sm ${tone}`}><div className="flex items-start justify-between"><p className="text-[9px] font-black uppercase tracking-[.14em] opacity-65">{label}</p><Icon className="size-4 opacity-65" /></div><p className="mt-5 text-2xl font-black">{value}</p><p className="mt-1 text-[10px] opacity-65">{note}</p></article>)}</div><section className="rounded-2xl border border-[#123d2b]/15 bg-[#fffdf8] shadow-sm"><div className="border-b border-[#123d2b]/10 px-5 py-4"><h2 className="text-sm font-black">{t("systemAdmin.overview.recentTitle")}</h2><p className="text-[10px] text-[#597064]">{t("systemAdmin.overview.recentCopy")}</p></div><CompanyRows items={data.recentCompanies} onEdit={onCompanies} compact /></section></div>; }

function SearchBar({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) { return <label className="mb-4 flex h-11 max-w-xl items-center gap-2 rounded-xl border border-[#123d2b]/15 bg-white px-3 shadow-sm"><Search className="size-4 text-[#597064]" /><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-full min-w-0 flex-1 border-0 bg-transparent text-xs outline-none" /></label>; }
function CompaniesPanel({ items, onEdit }: { items: Company[]; onEdit: (item: Company) => void }) { const t = useT(); return <section className="overflow-hidden rounded-2xl border border-[#123d2b]/15 bg-[#fffdf8] shadow-sm"><PanelTitle title={t("systemAdmin.companies.panelTitle")} description={t("systemAdmin.companies.panelDescription", { count: items.length })} /><CompanyRows items={items} onEdit={onEdit} /></section>; }
function CompanyRows({ items, onEdit, compact = false }: { items: Company[]; onEdit: ((item: Company) => void) | (() => void); compact?: boolean }) {
  const { formatDate } = useFormatters(); const t = useT(); return <div className="divide-y divide-[#123d2b]/10">{items.map((company) => <div key={company.id} className="grid gap-3 px-5 py-4 hover:bg-[#ffb21a]/5 md:grid-cols-[minmax(0,1.5fr)_1fr_1fr_auto] md:items-center"><div><p className="truncate text-xs font-black text-[#123d2b]">{company.tradeName}</p><p className="mt-1 truncate text-[9px] text-[#597064]">{company.email ?? company.slug} · desde {formatDate(company.createdAt)}</p></div><div><Badge value={company.status} /><p className="mt-1 text-[9px] text-[#597064]">{t("systemAdmin.companies.usersCount", { count: company._count.memberships })}</p></div><div><p className="text-[10px] font-black text-[#a93a05]">{codeLabel("systemAdmin.plans.codes", company.subscriptionPlan, t)}</p><p className="mt-1 text-[9px] text-[#597064]">{codeLabel("systemAdmin.status", company.subscriptionStatus, t)}</p></div><button onClick={() => onEdit(company)} className="flex h-8 items-center justify-center gap-1 rounded-lg border border-[#123d2b]/15 bg-white px-3 text-[10px] font-bold hover:border-[#ce4a0a] hover:text-[#a93a05]"><Pencil className="size-3" />{compact ? t("systemAdmin.companies.open") : t("systemAdmin.companies.edit")}</button></div>)}{!items.length && <Empty text={t("systemAdmin.companies.empty")} />}</div>; }
function UsersPanel({ items, onEdit, onSupport }: { items: User[]; onEdit: (item: User) => void; onSupport: (item: User) => void }) {
  const { formatDate } = useFormatters(); const t = useT(); return <section className="overflow-hidden rounded-2xl border border-[#123d2b]/15 bg-[#fffdf8] shadow-sm"><PanelTitle title={t("systemAdmin.users.panelTitle")} description={t("systemAdmin.users.panelDescription", { count: items.length })} /><div className="divide-y divide-[#123d2b]/10">{items.map((user) => <div key={user.id} className="grid gap-3 px-5 py-4 hover:bg-[#ffb21a]/5 md:grid-cols-[minmax(0,1.5fr)_1fr_1fr_auto] md:items-center"><div><div className="flex items-center gap-2"><p className="truncate text-xs font-black">{user.name}</p>{user.isSystemAdmin && <ShieldCheck className="size-3.5 text-[#147a45]" />}</div><p className="mt-1 truncate text-[9px] text-[#597064]">{user.email}</p></div><div><Badge value={user.status} /><p className="mt-1 text-[9px] text-[#597064]">{t("systemAdmin.users.companiesCount", { count: user._count.memberships })}</p></div><div><p className="text-[10px] font-bold">{t("systemAdmin.users.sessionsCount", { count: user._count.sessions })}</p><p className="mt-1 text-[9px] text-[#597064]">{t("systemAdmin.companies.since", { date: formatDate(user.createdAt) })}</p></div><div className="flex gap-2"><button onClick={() => onSupport(user)} className="flex h-8 items-center justify-center gap-1 rounded-lg border border-[#147a45]/25 bg-[#dff4e7] px-3 text-[10px] font-black text-[#147a45] hover:bg-[#c9ecd6]"><LifeBuoy className="size-3" />{t("systemAdmin.users.support")}</button><button onClick={() => onEdit(user)} className="flex h-8 items-center justify-center gap-1 rounded-lg border border-[#123d2b]/15 bg-white px-3 text-[10px] font-bold hover:border-[#ce4a0a] hover:text-[#a93a05]"><Pencil className="size-3" />{t("systemAdmin.companies.edit")}</button></div></div>)}{!items.length && <Empty text={t("systemAdmin.users.empty")} />}</div></section>; }
function PlansPanel({ plans }: { plans: Plan[] }) {
  const { formatCurrency } = useFormatters(); const t = useT(); return <div><div className="mb-5"><p className="text-[9px] font-black uppercase tracking-[.16em] text-[#a93a05]">{t("systemAdmin.plans.eyebrow")}</p><h2 className="mt-1 text-2xl font-black">{t("systemAdmin.plans.title")}</h2><p className="mt-1 text-xs text-[#597064]">{t("systemAdmin.plans.copy")}</p></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{plans.map((plan, index) => <article key={plan.id} className={`rounded-2xl border-2 p-5 ${index === 2 ? "border-[#ce4a0a] bg-[#fff8ea] shadow-[5px_5px_0_#ffb21a]" : "border-[#123d2b]/15 bg-[#fffdf8]"}`}><div className="flex items-start justify-between"><div><p className="text-[9px] font-black uppercase tracking-[.14em] text-[#597064]">{plan.id}</p><h3 className="mt-1 text-xl font-black">{plan.name}</h3></div><span className="rounded-full bg-[#d4ecdc] px-2.5 py-1 text-[9px] font-black text-[#147a45]">{t("systemAdmin.plans.companiesCount", { count: plan.companies })}</span></div><p className="mt-6 text-2xl font-black text-[#ce4a0a]">{plan.price === null ? t("systemAdmin.plans.underConsultation") : plan.price === 0 ? t("systemAdmin.plans.free") : t("systemAdmin.plans.perMonth", { price: formatCurrency(plan.price) })}</p><div className="mt-5 grid grid-cols-3 gap-2 border-t border-[#123d2b]/10 pt-4 text-[10px]"><span className="text-[#597064]">{t("systemAdmin.plans.owners")}<strong className="mt-1 block text-xs text-[#123d2b]">{plan.ownerLimit ?? t("systemAdmin.plans.byArrangement")}</strong></span><span className="text-[#597064]">{t("systemAdmin.plans.employees")}<strong className="mt-1 block text-xs text-[#123d2b]">{plan.employeeLimit ?? t("systemAdmin.plans.byArrangement")}</strong></span><span className="text-[#597064]">{t("systemAdmin.plans.units")}<strong className="mt-1 block text-xs text-[#123d2b]">{plan.unitLimit ?? t("systemAdmin.plans.byArrangement")}</strong></span></div></article>)}</div><p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-[10px] leading-4 text-amber-800">{t("systemAdmin.plans.warning")}</p></div>; }

function PlanPricesPanel({ plans, onReload, notify }: { plans: PlanPricing[]; onReload: () => void; notify: (text: string) => void }) {
  const t = useT();
  return <div className="space-y-5"><div><p className="text-[9px] font-black uppercase tracking-[.16em] text-[#a93a05]">{t("systemAdmin.prices.eyebrow")}</p><h2 className="mt-1 text-2xl font-black">{t("systemAdmin.prices.title")}</h2><p className="mt-1 max-w-2xl text-xs leading-5 text-[#597064]">{t("systemAdmin.prices.copy")}</p></div>{plans.map((plan) => <section key={plan.id} className="overflow-hidden rounded-2xl border border-[#123d2b]/15 bg-[#fffdf8]"><PanelTitle title={plan.name} description={t("systemAdmin.prices.activeCount", { count: plan.prices.filter((price) => price.active).length })} /><div className="divide-y divide-[#123d2b]/10">{plan.prices.map((price) => <PlanPriceRow key={price.id} planCode={plan.code} price={price} onSaved={() => { notify(t("systemAdmin.messages.priceUpdated", { plan: plan.name, market: price.country ?? price.market ?? "" })); onReload(); }} />)}</div></section>)}</div>;
}

function PlanPriceRow({ planCode, price, onSaved }: { planCode: string; price: PlanPrice; onSaved: () => void }) {
  const t = useT();
  const [amount, setAmount] = useState(String(price.amount));
  const [providerPriceId, setProviderPriceId] = useState(price.providerPriceId ?? "");
  const [active, setActive] = useState(price.active);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  async function save() {
    setSaving(true); setError("");
    try {
      await apiRequest(`/system-admin/plan-prices/${price.id}`, { method: "PATCH", body: JSON.stringify({
        planCode, market: price.market, country: price.country, currency: price.currency,
        amount: Number(amount), interval: price.interval, provider: price.provider,
        providerPriceId: providerPriceId || null, active,
      }) });
      onSaved();
    } catch (cause) { setError(cause instanceof Error ? cause.message : t("systemAdmin.errors.savePrice")); }
    finally { setSaving(false); }
  }
  return <div className="grid gap-3 px-4 py-4 lg:grid-cols-[90px_100px_120px_130px_minmax(180px,1fr)_auto] lg:items-end"><div><p className="text-[9px] font-bold text-[#789083]">{t("systemAdmin.prices.market")}</p><strong className="mt-1 block text-xs">{price.country ?? price.market}</strong></div><div><p className="text-[9px] font-bold text-[#789083]">{t("systemAdmin.prices.currency")}</p><strong className="mt-1 block text-xs">{price.currency}</strong></div><Field label={t("systemAdmin.prices.amount")}><input type="number" min="0" step="1" value={amount} onChange={(event) => setAmount(event.target.value)} /></Field><div><p className="text-[9px] font-bold text-[#789083]">{t("systemAdmin.prices.provider")}</p><strong className="mt-2 block text-xs">{price.provider}</strong></div><Field label={t("systemAdmin.prices.providerPriceId")}><input value={providerPriceId} onChange={(event) => setProviderPriceId(event.target.value)} placeholder={price.provider === "PADDLE" ? "pri_..." : "asaas_dynamic_..."} /></Field><div className="flex items-center gap-2"><label className="flex items-center gap-1.5 text-[10px] font-bold"><input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} className="accent-[#147a45]" />{t("systemAdmin.prices.active")}</label><button type="button" disabled={saving || !Number.isInteger(Number(amount))} onClick={() => void save()} className="h-10 rounded-xl bg-[#ce4a0a] px-4 text-[10px] font-black text-white disabled:opacity-50">{saving ? t("systemAdmin.prices.saving") : t("systemAdmin.prices.save")}</button></div>{error && <p role="alert" className="text-xs font-bold text-red-600 lg:col-span-6">{error}</p>}</div>;
}

function UserEditor({ user, onClose, onSaved }: { user: User; onClose: () => void; onSaved: (user: Partial<User> & { id: string }) => void }) { const t = useT(); const [form, setForm] = useState({ name: user.name, email: user.email, phone: user.phone ?? "", status: user.status, isSystemAdmin: user.isSystemAdmin }); return <Editor title={t("systemAdmin.editors.editUserTitle")} description={form.isSystemAdmin ? t("systemAdmin.editors.adminGlobal") : t("systemAdmin.editors.accountMangora")} onClose={onClose} onSave={async () => { const updated = await apiRequest<Partial<User> & { id: string }>(`/system-admin/users/${user.id}`, { method: "PATCH", body: JSON.stringify(form) }); onSaved(updated); }}><Field label={t("systemAdmin.editors.name")}><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field><Field label={t("systemAdmin.editors.email")}><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field><Field label={t("systemAdmin.editors.phone")}><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field><Field label={t("systemAdmin.editors.status")}><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="ACTIVE">{t("systemAdmin.editors.userActive")}</option><option value="BLOCKED">{t("systemAdmin.editors.userBlocked")}</option></select></Field><label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-[#123d2b]/15 bg-white px-4 py-3 sm:col-span-2"><span className="flex items-center gap-2 text-[10px] font-bold text-[#315847]"><ShieldCheck className="size-4 text-[#147a45]" />{t("systemAdmin.editors.systemAdmin")}</span><input type="checkbox" checked={form.isSystemAdmin} onChange={(e) => setForm({ ...form, isSystemAdmin: e.target.checked })} className="size-5 accent-[#147a45]" /></label></Editor>; }
function CompanyEditor({ company, onClose, onSaved }: { company: Company; onClose: () => void; onSaved: (company: Partial<Company> & { id: string }) => void }) { const t = useT(); const [form, setForm] = useState({ status: company.status, subscriptionPlan: company.subscriptionPlan, subscriptionStatus: company.subscriptionStatus, unitPrice: company.subscriptionUnitPriceOverride == null ? "" : String(company.subscriptionUnitPriceOverride), ownerLimit: company.subscriptionOwnerLimitOverride == null ? "" : String(company.subscriptionOwnerLimitOverride), employeeLimit: company.subscriptionEmployeeLimitOverride == null ? "" : String(company.subscriptionEmployeeLimitOverride), unitLimit: company.subscriptionUnitLimitOverride == null ? "" : String(company.subscriptionUnitLimitOverride), trialEndsAt: company.trialEndsAt?.slice(0, 10) ?? "", billingDueAt: company.billingDueAt?.slice(0, 10) ?? "", billingNoticeAt: company.billingNoticeAt?.slice(0, 10) ?? "", billingSuspendsAt: company.billingSuspendsAt?.slice(0, 10) ?? "", billingEmail: "" }); const optionalNumber = (value: string) => value === "" ? null : Number(value); const [paying, setPaying] = useState(false); return <Editor title={company.tradeName} description={t("systemAdmin.editors.companyDescription")} onClose={onClose} onSave={async () => { const updated = await apiRequest<Partial<Company> & { id: string }>(`/system-admin/companies/${company.id}`, { method: "PATCH", body: JSON.stringify({ status: form.status, subscriptionPlan: form.subscriptionPlan, subscriptionStatus: form.subscriptionStatus, subscriptionUnitPriceOverride: optionalNumber(form.unitPrice), subscriptionOwnerLimitOverride: optionalNumber(form.ownerLimit), subscriptionEmployeeLimitOverride: optionalNumber(form.employeeLimit), subscriptionUnitLimitOverride: optionalNumber(form.unitLimit), trialEndsAt: form.trialEndsAt ? `${form.trialEndsAt}T23:59:59.000-03:00` : undefined, billingDueAt: form.billingDueAt ? `${form.billingDueAt}T00:00:00.000-03:00` : undefined, billingNoticeAt: form.billingNoticeAt ? `${form.billingNoticeAt}T08:00:00.000-03:00` : undefined, billingSuspendsAt: form.billingSuspendsAt ? `${form.billingSuspendsAt}T00:00:00.000-03:00` : undefined }) }); onSaved(updated); }}><Field label={t("systemAdmin.editors.companyAccess")}><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="ACTIVE">{t("systemAdmin.editors.companyActive")}</option><option value="SUSPENDED">{t("systemAdmin.editors.companySuspended")}</option></select></Field><Field label={t("systemAdmin.editors.plan")}><select value={form.subscriptionPlan} onChange={(e) => setForm({ ...form, subscriptionPlan: e.target.value })}>{["FREE", "START", "BUSINESS", "PREMIUM", "ENTERPRISE"].map((plan) => <option key={plan} value={plan}>{codeLabel("systemAdmin.plans.codes", plan, t)}</option>)}</select></Field><Field label={t("systemAdmin.editors.subscriptionStatus")}><select value={form.subscriptionStatus} onChange={(e) => setForm({ ...form, subscriptionStatus: e.target.value })}>{["TRIAL", "PENDING", "ACTIVE", "PAST_DUE", "CANCELLED"].map((status) => <option key={status} value={status}>{codeLabel("systemAdmin.status", status, t)}</option>)}</select></Field><Field label={t("systemAdmin.editors.unitPrice")}><input type="number" min="0" step="0.01" placeholder={t("systemAdmin.editors.planDefaultPlaceholder")} value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: e.target.value })} /></Field><Field label={t("systemAdmin.editors.ownersLimit")}><input type="number" min="1" placeholder={t("systemAdmin.editors.planDefaultPlaceholder")} value={form.ownerLimit} onChange={(e) => setForm({ ...form, ownerLimit: e.target.value })} /></Field><Field label={t("systemAdmin.editors.employeesLimit")}><input type="number" min="0" placeholder={t("systemAdmin.editors.planDefaultPlaceholder")} value={form.employeeLimit} onChange={(e) => setForm({ ...form, employeeLimit: e.target.value })} /></Field><Field label={t("systemAdmin.editors.unitsLimit")}><input type="number" min="1" placeholder={t("systemAdmin.editors.planDefaultPlaceholder")} value={form.unitLimit} onChange={(e) => setForm({ ...form, unitLimit: e.target.value })} /></Field><Field label={t("systemAdmin.editors.trialEnds")}><input type="date" value={form.trialEndsAt} onChange={(e) => setForm({ ...form, trialEndsAt: e.target.value })} /></Field><div className="sm:col-span-2 rounded-2xl border border-[#123d2b]/15 bg-[#f8f3ea] p-4"><p className="text-[10px] font-black uppercase tracking-[.14em] text-[#a93a05]">{t("systemAdmin.editors.billingTitle")}</p><p className="mt-1 text-[10px] leading-4 text-[#597064]">{t("systemAdmin.editors.billingHint")}</p><div className="mt-3 grid gap-4 sm:grid-cols-3"><Field label={t("systemAdmin.editors.billingDueAt")}><input type="date" value={form.billingDueAt} onChange={(e) => { const due = e.target.value; setForm((current) => ({ ...current, billingDueAt: due, billingNoticeAt: due && !current.billingNoticeAt ? shiftDate(due, -3) : current.billingNoticeAt, billingSuspendsAt: due && !current.billingSuspendsAt ? shiftDate(due, 10) : current.billingSuspendsAt })); }} /></Field><Field label={t("systemAdmin.editors.billingNoticeAt")}><input type="date" value={form.billingNoticeAt} onChange={(e) => setForm({ ...form, billingNoticeAt: e.target.value })} /></Field><Field label={t("systemAdmin.editors.billingSuspendsAt")}><input type="date" value={form.billingSuspendsAt} onChange={(e) => setForm({ ...form, billingSuspendsAt: e.target.value })} /></Field></div><p className="mt-3 rounded-xl bg-white px-3 py-2 text-[10px] font-bold text-[#315847]">{billingScheduleLabel(form, t)}</p><button type="button" disabled={paying} onClick={() => { setPaying(true); void apiRequest<Partial<Company> & { id: string }>(`/system-admin/companies/${company.id}/confirm-payment`, { method: "POST" }).then((updated) => onSaved(updated)).finally(() => setPaying(false)); }} className="mt-2 inline-flex h-9 items-center gap-2 rounded-xl bg-[#123d2b] px-3 text-[10px] font-black text-white disabled:opacity-60">{paying ? <LoaderCircle className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}{t("systemAdmin.editors.registerPayment")}</button></div><div className="sm:col-span-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[10px] leading-4 text-amber-800">{t("systemAdmin.editors.limitsHint")}</div></Editor>; }
function Editor({ title, description, onClose, onSave, children }: { title: string; description: string; onClose: () => void; onSave: () => Promise<void>; children: React.ReactNode }) { const t = useT(); const [saving, setSaving] = useState(false); const [error, setError] = useState(""); return <div className="fixed inset-0 z-50 grid place-items-center bg-[#082016]/60 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><form onSubmit={(event) => { event.preventDefault(); setSaving(true); setError(""); void onSave().catch((cause) => setError(cause instanceof Error ? cause.message : t("systemAdmin.errors.save"))).finally(() => setSaving(false)); }} className="mangora-app max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border-2 border-[#123d2b] bg-[#fffdf8] p-5 shadow-[8px_9px_0_#ffb21a] sm:p-6"><div className="flex items-start justify-between"><div><p className="text-[9px] font-black uppercase tracking-[.16em] text-[#a93a05]">{t("systemAdmin.editors.eyebrow")}</p><h2 className="mt-1 text-xl font-black">{title}</h2><p className="mt-1 text-[10px] text-[#597064]">{description}</p></div><button type="button" onClick={onClose} className="grid size-8 place-items-center rounded-lg border border-[#123d2b]/15 bg-white"><X className="size-4" /></button></div><div className="mt-5 grid gap-4 sm:grid-cols-2">{children}</div>{error && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700">{error}</p>}<div className="mt-6 flex justify-end gap-2"><button type="button" onClick={onClose} className="h-10 rounded-xl border border-[#123d2b]/15 bg-white px-4 text-xs font-bold">{t("systemAdmin.editors.cancel")}</button><button disabled={saving} className="flex h-10 items-center gap-2 rounded-xl bg-[#ce4a0a] px-5 text-xs font-black text-white disabled:opacity-60">{saving && <LoaderCircle className="size-4 animate-spin" />}{t("systemAdmin.editors.saveChanges")}</button></div></form></div>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="text-[10px] font-bold text-[#315847] [&_input]:mt-1.5 [&_input]:h-10 [&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-[#123d2b]/15 [&_input]:bg-white [&_input]:px-3 [&_input]:text-xs [&_select]:mt-1.5 [&_select]:h-10 [&_select]:w-full [&_select]:rounded-xl [&_select]:border [&_select]:border-[#123d2b]/15 [&_select]:bg-white [&_select]:px-3 [&_select]:text-xs">{label}{children}</label>; }
function PanelTitle({ title, description }: { title: string; description: string }) { return <div className="border-b border-[#123d2b]/10 px-5 py-4"><h2 className="text-sm font-black">{title}</h2><p className="mt-1 text-[10px] text-[#597064]">{description}</p></div>; }
function Badge({ value }: { value: string }) { const t = useT(); const positive = value === "ACTIVE"; return <span className={`inline-flex rounded-full px-2 py-1 text-[8px] font-black uppercase tracking-wider ${positive ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-800"}`}>{codeLabel("systemAdmin.status", value, t)}</span>; }
function Loading() { const t = useT(); return <div className="grid min-h-[55vh] place-items-center"><div className="text-center"><LoaderCircle className="mx-auto size-7 animate-spin text-[#ce4a0a]" /><p className="mt-3 text-xs font-bold text-[#597064]">{t("systemAdmin.state.loading")}</p></div></div>; }
function Denied({ message }: { message: string }) { const t = useT(); return <div className="mx-auto mt-12 max-w-lg rounded-3xl border-2 border-[#123d2b] bg-[#fffdf8] p-7 text-center shadow-[7px_8px_0_#ffb21a]"><LockKeyhole className="mx-auto size-9 text-[#ce4a0a]" /><h2 className="mt-4 text-xl font-black">{t("systemAdmin.state.restricted")}</h2><p className="mt-2 text-xs leading-5 text-[#597064]">{message}</p><Link href="/dashboard" className="mt-5 inline-flex h-10 items-center rounded-xl bg-[#123d2b] px-5 text-xs font-black text-white">{t("systemAdmin.header.backToDashboard")}</Link></div>; }
function RestrictedPage({ message }: { message: string }) { const t = useT(); return <main className="mangora-public grid min-h-screen place-items-center bg-[#e9dfd2] p-5"><section className="w-full max-w-md rounded-3xl border-2 border-[#123d2b] bg-[#fffdf8] p-7 text-center shadow-[7px_8px_0_#ffb21a] sm:p-9"><div className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#ffe4c7] text-[#ce4a0a]"><LockKeyhole className="size-7" /></div><p className="mt-5 text-[9px] font-black uppercase tracking-[.18em] text-[#a93a05]">{t("systemAdmin.state.protectedAccess")}</p><h1 className="mt-2 text-2xl font-black text-[#123d2b]">{t("systemAdmin.state.restricted")}</h1><p className="mt-3 text-xs leading-5 text-[#597064]">{message}</p><Link href="/dashboard" className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-[#123d2b] px-5 text-xs font-black text-white transition hover:-translate-y-0.5"><ArrowLeft className="size-4" />{t("systemAdmin.header.backToDashboard")}</Link></section></main>; }
function Empty({ text }: { text: string }) { return <div className="p-10 text-center text-xs font-bold text-[#597064]">{text}</div>; }

/** Soma (ou subtrai) dias em uma data `AAAA-MM-DD`, devolvendo o mesmo formato. */
function shiftDate(dateKey: string, days: number): string {
  const date = new Date(`${dateKey}T12:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return dateKey;
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Resumo legível da régua marcada (aviso → cobrança → encerra). */
function billingScheduleLabel(form: { billingDueAt: string; billingNoticeAt: string; billingSuspendsAt: string }, t: (key: string, values?: Record<string, string | number>) => string): string {
  const short = (dateKey: string) => {
    const [year, month, day] = dateKey.split("-");
    return year && month && day ? `${day}/${month}` : "";
  };
  const parts: string[] = [];
  if (form.billingNoticeAt) parts.push(t("systemAdmin.editors.billingTimelineNotice", { date: short(form.billingNoticeAt) }));
  if (form.billingDueAt) parts.push(t("systemAdmin.editors.billingTimelineDue", { date: short(form.billingDueAt) }));
  if (form.billingSuspendsAt) parts.push(t("systemAdmin.editors.billingTimelineSuspends", { date: short(form.billingSuspendsAt) }));
  return parts.length ? parts.join(" → ") : t("systemAdmin.editors.billingTimelineEmpty");
}

function SupportEditor({ user, onClose, onChanged, notify }: { user: User; onClose: () => void; onChanged: (user: Partial<User> & { id: string }) => void; notify: (text: string) => void }) {
  const { formatDate } = useFormatters();
  const t = useT();
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let alive = true;
    apiRequest<UserDetail>(`/system-admin/users/${user.id}`)
      .then((data) => { if (alive) setDetail(data); })
      .catch((cause) => { if (alive) setError(cause instanceof Error ? cause.message : t("systemAdmin.errors.diagnosis")); });
    return () => { alive = false; };
  }, [t, user.id]);

  async function runAction(actionName: string, successText: string) {
    setBusy(true);
    setError("");
    try {
      const result = await apiRequest<{ revoked?: number; previewUrl?: string }>(`/system-admin/users/${user.id}/${actionName}`, { method: "POST" });
      if (actionName === "revoke-sessions") notify(t("systemAdmin.messages.sessionsRevoked", { count: result.revoked ?? 0 }));
      else notify(successText);
      if (result.previewUrl) notify(t("systemAdmin.messages.resetLinkDev", { url: result.previewUrl }));
      const fresh = await apiRequest<UserDetail>(`/system-admin/users/${user.id}`);
      setDetail(fresh);
      onChanged(fresh);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t("systemAdmin.errors.supportAction"));
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
            <p className="text-[9px] font-black uppercase tracking-[.16em] text-[#a93a05]">{t("systemAdmin.support.eyebrow")}</p>
            <h2 className="mt-1 text-xl font-black">{user.name}</h2>
            <p className="mt-1 text-[10px] text-[#597064]">{user.email}</p>
          </div>
          <button type="button" onClick={onClose} disabled={busy} className="grid size-8 place-items-center rounded-lg border border-[#123d2b]/15 bg-white disabled:opacity-50"><X className="size-4" /></button>
        </div>

        {error && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700">{error}</p>}

        {!detail ? (
          <div className="flex min-h-40 items-center justify-center text-xs text-[#597064]"><LoaderCircle className="mr-2 size-4 animate-spin" />{t("systemAdmin.support.diagnosing")}</div>
        ) : (
          <>
            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
              <InfoCard label={t("systemAdmin.support.accountStatus")}><Badge value={detail.status} /></InfoCard>
              <InfoCard label={t("systemAdmin.support.systemAdmin")}>{detail.isSystemAdmin ? <span className="flex items-center gap-1 text-[10px] font-black text-[#147a45]"><ShieldCheck className="size-3.5" />{t("systemAdmin.support.yes")}</span> : <span className="text-[10px] font-bold text-[#597064]">{t("systemAdmin.support.no")}</span>}</InfoCard>
              <InfoCard label={t("systemAdmin.support.loginAttempts")}>{detail.failedLoginAttempts > 0 ? <span className="text-[10px] font-black text-red-600">{detail.failedLoginAttempts}</span> : <span className="text-[10px] font-bold text-[#597064]">0</span>}</InfoCard>
              <InfoCard label={t("systemAdmin.support.lockedUntil")}>{detail.lockedUntil ? <span className="text-[10px] font-black text-red-600">{formatDate(detail.lockedUntil)}</span> : <span className="text-[10px] font-bold text-[#597064]">—</span>}</InfoCard>
              <InfoCard label={t("systemAdmin.support.passwordChangedAt")}>{detail.passwordChangedAt ? <span className="text-[10px] font-bold text-[#315847]">{formatDate(detail.passwordChangedAt)}</span> : <span className="text-[10px] font-bold text-[#597064]">{t("systemAdmin.support.never")}</span>}</InfoCard>
              <InfoCard label={t("systemAdmin.support.created")}>{formatDate(detail.createdAt)}</InfoCard>
            </div>

            <div className="mt-5">
              <p className="text-[9px] font-black uppercase tracking-[.16em] text-[#315847]">{t("systemAdmin.support.memberships", { count: detail.memberships.length })}</p>
              <div className="mt-2 space-y-2">
                {detail.memberships.length ? detail.memberships.map((membership) => (
                  <div key={membership.id} className="flex items-center justify-between gap-3 rounded-xl border border-[#123d2b]/10 bg-white px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-black">{membership.company.tradeName}</p>
                      <p className="mt-0.5 font-mono text-[9px] text-[#597064]">{membership.company.slug} · {codeLabel("employees.roles", membership.role, t)}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[10px] font-black text-[#a93a05]">{codeLabel("systemAdmin.plans.codes", membership.company.subscriptionPlan, t)}</p>
                      <p className="mt-0.5 text-[9px] text-[#597064]">{membership.active ? t("systemAdmin.support.activeLink") : t("systemAdmin.support.inactiveLink")} · {codeLabel("systemAdmin.status", membership.company.status, t)}</p>
                    </div>
                  </div>
                )) : <p className="rounded-xl border border-dashed border-[#123d2b]/15 px-4 py-3 text-center text-[10px] text-[#597064]">{t("systemAdmin.support.noMembership")}</p>}
              </div>
            </div>

            <div className="mt-5">
              <p className="text-[9px] font-black uppercase tracking-[.16em] text-[#315847]">{t("systemAdmin.support.sessionsTitle", { count: detail.sessions.length })}</p>
              <div className="mt-2 space-y-1.5">
                {detail.sessions.length ? detail.sessions.slice(0, 5).map((session) => (
                  <div key={session.id} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 font-mono text-[9px] text-[#597064]">
                    <span>{session.ipAddress ?? t("systemAdmin.support.ipNotRegistered")}</span><span>{formatDate(session.createdAt)}</span>
                  </div>
                )) : <p className="rounded-xl border border-dashed border-[#123d2b]/15 px-4 py-3 text-center text-[10px] text-[#597064]">{t("systemAdmin.support.noSessions")}</p>}
              </div>
            </div>

            <div className="mt-6 grid gap-2 sm:grid-cols-3">
              <ActionButton disabled={busy} onClick={() => void runAction("unlock", t("systemAdmin.messages.unlocked"))} tone={locked ? "bg-[#147a45]" : "bg-[#123d2b]/40"}><Unlock className="size-4" />{t("systemAdmin.support.unlock")}</ActionButton>
              <ActionButton disabled={busy || !detail.sessions.length} onClick={() => void runAction("revoke-sessions", t("systemAdmin.messages.sessionsClosed"))} tone="bg-[#ce4a0a]"><LogOut className="size-4" />{t("systemAdmin.support.revokeSessions")}</ActionButton>
              <ActionButton disabled={busy} onClick={() => void runAction("reset-password", t("systemAdmin.messages.resetEmailSent"))} tone="bg-[#123d2b]"><KeyRound className="size-4" />{t("systemAdmin.support.resetPassword")}</ActionButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
function CouponsPanel({ items, onCreated }: { items: Coupon[]; onCreated: (coupon: Coupon) => void }) {
  const { formatCurrency } = useFormatters();
  const t = useT();
  const [form, setForm] = useState({ code: "", type: "PERCENT", value: "", planScope: "", maxUses: "1", validUntil: "" }); const [saving, setSaving] = useState(false); const [error, setError] = useState("");
  async function create(event: React.FormEvent) { event.preventDefault(); setSaving(true); setError(""); try { const coupon = await apiRequest<Coupon>("/system-admin/coupons", { method: "POST", body: JSON.stringify({ code: form.code, type: form.type, value: Number(form.value), planScope: form.planScope || undefined, maxUses: Number(form.maxUses), validUntil: form.validUntil ? `${form.validUntil}T23:59:59-03:00` : undefined }) }); onCreated(coupon); setForm({ code: "", type: "PERCENT", value: "", planScope: "", maxUses: "1", validUntil: "" }); } catch (cause) { setError(cause instanceof Error ? cause.message : t("systemAdmin.errors.couponCreate")); } finally { setSaving(false); } }
  return <div className="space-y-5"><form onSubmit={create} className="rounded-2xl border-2 border-[#123d2b] bg-[#fffdf8] p-5 shadow-[5px_5px_0_#ffb21a]"><h2 className="text-xl font-black">{t("systemAdmin.coupons.title")}</h2><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><Field label={t("systemAdmin.coupons.code")}><input required pattern="[A-Za-z0-9_-]{3,32}" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="BEMVINDO20" /></Field><Field label={t("systemAdmin.coupons.type")}><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option value="PERCENT">{t("systemAdmin.coupons.typePercent")}</option><option value="FIXED">{t("systemAdmin.coupons.typeFixed")}</option></select></Field><Field label={t("systemAdmin.coupons.discount")}><input required type="number" min="0.01" max={form.type === "PERCENT" ? 100 : undefined} step="0.01" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} /></Field><Field label={t("systemAdmin.coupons.plan")}><select value={form.planScope} onChange={(e) => setForm({ ...form, planScope: e.target.value })}><option value="">{t("systemAdmin.coupons.planAll")}</option>{["START", "BUSINESS", "PREMIUM"].map((plan) => <option key={plan} value={plan}>{codeLabel("systemAdmin.plans.codes", plan, t)}</option>)}</select></Field><Field label={t("systemAdmin.coupons.maxUses")}><input required type="number" min="1" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} /></Field><Field label={t("systemAdmin.coupons.validity")}><input type="date" value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} /></Field></div>{error && <p className="mt-3 text-xs font-bold text-red-600">{error}</p>}<button disabled={saving} className="mt-4 h-10 rounded-xl bg-[#ce4a0a] px-5 text-xs font-black text-white">{saving ? t("systemAdmin.coupons.creating") : t("systemAdmin.coupons.create")}</button></form><section className="overflow-hidden rounded-2xl border border-[#123d2b]/15 bg-[#fffdf8]"><PanelTitle title={t("systemAdmin.coupons.listTitle")} description={t("systemAdmin.coupons.listDescription")} /><div className="divide-y divide-[#123d2b]/10">{items.map((coupon) => <div key={coupon.id} className="grid gap-2 px-5 py-4 sm:grid-cols-4"><strong className="text-xs">{coupon.code}</strong><span className="text-xs">{coupon.type === "PERCENT" ? `${coupon.value}%` : formatCurrency(coupon.value)}</span><span className="text-[10px]">{t("systemAdmin.coupons.uses", { used: coupon.usedCount, max: coupon.maxUses })}</span><Badge value={coupon.status} /></div>)}{!items.length && <Empty text={t("systemAdmin.coupons.empty")} />}</div></section></div>;
}

function InfoCard({ label, children }: { label: string; children: React.ReactNode }) { return <div className="rounded-xl border border-[#123d2b]/10 bg-white p-3"><p className="text-[9px] text-[#597064]">{label}</p><div className="mt-1.5">{children}</div></div>; }
function ActionButton({ children, disabled, onClick, tone }: { children: React.ReactNode; disabled?: boolean; onClick: () => void; tone: string }) { return <button type="button" disabled={disabled} onClick={onClick} className={`flex h-11 items-center justify-center gap-2 rounded-xl px-3 text-[10px] font-black text-white transition disabled:cursor-not-allowed disabled:opacity-40 ${tone}`}>{children}</button>; }
