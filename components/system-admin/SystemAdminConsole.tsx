"use client";

import { useFormatters } from "@/i18n/provider";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Activity, AlertTriangle, ArrowLeft, Building2, Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, CreditCard, Globe2, KeyRound, LayoutDashboard, LifeBuoy, LoaderCircle, LockKeyhole, LogOut, Pencil, RefreshCw, Search, ShieldCheck, Tags, Unlock, Users, X, SlidersHorizontal, CalendarClock, CircleDollarSign, ExternalLink } from "lucide-react";
import BrandLogo from "@/components/brand/BrandLogo";
import { useT } from "@/i18n/provider";
import type { Translate } from "@/i18n/runtime";
import { ApiError, apiRequest } from "@/lib/api/client";
import BillingConfigPanel from "./BillingConfigPanel";


type Tab = "overview" | "companies" | "users" | "plans" | "prices" | "coupons" | "billing" | "payments" | "config";
const tabs: Tab[] = ["overview", "companies", "users", "plans", "prices", "coupons", "billing", "payments", "config"];
type Overview = { metrics: { users: number; activeUsers: number; companies: number; activeCompanies: number; newCompanies: number; monthlyRecurringRevenue: number }; plans: Plan[]; recentCompanies: Company[] };
type Plan = { id: string; name: string; price: number | null; ownerLimit: number | null; employeeLimit: number | null; unitLimit: number | null; companies: number };
type User = { id: string; name: string; email: string; phone: string | null; status: string; isSystemAdmin: boolean; failedLoginAttempts: number; lockedUntil: string | null; createdAt: string; _count: { memberships: number; sessions: number } };
type CompanyCounts = { memberships?: number; activeMemberships?: number; activeMembershipLinks?: number; sales?: number; products?: number; sellableProducts?: number; services?: number; customers?: number; orders?: number; categories?: number; suppliers?: number; purchases?: number; financialEntries?: number; stockMovements?: number };
type UserDetail = { id: string; name: string; email: string; phone: string | null; status: string; isSystemAdmin: boolean; failedLoginAttempts: number; lockedUntil: string | null; passwordChangedAt: string | null; createdAt: string; updatedAt: string; memberships: Array<{ id: string; role: string; active: boolean; createdAt: string; company: { id: string; tradeName: string; slug: string; status: string; subscriptionPlan: string; subscriptionStatus: string; _count: Omit<CompanyCounts, "activeMemberships" | "sellableProducts" | "services"> } }>; sessions: Array<{ id: string; ipAddress: string | null; createdAt: string }> };
type Company = { id: string; tradeName: string; slug: string; email?: string | null; document?: string | null; status: string; removedAt?: string | null; businessGroupId?: string | null; subscriptionPlan: string; subscriptionStatus: string; subscriptionPrice?: number | string; subscriptionUnitPriceOverride?: number | string | null; subscriptionOwnerLimitOverride?: number | null; subscriptionEmployeeLimitOverride?: number | null; subscriptionUnitLimitOverride?: number | null; trialEndsAt?: string | null; nextBillingAt?: string | null; billingDueAt?: string | null; billingNoticeAt?: string | null; billingSuspendsAt?: string | null; timezone?: string | null; createdAt: string; _count: CompanyCounts; _groupCount?: CompanyCounts | null; _groupUnitCount?: number | null };
type Coupon = { id: string; code: string; type: "PERCENT" | "FIXED"; value: number; planScope: string | null; maxUses: number; usedCount: number; status: string };
type PlanPrice = { id: string; market: string | null; country: string | null; currency: string; amount: number; interval: string; provider: string; providerPriceId: string | null; active: boolean };
type PlanPricing = { id: string; code: string; name: string; active: boolean; prices: PlanPrice[] };
type SystemPayment = { id: string; providerPaymentId: string; billingType: string | null; status: string; rawStatus: string; amount: number; netAmount: number | null; dueDate: string; paidAt: string | null; invoiceUrl: string | null; bankSlipUrl: string | null; createdAt: string; company: { id: string; tradeName: string; email: string | null; subscriptionPlan: string } };

function buildNav(t: Translate) {
  return [
    { id: "overview" as const, label: t("systemAdmin.nav.overview"), icon: LayoutDashboard },
    { id: "companies" as const, label: t("systemAdmin.nav.companies"), icon: Building2 },
    { id: "billing" as const, label: t("systemAdmin.nav.billing"), icon: CircleDollarSign },
    { id: "payments" as const, label: t("systemAdmin.nav.payments"), icon: CreditCard },
    { id: "users" as const, label: t("systemAdmin.nav.users"), icon: Users },
    { id: "plans" as const, label: t("systemAdmin.nav.plans"), icon: CreditCard },
    { id: "prices" as const, label: t("systemAdmin.nav.prices"), icon: Globe2 },
    { id: "coupons" as const, label: t("systemAdmin.nav.coupons"), icon: Tags },
    { id: "config" as const, label: t("systemAdmin.nav.config"), icon: ShieldCheck },
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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const nav = buildNav(t);
  const requestedTab = searchParams.get("tab");
  const tab: Tab = tabs.includes(requestedTab as Tab) ? requestedTab as Tab : "overview";
  const [overview, setOverview] = useState<Overview | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [planPrices, setPlanPrices] = useState<PlanPricing[]>([]);
  const [payments, setPayments] = useState<SystemPayment[]>([]);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [accessDenied, setAccessDenied] = useState(false);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [supportingUser, setSupportingUser] = useState<User | null>(null);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  function navigate(nextTab: Tab) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextTab === "overview") params.delete("tab"); else params.set("tab", nextTab);
    params.delete("q");
    router.push(`${pathname}${params.size ? `?${params.toString()}` : ""}`, { scroll: false });
    setSearch("");
  }

  useEffect(() => {
    setSearch(searchParams.get("q") ?? "");
  }, [tab, searchParams]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.get("tab");
    if (current && !tabs.includes(current as Tab)) {
      params.delete("tab");
      router.replace(`${pathname}${params.size ? `?${params.toString()}` : ""}`, { scroll: false });
    }
  }, [pathname, router, searchParams]);

  async function load() {
    setLoading(true); setError(""); setAccessDenied(false);
    try {
      const [summary, userList, companyList, couponList, prices, paymentList] = await Promise.all([
        apiRequest<Overview>("/system-admin/overview"),
        apiRequest<User[]>("/system-admin/users"),
        apiRequest<Company[]>("/system-admin/companies"),
        apiRequest<Coupon[]>("/system-admin/coupons"),
        apiRequest<PlanPricing[]>("/system-admin/plan-prices"),
        apiRequest<SystemPayment[]>("/system-admin/payments"),
      ]);
      setOverview(summary); setUsers(userList); setCompanies(companyList); setCoupons(couponList); setPlanPrices(prices); setPayments(paymentList);
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
      apiRequest<SystemPayment[]>("/system-admin/payments"),
    ]).then(([summary, userList, companyList, couponList, prices, paymentList]) => {
      if (!active) return;
      setOverview(summary); setUsers(userList); setCompanies(companyList); setCoupons(couponList); setPlanPrices(prices); setPayments(paymentList); setLoading(false);
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
        <nav className="mt-4 flex gap-2 overflow-x-auto lg:mt-7 lg:block lg:space-y-1.5">{nav.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => navigate(id)} aria-current={tab === id ? "page" : undefined} className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold transition lg:w-full ${tab === id ? "bg-[#ce4a0a] text-white shadow-[3px_3px_0_#ffb21a]" : "text-white/65 hover:bg-white/10 hover:text-white"}`}><Icon className="size-4" />{label}</button>)}</nav>
        <Link href="/dashboard" className="mt-6 hidden items-center gap-2 border-t border-white/10 pt-5 text-xs font-bold text-white/55 hover:text-white lg:flex"><ArrowLeft className="size-4" />{t("systemAdmin.header.backToSystem")}</Link>
      </aside>
      <section className="min-w-0">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#123d2b]/15 bg-[#fffdf8]/95 px-4 backdrop-blur sm:px-7"><div><p className="text-[9px] font-black uppercase tracking-[.18em] text-[#a93a05]">{t("systemAdmin.header.eyebrow")}</p><h1 className="text-lg font-black text-[#123d2b]">{title}</h1></div><div className="flex items-center gap-2"><button onClick={() => void load()} disabled={loading} aria-label={t("systemAdmin.header.refresh")} className="grid size-9 place-items-center rounded-xl border border-[#123d2b]/15 bg-white text-[#315847] hover:text-[#ce4a0a]"><RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} /></button><Link href="/dashboard" className="grid size-9 place-items-center rounded-xl border border-[#123d2b]/15 bg-white text-[#315847] lg:hidden"><ArrowLeft className="size-4" /></Link></div></header>
        <div className="p-4 sm:p-7">
          {message && <div role="status" className="mb-4 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-xs font-bold text-green-700"><CheckCircle2 className="size-4" />{message}</div>}
          {loading ? <Loading /> : error ? <Denied message={error} /> : overview && <>
            {(tab === "companies" || tab === "users" || tab === "payments") && <SearchBar value={search} onChange={(value) => { setSearch(value); const params = new URLSearchParams(searchParams.toString()); if (value) params.set("q", value); else params.delete("q"); router.replace(`${pathname}${params.size ? `?${params.toString()}` : ""}`, { scroll: false }); }} placeholder={tab === "companies" ? t("systemAdmin.search.companies") : tab === "users" ? t("systemAdmin.search.users") : t("systemAdmin.payments.search")} />}
            {tab === "overview" && <OverviewPanel data={overview} onCompanies={() => navigate("companies")} onUsers={() => navigate("users")} onPlans={() => navigate("plans")} onPrices={() => navigate("prices")} onCoupons={() => navigate("coupons")} />}
            {tab === "config" && <BillingConfigPanel />}
            {tab === "companies" && <CompaniesPanel items={visibleCompanies} onEdit={setEditingCompany} onReload={() => void load()} notify={notify} />}
            {tab === "users" && <UsersPanel items={visibleUsers} onEdit={setEditingUser} onSupport={setSupportingUser} />}
            {tab === "plans" && <PlansPanel plans={overview.plans} onCompanies={navigate} onPrices={navigate} />}
            {tab === "prices" && <PlanPricesPanel plans={planPrices} onReload={() => void load()} notify={notify} />}
            {tab === "coupons" && <CouponsPanel items={coupons} onCreated={(coupon) => { setCoupons((current) => [coupon, ...current]); notify(t("systemAdmin.messages.couponCreated")); }} onUpdated={(coupon) => { setCoupons((current) => current.map((item) => item.id === coupon.id ? coupon : item)); notify(t("systemAdmin.messages.couponUpdated")); }} />}
            {tab === "billing" && <BillingPanel items={companies.filter((company) => !company.removedAt)} onEdit={(company) => setEditingCompany({ ...company, subscriptionPlan: company.subscriptionPlan, subscriptionStatus: company.subscriptionStatus })} onPayment={async (company) => { const updated = await apiRequest<Partial<Company> & { id: string }>(`/system-admin/companies/${company.id}/confirm-payment`, { method: "POST" }); setCompanies((items) => items.map((item) => item.id === updated.id ? { ...item, ...updated } : item)); notify(t("systemAdmin.messages.paymentRegistered")); }} />}
            {tab === "payments" && <PaymentsPanel items={payments.filter((item) => (!normalized || `${item.company.tradeName} ${item.company.email ?? ""} ${item.providerPaymentId}`.toLocaleLowerCase("pt-BR").includes(normalized)) && (!paymentStatus || item.status === paymentStatus))} status={paymentStatus} onStatus={setPaymentStatus} />}
          </>}
        </div>
      </section>
    </div>
    {editingUser && <UserEditor user={editingUser} onClose={() => setEditingUser(null)} onSaved={(updated) => { setUsers((items) => items.map((item) => item.id === updated.id ? { ...item, ...updated } : item)); setEditingUser(null); notify(t("systemAdmin.messages.userUpdated")); }} />}
    {supportingUser && <SupportEditor user={supportingUser} onClose={() => setSupportingUser(null)} onChanged={(next) => { setUsers((items) => items.map((item) => item.id === next.id ? { ...item, ...next } : item)); }} notify={notify} />}
    {editingCompany && <CompanyEditor company={editingCompany} onClose={() => setEditingCompany(null)} onSaved={(updated) => { setCompanies((items) => items.map((item) => item.id === updated.id ? { ...item, ...updated } : item)); setEditingCompany(null); notify(t("systemAdmin.messages.companyUpdated")); void load(); }} />}
  </main>;
}

function OverviewPanel({ data, onCompanies, onUsers, onPlans, onPrices, onCoupons }: { data: Overview; onCompanies: () => void; onUsers: () => void; onPlans: () => void; onPrices: () => void; onCoupons: () => void }) {
  const { formatNumber, formatCurrency } = useFormatters();
  const t = useT();
  const cards = [
  { label: t("systemAdmin.overview.cardCompanies"), value: formatNumber(data.metrics.companies), note: t("systemAdmin.overview.activeCompanies", { count: data.metrics.activeCompanies }), icon: Building2, tone: "bg-[#123d2b] text-white" },
  { label: t("systemAdmin.overview.cardUsers"), value: formatNumber(data.metrics.users), note: t("systemAdmin.overview.activeUsers", { count: data.metrics.activeUsers }), icon: Users, tone: "bg-[#fffdf8] text-[#123d2b]" },
  { label: t("systemAdmin.overview.cardMrr"), value: formatCurrency(data.metrics.monthlyRecurringRevenue), note: t("systemAdmin.overview.mrrNote"), icon: Activity, tone: "bg-[#ffb21a] text-[#123d2b]" },
  { label: t("systemAdmin.overview.cardNew"), value: formatNumber(data.metrics.newCompanies), note: t("systemAdmin.overview.newNote"), icon: CheckCircle2, tone: "bg-[#d4ecdc] text-[#123d2b]" },
]; const alerts = data.recentCompanies.filter((company) => company.status !== "ACTIVE" || ["PAST_DUE", "CANCELLED"].includes(company.subscriptionStatus)); return <div className="space-y-5"><section className="overflow-hidden rounded-3xl border-2 border-[#123d2b] bg-[#fff8ea] shadow-[7px_8px_0_#ffb21a]"><div className="grid gap-5 p-5 md:grid-cols-[1fr_auto] md:items-end sm:p-7"><div><span className="inline-flex rounded-full bg-[#123d2b] px-3 py-1 text-[9px] font-black uppercase tracking-[.16em] text-[#ffcf5a]">{t("systemAdmin.overview.eyebrow")}</span><h2 className="mt-4 max-w-2xl text-3xl font-black leading-none text-[#123d2b] sm:text-4xl">{t("systemAdmin.overview.titleLine1")}<br/><span className="text-[#ce4a0a]">{t("systemAdmin.overview.titleLine2")}</span></h2><p className="mt-3 max-w-xl text-xs leading-5 text-[#315847]">{t("systemAdmin.overview.copy")}</p></div><button onClick={onCompanies} className="h-11 rounded-xl bg-[#ce4a0a] px-5 text-xs font-black text-white shadow-[0_4px_0_#963203]">{t("systemAdmin.overview.manageCompanies")}</button></div></section><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({ label, value, note, icon: Icon, tone }) => <button key={label} onClick={label === t("systemAdmin.overview.cardCompanies") ? onCompanies : label === t("systemAdmin.overview.cardUsers") ? onUsers : undefined} className={`rounded-2xl border border-[#123d2b]/15 p-5 text-left shadow-sm ${tone}`}><div className="flex items-start justify-between"><p className="text-[9px] font-black uppercase tracking-[.14em] opacity-65">{label}</p><Icon className="size-4 opacity-65" /></div><p className="mt-5 text-2xl font-black">{value}</p><p className="mt-1 text-[10px] opacity-65">{note}</p></button>)}</div><div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]"><section className="rounded-2xl border border-[#123d2b]/15 bg-[#fffdf8] p-5"><div className="flex items-center gap-2"><AlertTriangle className="size-4 text-[#ce4a0a]"/><h2 className="text-sm font-black">{t("systemAdmin.overview.alertsTitle")}</h2></div><p className="mt-2 text-[10px] leading-4 text-[#597064]">{t("systemAdmin.overview.alertsCopy", { count: alerts.length })}</p>{alerts.length > 0 && <div className="mt-3 space-y-2">{alerts.slice(0, 4).map((company) => <button key={company.id} onClick={onCompanies} className="flex w-full items-center justify-between gap-2 rounded-xl bg-amber-50 px-3 py-2 text-left"><span className="truncate text-[10px] font-bold">{company.tradeName}</span><span className="shrink-0 text-[9px] text-amber-800">{codeLabel("systemAdmin.status", company.subscriptionStatus, t)}</span></button>)}</div>}<div className="mt-4 flex flex-wrap gap-2"><QuickLink onClick={onPlans}>{t("systemAdmin.overview.openPlans")}</QuickLink><QuickLink onClick={onPrices}>{t("systemAdmin.overview.openPrices")}</QuickLink><QuickLink onClick={onCoupons}>{t("systemAdmin.overview.openCoupons")}</QuickLink></div></section><section className="rounded-2xl border border-[#123d2b]/15 bg-[#fffdf8] shadow-sm"><div className="border-b border-[#123d2b]/10 px-5 py-4"><h2 className="text-sm font-black">{t("systemAdmin.overview.recentTitle")}</h2><p className="text-[10px] text-[#597064]">{t("systemAdmin.overview.recentCopy")}</p></div><RecentCompanyRows items={data.recentCompanies} onOpen={onCompanies} /></section></div></div>; }

function QuickLink({ onClick, children }: { onClick: () => void; children: React.ReactNode }) { return <button onClick={onClick} className="rounded-lg border border-[#123d2b]/15 px-3 py-2 text-[9px] font-black text-[#315847] hover:border-[#ce4a0a] hover:text-[#a93a05]">{children}</button>; }

function SearchBar({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) { return <label className="mb-4 flex h-11 max-w-xl items-center gap-2 rounded-xl border border-[#123d2b]/15 bg-white px-3 shadow-sm"><Search className="size-4 text-[#597064]" /><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-full min-w-0 flex-1 border-0 bg-transparent text-xs outline-none" /></label>; }
function RecentCompanyRows({ items, onOpen }: { items: Company[]; onOpen: () => void }) { const { formatDate } = useFormatters(); const t = useT(); return <div className="divide-y divide-[#123d2b]/10">{items.map((company) => <button type="button" key={company.id} onClick={onOpen} className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left transition hover:bg-[#f8f7f1]"><span className="min-w-0"><span className="block truncate text-xs font-black text-[#123d2b]">{company.tradeName}</span><span className="mt-1 block truncate text-[9px] text-[#597064]">{company.email ?? company.slug} · {formatDate(company.createdAt)}</span></span><span className="shrink-0 text-right"><span className="block text-[9px] font-black text-[#b94713]">{codeLabel("systemAdmin.plans.codes", company.subscriptionPlan, t)}</span><span className="mt-1 block text-[8px] text-[#597064]">{codeLabel("systemAdmin.status", company.subscriptionStatus, t)}</span></span></button>)}{!items.length && <Empty text={t("systemAdmin.companies.empty")} />}</div>; }
function CompaniesPanel({ items, onEdit, onReload, notify }: { items: Company[]; onEdit: (item: Company) => void; onReload: () => void; notify: (message: string) => void }) {
  const t = useT();
  const [status, setStatus] = useState("ALL");
  const [subscription, setSubscription] = useState("ALL");
  const [plan, setPlan] = useState("ALL");
  const [sort, setSort] = useState("recent");
  const [openCompany, setOpenCompany] = useState<string | null>(null);
  const filtered = useMemo(() => items.filter((company) =>
    (status === "ALL" || (status === "REMOVED" ? Boolean(company.removedAt) : !company.removedAt && company.status === status))
    && (subscription === "ALL" || company.subscriptionStatus === subscription)
    && (plan === "ALL" || company.subscriptionPlan === plan),
  ).sort((a, b) => sort === "name" ? a.tradeName.localeCompare(b.tradeName) : sort === "sales" ? (b._count.sales ?? 0) - (a._count.sales ?? 0) : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [items, plan, sort, status, subscription]);
  return <div className="space-y-4">
    <CompanyInsightsCarousel items={items} />
    <section className="overflow-hidden rounded-[1.4rem] border border-[#123d2b]/12 bg-[#fffdf8] shadow-[0_12px_34px_rgba(18,61,43,.07)]">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#123d2b]/10 px-5 py-4 sm:px-6">
        <div><p className="text-[9px] font-black uppercase tracking-[.17em] text-[#b94713]">{t("systemAdmin.companies.listEyebrow")}</p><h2 className="mt-1 text-base font-black text-[#123d2b]">{t("systemAdmin.companies.panelTitle")}</h2><p className="mt-1 text-[10px] text-[#597064]">{t("systemAdmin.companies.filteredCount", { count: filtered.length, total: items.length })}</p></div>
        <div className="flex items-center gap-2 rounded-full bg-[#e9f3ec] px-3 py-1.5 text-[9px] font-bold text-[#315847]"><SlidersHorizontal className="size-3.5" />{t("systemAdmin.companies.filters")}</div>
      </div>
      <div className="grid gap-2 border-b border-[#123d2b]/10 bg-[#f8f7f1] p-4 sm:grid-cols-2 xl:grid-cols-4">
        <FilterSelect label={t("systemAdmin.companies.accessFilter")} value={status} onChange={setStatus}><option value="ALL">{t("systemAdmin.companies.allAccess")}</option><option value="ACTIVE">{t("systemAdmin.editors.companyActive")}</option><option value="SUSPENDED">{t("systemAdmin.editors.companySuspended")}</option><option value="REMOVED">{t("systemAdmin.companies.removed")}</option></FilterSelect>
        <FilterSelect label={t("systemAdmin.companies.subscriptionFilter")} value={subscription} onChange={setSubscription}><option value="ALL">{t("systemAdmin.companies.allSubscriptions")}</option>{["TRIAL", "PENDING", "ACTIVE", "PAST_DUE", "CANCELLED"].map((value) => <option key={value} value={value}>{codeLabel("systemAdmin.status", value, t)}</option>)}</FilterSelect>
        <FilterSelect label={t("systemAdmin.companies.planFilter")} value={plan} onChange={setPlan}><option value="ALL">{t("systemAdmin.companies.allPlans")}</option>{["FREE", "START", "BUSINESS", "PREMIUM", "ENTERPRISE"].map((value) => <option key={value} value={value}>{codeLabel("systemAdmin.plans.codes", value, t)}</option>)}</FilterSelect>
        <FilterSelect label={t("systemAdmin.companies.sortBy")} value={sort} onChange={setSort}><option value="recent">{t("systemAdmin.companies.sortRecent")}</option><option value="name">{t("systemAdmin.companies.sortName")}</option><option value="sales">{t("systemAdmin.companies.sortSales")}</option></FilterSelect>
      </div>
      <CompanyRows items={filtered} onEdit={onEdit} onReload={onReload} notify={notify} openCompany={openCompany} onToggle={(id) => setOpenCompany((current) => current === id ? null : id)} />
    </section>
  </div>;
}

function BillingPanel({ items, onEdit, onPayment }: { items: Company[]; onEdit: (company: Company) => void; onPayment: (company: Company) => Promise<void> }) {
  const t = useT();
  const { formatCurrency, formatDate } = useFormatters();
  const [filter, setFilter] = useState("attention");
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const billingDate = (company: Company) => company.billingDueAt ?? company.nextBillingAt;
  const needsAttention = (company: Company) => {
    const date = billingDate(company);
    return company.subscriptionStatus === "PAST_DUE" || (date != null && new Date(date).getTime() < today.getTime()) || (company.billingSuspendsAt != null && new Date(company.billingSuspendsAt).getTime() <= today.getTime());
  };
  const filtered = items.filter((company) => filter === "all" || (filter === "attention" ? needsAttention(company) : company.subscriptionStatus === filter));
  const attentionCount = items.filter(needsAttention).length;
  const paidCount = items.filter((company) => ["ACTIVE", "PENDING"].includes(company.subscriptionStatus) && company.subscriptionPlan !== "FREE").length;
  const dueSoon = items.filter((company) => { const date = billingDate(company); return date && new Date(date).getTime() >= today.getTime() && new Date(date).getTime() <= today.getTime() + 7 * 86400000; }).length;
  async function register(company: Company) {
    setBusyId(company.id); setError("");
    try { await onPayment(company); }
    catch (cause) { setError(cause instanceof Error ? cause.message : t("systemAdmin.errors.save")); }
    finally { setBusyId(""); }
  }
  return <div className="space-y-5">
    <section className="rounded-3xl border-2 border-[#123d2b] bg-[#fff8ea] p-5 shadow-[7px_8px_0_#ffb21a] sm:p-7">
      <p className="text-[9px] font-black uppercase tracking-[.16em] text-[#a93a05]">{t("systemAdmin.billing.eyebrow")}</p>
      <h2 className="mt-2 text-2xl font-black text-[#123d2b]">{t("systemAdmin.billing.title")}</h2>
      <p className="mt-2 max-w-2xl text-xs leading-5 text-[#597064]">{t("systemAdmin.billing.copy")}</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {[[t("systemAdmin.billing.attention"), attentionCount, AlertTriangle, "bg-amber-100 text-amber-900"], [t("systemAdmin.billing.dueSoon"), dueSoon, CalendarClock, "bg-white text-[#123d2b]"], [t("systemAdmin.billing.paidPlans"), paidCount, CreditCard, "bg-[#123d2b] text-white"]].map(([label, value, Icon, tone]) => { const SummaryIcon = Icon as typeof AlertTriangle; return <div key={String(label)} className={`rounded-2xl p-4 ${tone}`}><div className="flex items-center justify-between"><p className="text-[9px] font-black uppercase tracking-wide opacity-70">{label as string}</p><SummaryIcon className="size-4 opacity-70" /></div><p className="mt-3 text-2xl font-black">{value as number}</p></div>; })}
      </div>
    </section>
    <section className="overflow-hidden rounded-2xl border border-[#123d2b]/15 bg-[#fffdf8]">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#123d2b]/10 px-5 py-4"><div><h3 className="text-sm font-black text-[#123d2b]">{t("systemAdmin.billing.accountsTitle")}</h3><p className="mt-1 text-[10px] text-[#597064]">{t("systemAdmin.billing.accountsCopy", { count: filtered.length })}</p></div><FilterSelect label={t("systemAdmin.billing.filterLabel")} value={filter} onChange={setFilter}><option value="attention">{t("systemAdmin.billing.filterAttention")}</option><option value="all">{t("systemAdmin.billing.filterAll")}</option>{["TRIAL", "PENDING", "ACTIVE", "PAST_DUE", "CANCELLED"].map((status) => <option key={status} value={status}>{codeLabel("systemAdmin.status", status, t)}</option>)}</FilterSelect></div>
      {error && <p role="alert" className="mx-4 mt-4 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700">{error}</p>}
      <div className="divide-y divide-[#123d2b]/10">{filtered.map((company) => { const due = billingDate(company); const late = needsAttention(company); return <article key={company.id} className="grid gap-3 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_repeat(3,minmax(90px,.6fr))_auto] sm:items-center sm:px-5">
        <div className="min-w-0"><p className="truncate text-xs font-black text-[#123d2b]">{company.tradeName}</p><p className="mt-1 truncate text-[9px] text-[#597064]">{company.email ?? company.slug} · {codeLabel("systemAdmin.plans.codes", company.subscriptionPlan, t)}</p></div>
        <div><p className="text-[8px] font-bold uppercase tracking-wide text-[#789083]">{t("systemAdmin.billing.amount")}</p><p className="mt-1 text-[10px] font-black text-[#123d2b]">{formatCurrency(Number(company.subscriptionPrice ?? 0))}</p></div>
        <div><p className="text-[8px] font-bold uppercase tracking-wide text-[#789083]">{t("systemAdmin.editors.billingDueAt")}</p><p className={`mt-1 text-[10px] font-black ${late ? "text-red-700" : "text-[#123d2b]"}`}>{due ? formatDate(due) : t("systemAdmin.billing.noDate")}</p></div>
        <div><p className="text-[8px] font-bold uppercase tracking-wide text-[#789083]">{t("systemAdmin.editors.subscriptionStatus")}</p><p className="mt-1"><Badge value={company.subscriptionStatus} /></p></div>
        <div className="flex gap-2"><button type="button" onClick={() => onEdit(company)} className="h-9 rounded-lg border border-[#123d2b]/15 bg-white px-3 text-[9px] font-black text-[#315847] hover:border-[#ce4a0a]">{t("systemAdmin.companies.edit")}</button><button type="button" disabled={busyId === company.id} onClick={() => void register(company)} className="flex h-9 items-center gap-1.5 rounded-lg bg-[#123d2b] px-3 text-[9px] font-black text-white disabled:opacity-50">{busyId === company.id ? <LoaderCircle className="size-3 animate-spin" /> : <Check className="size-3" />}{t("systemAdmin.editors.registerPayment")}</button></div>
      </article>; })}{!filtered.length && <Empty text={t("systemAdmin.billing.empty")} />}</div>
    </section>
  </div>;
}

function PaymentsPanel({ items, status, onStatus }: { items: SystemPayment[]; status: string; onStatus: (status: string) => void }) {
  const t = useT();
  const { formatCurrency, formatDate } = useFormatters();
  const allStatuses = ["PENDING", "CONFIRMED", "RECEIVED", "OVERDUE", "REFUNDED", "CANCELLED"];
  return <section className="overflow-hidden rounded-2xl border border-[#123d2b]/15 bg-[#fffdf8]">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#123d2b]/10 px-5 py-4"><div><h2 className="text-sm font-black">{t("systemAdmin.payments.title")}</h2><p className="mt-1 text-[10px] text-[#597064]">{t("systemAdmin.payments.description", { count: items.length })}</p></div><label className="flex items-center gap-2 text-[10px] font-bold text-[#315847]"><span>{t("systemAdmin.payments.status")}</span><select value={status} onChange={(event) => onStatus(event.target.value)} className="h-9 rounded-lg border border-[#123d2b]/15 bg-white px-2"><option value="">{t("systemAdmin.payments.allStatuses")}</option>{allStatuses.map((value) => <option key={value} value={value}>{codeLabel("systemAdmin.status", value, t)}</option>)}</select></label></div>
    <div className="divide-y divide-[#123d2b]/10">{items.map((payment) => <article key={payment.id} className="grid gap-3 px-5 py-4 sm:grid-cols-[1.4fr_1fr_1fr_auto] sm:items-center"><div className="min-w-0"><p className="truncate text-xs font-black text-[#123d2b]">{payment.company.tradeName}</p><p className="mt-1 truncate text-[10px] text-[#597064]">{payment.company.email || payment.providerPaymentId}</p><p className="mt-1 text-[9px] text-[#597064]">{codeLabel("systemAdmin.plans.codes", payment.company.subscriptionPlan, t)} · {payment.billingType || "—"}</p></div><div><p className="text-sm font-black text-[#123d2b]">{formatCurrency(payment.amount)}</p>{payment.netAmount !== null && <p className="mt-1 text-[9px] text-[#597064]">{t("systemAdmin.payments.netAmount")}: {formatCurrency(payment.netAmount)}</p>}</div><div><Badge value={payment.status} /><p className="mt-1 text-[9px] text-[#597064]">{t("systemAdmin.payments.dueDate")}: {formatDate(payment.dueDate)}</p>{payment.paidAt && <p className="mt-1 text-[9px] text-[#597064]">{t("systemAdmin.payments.paidAt")}: {formatDate(payment.paidAt)}</p>}</div>{(payment.invoiceUrl || payment.bankSlipUrl) && <a href={payment.invoiceUrl || payment.bankSlipUrl || undefined} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-[#123d2b]/15 px-3 text-[10px] font-bold text-[#315847] hover:text-[#ce4a0a]">{t("systemAdmin.payments.openInvoice")}<ExternalLink className="size-3" /></a>}</article>)}{!items.length && <Empty text={t("systemAdmin.payments.empty")} />}</div>
  </section>;
}

function CompanyInsightsCarousel({ items }: { items: Company[] }) {
  const t = useT();
  const [slide, setSlide] = useState(0);
  const count = (key: keyof CompanyCounts) => items.reduce((sum, company) => sum + (company._count?.[key] ?? 0), 0);
  const active = items.filter((company) => company.status === "ACTIVE").length;
  const overdue = items.filter((company) => company.subscriptionStatus === "PAST_DUE").length;
  const trial = items.filter((company) => company.subscriptionStatus === "TRIAL").length;
  const pages = [
    { eyebrow: t("systemAdmin.companies.slidePortfolio"), title: t("systemAdmin.companies.slidePortfolioTitle"), stats: [[t("systemAdmin.companies.totalCompanies"), items.length], [t("systemAdmin.companies.activeCompaniesLabel"), active], [t("systemAdmin.companies.suspendedCompanies"), items.length - active]] as [string, number][] },
    { eyebrow: t("systemAdmin.companies.slideBilling"), title: t("systemAdmin.companies.slideBillingTitle"), stats: [[t("systemAdmin.companies.trials"), trial], [t("systemAdmin.companies.pastDue"), overdue], [t("systemAdmin.companies.paidPlans"), items.filter((company) => ["ACTIVE", "PENDING"].includes(company.subscriptionStatus) && company.subscriptionPlan !== "FREE").length]] as [string, number][] },
    { eyebrow: t("systemAdmin.companies.slideUsage"), title: t("systemAdmin.companies.slideUsageTitle"), stats: [[t("systemAdmin.companies.products"), count("sellableProducts")], [t("systemAdmin.companies.customers"), count("customers")], [t("systemAdmin.companies.sales"), count("sales")]] as [string, number][] },
  ];
  const activePage = pages[slide];
  return <section aria-roledescription="carousel" aria-label={t("systemAdmin.companies.insightsLabel")} className="overflow-hidden rounded-[1.4rem] border border-[#123d2b] bg-[#123d2b] text-white shadow-[0_14px_34px_rgba(18,61,43,.18)]">
    <div className="grid gap-5 p-5 sm:grid-cols-[minmax(180px,.7fr)_1.3fr_auto] sm:items-center sm:p-6">
      <div><p className="text-[9px] font-black uppercase tracking-[.18em] text-[#ffb21a]">{activePage.eyebrow}</p><h2 className="mt-2 max-w-xs text-xl font-black leading-tight sm:text-2xl">{activePage.title}</h2></div>
      <div className="grid grid-cols-3 gap-2">{activePage.stats.map(([label, value]) => <div key={label} className="min-h-[76px] rounded-xl border border-white/10 bg-white/[.07] p-3"><p className="text-[8px] font-bold uppercase tracking-wide text-white/55">{label}</p><p className="mt-2 text-2xl font-black tabular-nums text-[#ffcf5a]">{value.toLocaleString()}</p></div>)}</div>
      <div className="flex items-center justify-between gap-3 sm:flex-col sm:justify-center"><div className="flex items-center gap-2"><button type="button" aria-label={t("systemAdmin.companies.previousSlide")} onClick={() => setSlide((slide + pages.length - 1) % pages.length)} className="grid size-9 place-items-center rounded-full border border-white/20 text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ffb21a]"><ChevronLeft className="size-4" /></button><button type="button" aria-label={t("systemAdmin.companies.nextSlide")} onClick={() => setSlide((slide + 1) % pages.length)} className="grid size-9 place-items-center rounded-full border border-white/20 text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ffb21a]"><ChevronRight className="size-4" /></button></div><div className="flex items-center gap-1.5" role="tablist" aria-label={t("systemAdmin.companies.insightsLabel")}>{pages.map((page, index) => <button key={page.eyebrow} type="button" role="tab" aria-selected={slide === index} aria-label={page.eyebrow} onClick={() => setSlide(index)} className={`h-1.5 rounded-full transition-all ${slide === index ? "w-7 bg-[#ffb21a]" : "w-1.5 bg-white/35 hover:bg-white/70"}`} />)}</div></div>
    </div>
  </section>;
}

function FilterSelect({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: React.ReactNode }) { return <label className="relative block"><span className="mb-1 block text-[8px] font-black uppercase tracking-[.12em] text-[#597064]">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full appearance-none rounded-xl border border-[#123d2b]/12 bg-white px-3 pr-9 text-[10px] font-bold text-[#123d2b] outline-none transition focus:border-[#ce4a0a] focus:ring-2 focus:ring-[#ce4a0a]/15">{children}</select><ChevronDown aria-hidden="true" className="pointer-events-none absolute bottom-3 right-3 size-3.5 text-[#597064]" /></label>; }

function CompanyRows({ items, onEdit, onReload, notify, openCompany, onToggle }: { items: Company[]; onEdit: (item: Company) => void; onReload: () => void; notify: (message: string) => void; openCompany: string | null; onToggle: (id: string) => void }) {
  const { formatDate, formatCurrency } = useFormatters(); const t = useT();
  return <div className="divide-y divide-[#123d2b]/10">{items.map((company) => {
    const expanded = openCompany === company.id;
    const counts = company._groupCount ?? company._count;
    const unitCounts = company._count;
    const quickStats: [string, number][] = [[t("systemAdmin.companies.activeUsers"), counts.activeMemberships ?? counts.memberships ?? 0], [t("systemAdmin.companies.products"), counts.sellableProducts ?? 0], [t("systemAdmin.companies.services"), counts.services ?? 0], [t("systemAdmin.companies.customers"), counts.customers ?? 0], [t("systemAdmin.companies.sales"), counts.sales ?? 0], [t("systemAdmin.companies.orders"), counts.orders ?? 0], [t("systemAdmin.companies.purchases"), counts.purchases ?? 0]];
    const detailStats: [string, number][] = [...quickStats, [t("systemAdmin.companies.activeMembershipLinks"), counts.activeMembershipLinks ?? 0], [t("systemAdmin.companies.categories"), counts.categories ?? 0], [t("systemAdmin.companies.suppliers"), counts.suppliers ?? 0], [t("systemAdmin.companies.financialEntries"), counts.financialEntries ?? 0], [t("systemAdmin.companies.stockMovements"), counts.stockMovements ?? 0]];
    return <article key={company.id} className={`transition-colors ${expanded ? "bg-[#fffaf0]" : "bg-[#fffdf8] hover:bg-[#f8f7f1]"}`}>
      <div className="grid gap-3 px-4 py-4 sm:px-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
        <button type="button" aria-expanded={expanded} onClick={() => onToggle(company.id)} className="group flex min-w-0 items-center gap-3 rounded-xl text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ce4a0a]">
          <span className={`grid size-9 shrink-0 place-items-center rounded-xl border text-[#315847] transition ${expanded ? "rotate-180 border-[#ce4a0a]/25 bg-[#ffe9d6] text-[#b94713]" : "border-[#123d2b]/10 bg-white"}`}><ChevronDown className="size-4" /></span>
          <span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-2"><span className="truncate text-sm font-black text-[#123d2b]">{company.tradeName}</span><Badge value={company.removedAt ? "REMOVED" : company.status} /></span><span className="mt-1 block truncate text-[10px] text-[#597064]">{company.email ?? company.slug}<span className="mx-1.5 text-[#b5b6aa]">·</span>{t("systemAdmin.companies.since", { date: formatDate(company.createdAt) })}</span></span>
        </button>
        <div className="flex items-center justify-between gap-4 pl-12 sm:justify-end sm:pl-0"><div className="min-w-20 text-right"><p className="text-xs font-black text-[#b94713]">{codeLabel("systemAdmin.plans.codes", company.subscriptionPlan, t)}</p><p className="mt-1 text-[9px] text-[#597064]">{codeLabel("systemAdmin.status", company.subscriptionStatus, t)}</p></div>{!company.removedAt && <button type="button" onClick={() => onEdit(company)} className="flex h-9 items-center justify-center gap-2 rounded-xl border border-[#123d2b]/15 bg-white px-3 text-[10px] font-black text-[#315847] transition hover:border-[#ce4a0a] hover:text-[#a93a05]"><Pencil className="size-3.5" />{t("systemAdmin.companies.edit")}</button>}</div>
      </div>
      {!expanded && <><p className="px-4 pb-1 pl-16 text-[8px] font-bold uppercase tracking-wide text-[#789083] sm:px-5 sm:pl-[4.25rem]">{company.businessGroupId ? t("systemAdmin.companies.groupTotals", { count: company._groupUnitCount ?? 1 }) : t("systemAdmin.companies.unitTotals")}</p><div className="grid grid-cols-3 gap-2 px-4 pb-4 pl-16 sm:grid-cols-6 sm:px-5 sm:pl-[4.25rem] xl:grid-cols-7">{quickStats.map(([label, value]) => <div key={label} className="rounded-lg bg-[#f5f4ed] px-2.5 py-2"><p className="truncate text-[8px] font-bold uppercase tracking-wide text-[#789083]">{label}</p><p className="mt-1 text-xs font-black tabular-nums text-[#123d2b]">{Number(value ?? 0).toLocaleString()}</p></div>)}</div></>}
      {expanded && <div className="border-t border-[#123d2b]/10 px-4 py-4 sm:px-5 sm:py-5"><div className="grid gap-4 xl:grid-cols-[1fr_1.4fr]"><div className="rounded-xl border border-[#123d2b]/10 bg-white p-4"><p className="text-[8px] font-black uppercase tracking-[.15em] text-[#b94713]">{t("systemAdmin.companies.companyRecord")}</p><dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3"><RecordField label={t("systemAdmin.companies.identifier")} value={company.slug} /><RecordField label={t("systemAdmin.companies.document")} value={company.document || "—"} /><RecordField label={t("systemAdmin.companies.registeredAt")} value={formatDate(company.createdAt)} /><RecordField label={t("systemAdmin.companies.monthlyPrice")} value={formatCurrency(Number(company.subscriptionPrice ?? 0))} /></dl></div><div><p className="mb-2 text-[8px] font-black uppercase tracking-[.15em] text-[#b94713]">{t("systemAdmin.companies.activityCounts")} · {company.businessGroupId ? t("systemAdmin.companies.groupTotals", { count: company._groupUnitCount ?? 1 }) : t("systemAdmin.companies.unitTotals")}</p><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{detailStats.map(([label, value]) => <CountChip key={label} label={label} value={value} />)}</div></div></div>{company.businessGroupId && <div className="mt-4 rounded-xl border border-[#123d2b]/10 bg-white p-4"><p className="mb-2 text-[8px] font-black uppercase tracking-[.15em] text-[#597064]">{t("systemAdmin.companies.unitTotals")}</p><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{[[t("systemAdmin.companies.activeUsers"), unitCounts.activeMemberships], [t("systemAdmin.companies.products"), unitCounts.sellableProducts], [t("systemAdmin.companies.services"), unitCounts.services], [t("systemAdmin.companies.customers"), unitCounts.customers], [t("systemAdmin.companies.sales"), unitCounts.sales], [t("systemAdmin.companies.orders"), unitCounts.orders], [t("systemAdmin.companies.purchases"), unitCounts.purchases], [t("systemAdmin.companies.stockMovements"), unitCounts.stockMovements]].map(([label, value]) => <CountChip key={label} label={String(label)} value={Number(value ?? 0)} />)}</div></div>}<CompanyAccessActions company={company} onReload={onReload} notify={notify} /></div>}
    </article>;
  })}{!items.length && <Empty text={t("systemAdmin.companies.emptyFiltered")} />}</div>;
}
function RecordField({ label, value }: { label: string; value: string }) { return <div className="min-w-0"><dt className="text-[8px] font-bold uppercase tracking-wide text-[#789083]">{label}</dt><dd className="mt-1 truncate text-[10px] font-bold text-[#123d2b]">{value}</dd></div>; }
function CompanyAccessActions({ company, onReload, notify }: { company: Company; onReload: () => void; notify: (message: string) => void }) {
  const t = useT();
  const [confirmingRemoval, setConfirmingRemoval] = useState(false);
  const [confirmationName, setConfirmationName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function setAccess(status: "ACTIVE" | "SUSPENDED") {
    setBusy(true); setError("");
    try {
      await apiRequest(`/system-admin/companies/${company.id}`, { method: "PATCH", body: JSON.stringify({ status }) });
      notify(t(status === "ACTIVE" ? "systemAdmin.messages.companyReopened" : "systemAdmin.messages.companyClosed"));
      onReload();
    } catch (cause) { setError(cause instanceof Error ? cause.message : t("systemAdmin.errors.save")); }
    finally { setBusy(false); }
  }
  async function remove() {
    if (confirmationName.trim().toLocaleLowerCase() !== company.tradeName.trim().toLocaleLowerCase()) return;
    setBusy(true); setError("");
    try {
      await apiRequest(`/system-admin/companies/${company.id}/remove`, { method: "POST", body: JSON.stringify({ confirmationName }) });
      setConfirmingRemoval(false); setConfirmationName("");
      notify(t("systemAdmin.messages.companyRemoved"));
      onReload();
    } catch (cause) { setError(cause instanceof Error ? cause.message : t("systemAdmin.errors.save")); }
    finally { setBusy(false); }
  }
  if (company.removedAt) return <p className="mt-4 rounded-xl border border-slate-200 bg-slate-100 p-3 text-[10px] font-semibold text-slate-600">{t("systemAdmin.companies.removedNotice")}</p>;
  return <div className="mt-4 border-t border-[#123d2b]/10 pt-4">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[9px] font-black uppercase tracking-[.12em] text-[#315847]">{t("systemAdmin.companies.accessControls")}</p><p className="mt-1 text-[9px] text-[#597064]">{t("systemAdmin.companies.accessControlsHint")}</p></div><div className="flex flex-wrap gap-2"><button type="button" disabled={busy} onClick={() => void setAccess(company.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED")} className="h-9 rounded-lg border border-[#123d2b]/15 bg-white px-3 text-[10px] font-black text-[#315847] transition hover:border-[#147a45] hover:text-[#147a45] disabled:opacity-50">{company.status === "SUSPENDED" ? t("systemAdmin.companies.reopenStore") : t("systemAdmin.companies.closeStore")}</button><button type="button" disabled={busy} onClick={() => { setConfirmingRemoval((value) => !value); setError(""); }} className="h-9 rounded-lg border border-red-200 bg-red-50 px-3 text-[10px] font-black text-red-700 transition hover:bg-red-100 disabled:opacity-50">{t("systemAdmin.companies.removeStore")}</button></div></div>
    {confirmingRemoval && <div role="alertdialog" aria-labelledby={`remove-company-${company.id}`} className="mt-3 rounded-xl border border-red-200 bg-red-50 p-4"><h3 id={`remove-company-${company.id}`} className="text-xs font-black text-red-900">{t("systemAdmin.companies.removeConfirmTitle", { name: company.tradeName })}</h3><p className="mt-1 text-[10px] leading-4 text-red-800">{t("systemAdmin.companies.removeConfirmBody")}</p><label className="mt-3 block text-[9px] font-bold text-red-900">{t("systemAdmin.companies.typeCompanyName")}<input value={confirmationName} onChange={(event) => setConfirmationName(event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-red-200 bg-white px-3 text-xs text-slate-900 outline-none focus:border-red-500" /></label>{error && <p role="alert" className="mt-2 text-[10px] font-bold text-red-700">{error}</p>}<div className="mt-3 flex justify-end gap-2"><button type="button" disabled={busy} onClick={() => { setConfirmingRemoval(false); setConfirmationName(""); setError(""); }} className="h-9 rounded-lg border border-red-200 bg-white px-3 text-[10px] font-bold text-red-900">{t("systemAdmin.editors.cancel")}</button><button type="button" disabled={busy || confirmationName.trim().toLocaleLowerCase() !== company.tradeName.trim().toLocaleLowerCase()} onClick={() => void remove()} className="flex h-9 items-center gap-2 rounded-lg bg-red-700 px-3 text-[10px] font-black text-white disabled:cursor-not-allowed disabled:opacity-40">{busy && <LoaderCircle className="size-3.5 animate-spin" />}{t("systemAdmin.companies.confirmRemove")}</button></div></div>}
    {error && !confirmingRemoval && <p role="alert" className="mt-2 text-[10px] font-bold text-red-700">{error}</p>}
  </div>;
}
function CountChip({ label, value }: { label: string; value?: number | null }) { const count = typeof value === "number" && Number.isFinite(value) ? value : 0; return <div className="rounded-lg border border-[#123d2b]/10 bg-white px-2.5 py-2"><p className="text-[8px] font-bold uppercase tracking-wide text-[#789083]">{label}</p><p className="mt-1 text-xs font-black text-[#123d2b]">{count.toLocaleString()}</p></div>; }
function UsersPanel({ items, onEdit, onSupport }: { items: User[]; onEdit: (item: User) => void; onSupport: (item: User) => void }) {
  const { formatDate } = useFormatters(); const t = useT(); return <section className="overflow-hidden rounded-2xl border border-[#123d2b]/15 bg-[#fffdf8] shadow-sm"><PanelTitle title={t("systemAdmin.users.panelTitle")} description={t("systemAdmin.users.panelDescription", { count: items.length })} /><div className="divide-y divide-[#123d2b]/10">{items.map((user) => <div key={user.id} className="grid gap-3 px-5 py-4 hover:bg-[#ffb21a]/5 md:grid-cols-[minmax(0,1.5fr)_1fr_1fr_auto] md:items-center"><div><div className="flex items-center gap-2"><p className="truncate text-xs font-black">{user.name}</p>{user.isSystemAdmin && <ShieldCheck className="size-3.5 text-[#147a45]" />}</div><p className="mt-1 truncate text-[9px] text-[#597064]">{user.email}</p></div><div><Badge value={user.status} /><p className="mt-1 text-[9px] text-[#597064]">{t("systemAdmin.users.companiesCount", { count: user._count.memberships })}</p></div><div><p className="text-[10px] font-bold">{t("systemAdmin.users.sessionsCount", { count: user._count.sessions })}</p><p className="mt-1 text-[9px] text-[#597064]">{t("systemAdmin.companies.since", { date: formatDate(user.createdAt) })}</p></div><div className="flex gap-2"><button onClick={() => onSupport(user)} className="flex h-8 items-center justify-center gap-1 rounded-lg border border-[#147a45]/25 bg-[#dff4e7] px-3 text-[10px] font-black text-[#147a45] hover:bg-[#c9ecd6]"><LifeBuoy className="size-3" />{t("systemAdmin.users.support")}</button><button onClick={() => onEdit(user)} className="flex h-8 items-center justify-center gap-1 rounded-lg border border-[#123d2b]/15 bg-white px-3 text-[10px] font-bold hover:border-[#ce4a0a] hover:text-[#a93a05]"><Pencil className="size-3" />{t("systemAdmin.companies.edit")}</button></div></div>)}{!items.length && <Empty text={t("systemAdmin.users.empty")} />}</div></section>; }
function PlansPanel({ plans, onCompanies, onPrices }: { plans: Plan[]; onCompanies: (tab: Tab) => void; onPrices: (tab: Tab) => void }) {
  const { formatCurrency } = useFormatters(); const t = useT(); return <div><div className="mb-5"><p className="text-[9px] font-black uppercase tracking-[.16em] text-[#a93a05]">{t("systemAdmin.plans.eyebrow")}</p><h2 className="mt-1 text-2xl font-black">{t("systemAdmin.plans.title")}</h2><p className="mt-1 text-xs text-[#597064]">{t("systemAdmin.plans.copy")}</p></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{plans.map((plan, index) => <article key={plan.id} className={`rounded-2xl border-2 p-5 ${index === 2 ? "border-[#ce4a0a] bg-[#fff8ea] shadow-[5px_5px_0_#ffb21a]" : "border-[#123d2b]/15 bg-[#fffdf8]"}`}><div className="flex items-start justify-between"><div><p className="text-[9px] font-black uppercase tracking-[.14em] text-[#597064]">{plan.id}</p><h3 className="mt-1 text-xl font-black">{plan.name}</h3></div><span className="rounded-full bg-[#d4ecdc] px-2.5 py-1 text-[9px] font-black text-[#147a45]">{t("systemAdmin.plans.companiesCount", { count: plan.companies })}</span></div><p className="mt-6 text-2xl font-black text-[#ce4a0a]">{plan.price === null ? t("systemAdmin.plans.underConsultation") : plan.price === 0 ? t("systemAdmin.plans.free") : t("systemAdmin.plans.perMonth", { price: formatCurrency(plan.price) })}</p><div className="mt-5 grid grid-cols-3 gap-2 border-t border-[#123d2b]/10 pt-4 text-[10px]"><span className="text-[#597064]">{t("systemAdmin.plans.owners")}<strong className="mt-1 block text-xs text-[#123d2b]">{plan.ownerLimit ?? t("systemAdmin.plans.byArrangement")}</strong></span><span className="text-[#597064]">{t("systemAdmin.plans.employees")}<strong className="mt-1 block text-xs text-[#123d2b]">{plan.employeeLimit ?? t("systemAdmin.plans.byArrangement")}</strong></span><span className="text-[#597064]">{t("systemAdmin.plans.units")}<strong className="mt-1 block text-xs text-[#123d2b]">{plan.unitLimit ?? t("systemAdmin.plans.byArrangement")}</strong></span></div><div className="mt-4 flex gap-2 border-t border-[#123d2b]/10 pt-3"><QuickLink onClick={() => onCompanies("companies")}>{t("systemAdmin.plans.viewCompanies")}</QuickLink><QuickLink onClick={() => onPrices("prices")}>{t("systemAdmin.plans.managePrices")}</QuickLink></div></article>)}</div><p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-[10px] leading-4 text-amber-800">{t("systemAdmin.plans.warning")}</p></div>; }

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
function CompanyEditor({ company, onClose, onSaved }: { company: Company; onClose: () => void; onSaved: (company: Partial<Company> & { id: string }) => void }) { const t = useT(); const [form, setForm] = useState({ subscriptionPrice: String(company.subscriptionPrice ?? 0), billingDueAt: company.billingDueAt?.slice(0, 10) ?? company.nextBillingAt?.slice(0, 10) ?? "", billingNoticeAt: company.billingNoticeAt?.slice(0, 10) ?? "", billingSuspendsAt: company.billingSuspendsAt?.slice(0, 10) ?? "" }); return <Editor title={company.tradeName} description={t("systemAdmin.editors.billingDescription")} onClose={onClose} onSave={async () => { const updated = await apiRequest<Partial<Company> & { id: string }>(`/system-admin/companies/${company.id}`, { method: "PATCH", body: JSON.stringify({ subscriptionPrice: Number(form.subscriptionPrice.replace(",", ".")), billingDueAt: form.billingDueAt ? `${form.billingDueAt}T00:00:00.000-03:00` : undefined, billingNoticeAt: form.billingNoticeAt ? `${form.billingNoticeAt}T08:00:00.000-03:00` : undefined, billingSuspendsAt: form.billingSuspendsAt ? `${form.billingSuspendsAt}T00:00:00.000-03:00` : undefined }) }); onSaved(updated); }}><div className="sm:col-span-2 rounded-xl border border-[#123d2b]/10 bg-[#f8f3ea] p-3"><p className="text-[9px] font-black uppercase tracking-wide text-[#a93a05]">{t("systemAdmin.billing.currentPlan")}</p><p className="mt-1 text-xs font-black text-[#123d2b]">{codeLabel("systemAdmin.plans.codes", company.subscriptionPlan, t)} · {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(company.subscriptionPrice ?? 0))}</p><p className="mt-1 text-[9px] text-[#597064]">{codeLabel("systemAdmin.status", company.subscriptionStatus, t)}</p></div><div className="sm:col-span-2"><Field label={t("systemAdmin.editors.subscriptionPrice")}><input type="number" min="0" max="999999" step="0.01" required value={form.subscriptionPrice} onChange={(e) => setForm({ ...form, subscriptionPrice: e.target.value })} /></Field></div><div className="sm:col-span-2 rounded-2xl border border-[#123d2b]/15 bg-[#f8f3ea] p-4"><p className="text-[10px] font-black uppercase tracking-[.14em] text-[#a93a05]">{t("systemAdmin.editors.billingTitle")}</p><p className="mt-1 text-[10px] leading-4 text-[#597064]">{t("systemAdmin.editors.billingHint")}</p><div className="mt-3 grid gap-4 sm:grid-cols-3"><Field label={t("systemAdmin.editors.billingDueAt")}><input type="date" value={form.billingDueAt} onChange={(e) => { const due = e.target.value; setForm((current) => ({ ...current, billingDueAt: due, billingNoticeAt: due && !current.billingNoticeAt ? shiftDate(due, -3) : current.billingNoticeAt, billingSuspendsAt: due && !current.billingSuspendsAt ? shiftDate(due, 10) : current.billingSuspendsAt })); }} /></Field><Field label={t("systemAdmin.editors.billingNoticeAt")}><input type="date" value={form.billingNoticeAt} onChange={(e) => setForm({ ...form, billingNoticeAt: e.target.value })} /></Field><Field label={t("systemAdmin.editors.billingSuspendsAt")}><input type="date" value={form.billingSuspendsAt} onChange={(e) => setForm({ ...form, billingSuspendsAt: e.target.value })} /></Field></div><p className="mt-3 rounded-xl bg-white px-3 py-2 text-[10px] font-bold text-[#315847]">{billingScheduleLabel(form, t)}</p></div></Editor>; }
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

  async function toggleUserAccess() {
    if (!detail) return;
    setBusy(true); setError("");
    const nextStatus = detail.status === "ACTIVE" ? "BLOCKED" : "ACTIVE";
    try {
      const updated = await apiRequest<UserDetail>(`/system-admin/users/${user.id}`, { method: "PATCH", body: JSON.stringify({ status: nextStatus }) });
      setDetail(updated);
      onChanged(updated);
      notify(t(nextStatus === "BLOCKED" ? "systemAdmin.messages.userBlocked" : "systemAdmin.messages.userAccessRestored"));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t("systemAdmin.errors.supportAction"));
    } finally { setBusy(false); }
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
                  <div key={membership.id} className="rounded-xl border border-[#123d2b]/10 bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0"><p className="truncate text-xs font-black">{membership.company.tradeName}</p><p className="mt-0.5 font-mono text-[9px] text-[#597064]">{membership.company.slug} · {codeLabel("employees.roles", membership.role, t)}</p></div>
                      <div className="shrink-0 text-right"><p className="text-[10px] font-black text-[#a93a05]">{codeLabel("systemAdmin.plans.codes", membership.company.subscriptionPlan, t)}</p><p className="mt-0.5 text-[9px] text-[#597064]">{membership.active ? t("systemAdmin.support.activeLink") : t("systemAdmin.support.inactiveLink")} · {codeLabel("systemAdmin.status", membership.company.status, t)}</p></div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4"><CountChip label={t("systemAdmin.companies.activeUsers")} value={membership.company._count.memberships} /><CountChip label={t("systemAdmin.companies.products")} value={membership.company._count.products} /><CountChip label={t("systemAdmin.companies.services")} value={0} /><CountChip label={t("systemAdmin.companies.customers")} value={membership.company._count.customers} /><CountChip label={t("systemAdmin.companies.sales")} value={membership.company._count.sales} /><CountChip label={t("systemAdmin.companies.orders")} value={membership.company._count.orders} /><CountChip label={t("systemAdmin.companies.purchases")} value={membership.company._count.purchases} /><CountChip label={t("systemAdmin.companies.stockMovements")} value={membership.company._count.stockMovements} /><CountChip label={t("systemAdmin.companies.categories")} value={membership.company._count.categories} /><CountChip label={t("systemAdmin.companies.suppliers")} value={membership.company._count.suppliers} /><CountChip label={t("systemAdmin.companies.financialEntries")} value={membership.company._count.financialEntries} /></div>
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

            <div className="mt-6 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              <ActionButton disabled={busy} onClick={() => void toggleUserAccess()} tone={detail.status === "ACTIVE" ? "bg-red-700" : "bg-[#147a45]"}>{detail.status === "ACTIVE" ? <LockKeyhole className="size-4" /> : <Unlock className="size-4" />}{t(detail.status === "ACTIVE" ? "systemAdmin.support.blockUser" : "systemAdmin.support.restoreUserAccess")}</ActionButton>
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
function CouponsPanel({ items, onCreated, onUpdated }: { items: Coupon[]; onCreated: (coupon: Coupon) => void; onUpdated: (coupon: Coupon) => void }) {
  const { formatCurrency } = useFormatters();
  const t = useT();
  const [form, setForm] = useState({ code: "", type: "PERCENT", value: "", planScope: "", maxUses: "1", validUntil: "" }); const [saving, setSaving] = useState(false); const [error, setError] = useState("");
  const [busyCoupon, setBusyCoupon] = useState<string | null>(null);
  async function create(event: React.FormEvent) { event.preventDefault(); setSaving(true); setError(""); try { const coupon = await apiRequest<Coupon>("/system-admin/coupons", { method: "POST", body: JSON.stringify({ code: form.code, type: form.type, value: Number(form.value), planScope: form.planScope || undefined, maxUses: Number(form.maxUses), validUntil: form.validUntil ? `${form.validUntil}T23:59:59-03:00` : undefined }) }); onCreated(coupon); setForm({ code: "", type: "PERCENT", value: "", planScope: "", maxUses: "1", validUntil: "" }); } catch (cause) { setError(cause instanceof Error ? cause.message : t("systemAdmin.errors.couponCreate")); } finally { setSaving(false); } }
  async function toggle(coupon: Coupon) { setBusyCoupon(coupon.id); try { const updated = await apiRequest<Coupon>(`/system-admin/coupons/${coupon.id}`, { method: "PATCH", body: JSON.stringify({ code: coupon.code, type: coupon.type, value: coupon.value, planScope: coupon.planScope, maxUses: coupon.maxUses, active: coupon.status === "INACTIVE" }) }); onUpdated(updated); } catch (cause) { setError(cause instanceof Error ? cause.message : t("systemAdmin.errors.save")); } finally { setBusyCoupon(null); } }
  return <div className="space-y-5"><form onSubmit={create} className="rounded-2xl border-2 border-[#123d2b] bg-[#fffdf8] p-5 shadow-[5px_5px_0_#ffb21a]"><h2 className="text-xl font-black">{t("systemAdmin.coupons.title")}</h2><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><Field label={t("systemAdmin.coupons.code")}><input required pattern="[A-Za-z0-9_-]{3,32}" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="BEMVINDO20" /></Field><Field label={t("systemAdmin.coupons.type")}><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option value="PERCENT">{t("systemAdmin.coupons.typePercent")}</option><option value="FIXED">{t("systemAdmin.coupons.typeFixed")}</option></select></Field><Field label={t("systemAdmin.coupons.discount")}><input required type="number" min="0.01" max={form.type === "PERCENT" ? 100 : undefined} step="0.01" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} /></Field><Field label={t("systemAdmin.coupons.plan")}><select value={form.planScope} onChange={(e) => setForm({ ...form, planScope: e.target.value })}><option value="">{t("systemAdmin.coupons.planAll")}</option>{["START", "BUSINESS", "PREMIUM"].map((plan) => <option key={plan} value={plan}>{codeLabel("systemAdmin.plans.codes", plan, t)}</option>)}</select></Field><Field label={t("systemAdmin.coupons.maxUses")}><input required type="number" min="1" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} /></Field><Field label={t("systemAdmin.coupons.validity")}><input type="date" value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} /></Field></div>{error && <p className="mt-3 text-xs font-bold text-red-600">{error}</p>}<button disabled={saving} className="mt-4 h-10 rounded-xl bg-[#ce4a0a] px-5 text-xs font-black text-white">{saving ? t("systemAdmin.coupons.creating") : t("systemAdmin.coupons.create")}</button></form><section className="overflow-hidden rounded-2xl border border-[#123d2b]/15 bg-[#fffdf8]"><PanelTitle title={t("systemAdmin.coupons.listTitle")} description={t("systemAdmin.coupons.listDescription")} /><div className="divide-y divide-[#123d2b]/10">{items.map((coupon) => <div key={coupon.id} className="grid gap-2 px-5 py-4 sm:grid-cols-[1fr_auto_auto_auto]"><div><strong className="text-xs">{coupon.code}</strong><p className="mt-1 text-[9px] text-[#597064]">{coupon.planScope ? codeLabel("systemAdmin.plans.codes", coupon.planScope, t) : t("systemAdmin.coupons.planAll")} · {t("systemAdmin.coupons.uses", { used: coupon.usedCount, max: coupon.maxUses })}</p></div><span className="text-xs">{coupon.type === "PERCENT" ? `${coupon.value}%` : formatCurrency(coupon.value)}</span><Badge value={coupon.status} /><button type="button" disabled={busyCoupon === coupon.id || (coupon.status !== "ACTIVE" && coupon.status !== "INACTIVE")} onClick={() => void toggle(coupon)} className="h-8 rounded-lg border border-[#123d2b]/15 px-3 text-[10px] font-bold disabled:opacity-40">{busyCoupon === coupon.id ? t("systemAdmin.prices.saving") : coupon.status === "INACTIVE" ? t("systemAdmin.coupons.activate") : t("systemAdmin.coupons.deactivate")}</button></div>)}{!items.length && <Empty text={t("systemAdmin.coupons.empty")} />}</div></section></div>;
}

function InfoCard({ label, children }: { label: string; children: React.ReactNode }) { return <div className="rounded-xl border border-[#123d2b]/10 bg-white p-3"><p className="text-[9px] text-[#597064]">{label}</p><div className="mt-1.5">{children}</div></div>; }
function ActionButton({ children, disabled, onClick, tone }: { children: React.ReactNode; disabled?: boolean; onClick: () => void; tone: string }) { return <button type="button" disabled={disabled} onClick={onClick} className={`flex h-11 items-center justify-center gap-2 rounded-xl px-3 text-[10px] font-black text-white transition disabled:cursor-not-allowed disabled:opacity-40 ${tone}`}>{children}</button>; }
