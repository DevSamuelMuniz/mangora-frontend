"use client";

import { useFormatters } from "@/i18n/provider";
import type { Locale } from "@/i18n/config";
import { useMemo, useState, type ReactNode } from "react";
import { useI18n, useT } from "@/i18n/provider";
import { useQuery } from "@tanstack/react-query";
import { Activity, AlertTriangle, LoaderCircle, RefreshCw, Search, ShieldCheck } from "lucide-react";
import { apiRequest } from "@/lib/api/client";

type LogEntry = { id: string; action: string; userName: string; entityType: string; entityId: string | null; ipAddress: string | null; metadata: Record<string, unknown> | null; createdAt: string };

const ACTIONS = [
  "DATA_CHANGED", "LOGIN_SUCCESS", "LOGIN_FAILURE", "PASSWORD_CHANGED", "PASSWORD_RESET_REQUESTED", "PASSWORD_RESET_COMPLETED", "SESSION_REVOKED",
  "COMPANY_UPDATED", "EMPLOYEE_CREATED", "EMPLOYEE_ROLE_CHANGED", "EMPLOYEE_STATUS_CHANGED", "SUBSCRIPTION_REQUESTED", "SUBSCRIPTION_CHECKOUT_CREATED",
  "SUBSCRIPTION_ACTIVATED", "SUBSCRIPTION_CANCELLED", "SUBSCRIPTION_PAYMENT_UPDATED", "CASH_REGISTER_OPENED", "CASH_REGISTER_CLOSED",
  "CASH_MOVEMENT_RECORDED", "SUPPLIER_CREATED", "SUPPLIER_UPDATED", "PURCHASE_CREATED", "PURCHASE_RECEIVED", "PURCHASE_CANCELLED",
  "CATEGORY_CREATED", "CATEGORY_UPDATED", "SERVICE_CREATED", "SERVICE_UPDATED", "FINANCIAL_PAYMENT_RECORDED", "BUSINESS_GROUP_CREATED",
  "UNIT_CREATED", "STOCK_TRANSFERRED", "FISCAL_SETTINGS_UPDATED", "FISCAL_DOCUMENT_PREPARED", "FISCAL_PROVIDER_CONNECTED",
  "FISCAL_DOCUMENT_SUBMITTED", "FISCAL_DOCUMENT_CANCELLED",
];

function translateLabel(action: string, t: (key: string) => string) {
  return ACTIONS.includes(action) ? t(`operations.audit.labels.${action}`) : action.replaceAll("_", " ").toLocaleLowerCase();
}

export default function ActivityLog() {
  const { formatDateTime, formatCurrency } = useFormatters();
  const t = useT();
  const { locale } = useI18n();
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("all");
  const { data = [], isLoading, error, refetch, isFetching } = useQuery<LogEntry[]>({
    queryKey: ["activity-log"], queryFn: () => apiRequest<LogEntry[]>("/audit"), refetchInterval: 60_000,
    refetchIntervalInBackground: false, refetchOnWindowFocus: true,
  });
  const actions = [...new Set(data.map((entry) => entry.action))].sort();
  const visible = useMemo(() => {
    const query = search.trim().toLocaleLowerCase(locale);
    return data.filter((entry) => (action === "all" || entry.action === action) &&
      (!query || `${entry.userName} ${entry.entityType} ${translateLabel(entry.action, t)} ${summary(entry, t, formatCurrency, locale)} ${JSON.stringify(entry.metadata)}`.toLocaleLowerCase(locale).includes(query)));
  }, [action, data, search, t, locale, formatCurrency]);

  return <section>
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div><p className="text-[11px] font-black uppercase tracking-[0.16em] text-orange-600">{t("operations.audit.subtitle")}</p><h1 className="mt-1 text-3xl font-black text-slate-950">{t("operations.audit.pageTitle")}</h1><p className="mt-1 text-xs text-slate-500">{t("operations.audit.pageDescription")}</p></div>
      <div className="flex items-center gap-2"><span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-2 text-[10px] font-black text-green-700"><span className="size-2 animate-pulse rounded-full bg-green-500" />{t("operations.audit.autoRefresh")}</span><button type="button" aria-label={t("operations.audit.refresh")} onClick={() => void refetch()} className="flex size-10 items-center justify-center rounded-xl border bg-white text-slate-600"><RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} /></button></div>
    </div>
    <div className="mt-5 grid gap-3 sm:grid-cols-3"><Metric label={t("operations.audit.metrics.visible")} value={visible.length} /><Metric label={t("operations.audit.metrics.people")} value={new Set(data.map((entry) => entry.userName)).size} /><Metric label={t("operations.audit.metrics.events")} value={data.length} /></div>
    <div className="mt-4 grid gap-3 rounded-2xl border bg-white p-4 shadow-sm sm:grid-cols-[1fr_260px]"><label className="relative"><Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input aria-label={t("modules.audit.searchAria")} value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("modules.audit.searchPlaceholder")} className="h-11 w-full rounded-xl border bg-white pl-10 pr-3 text-sm outline-none focus:border-orange-400" /></label><select aria-label={t("modules.audit.filterAria")} value={action} onChange={(event) => setAction(event.target.value)} className="h-11 rounded-xl border bg-white px-3 text-xs font-bold"><option value="all">{t("modules.audit.allActions")}</option>{actions.map((value) => <option key={value} value={value}>{translateLabel(value, t)}</option>)}</select></div>
    <div className="mt-4 overflow-hidden rounded-2xl border bg-white shadow-sm">
      {isLoading ? <Empty icon={<LoaderCircle className="size-5 animate-spin text-orange-600" />} text={t("operations.audit.loading")} /> : error ? <Empty icon={<AlertTriangle className="size-6 text-red-500" />} text={t("operations.audit.loadFailed")} /> : visible.length ? <div className="divide-y">{visible.map((entry) => {
        const details = detailItems(entry, t, formatCurrency, locale);
        return <article key={entry.id} className="grid gap-3 px-4 py-4 transition hover:bg-orange-50/40 sm:grid-cols-[40px_1fr_auto]">
          <span className={`flex size-9 items-center justify-center rounded-xl ${tone(entry.action)}`}>{entry.action.includes("LOGIN") || entry.action.includes("PASSWORD") ? <ShieldCheck className="size-4" /> : <Activity className="size-4" />}</span>
          <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="text-sm font-bold text-slate-900">{translateLabel(entry.action, t)}</h2>{entry.action === "DATA_CHANGED" && <span className="rounded-full bg-blue-50 px-2 py-1 text-[9px] font-bold text-blue-700">{entityLabel(entry, t)}</span>}</div>
            <p className="mt-1 text-xs leading-5 text-slate-600">{summary(entry, t, formatCurrency, locale)}</p>
            <p className="mt-2 text-[10px] text-slate-400">{t("operations.audit.byUser", { name: entry.userName })}</p>
            {details.length > 0 && <details className="mt-2"><summary className="w-fit cursor-pointer text-[10px] font-bold text-orange-700">{t("operations.audit.viewDetails")}</summary><dl className="mt-2 grid gap-x-5 gap-y-1 rounded-xl bg-slate-50 p-3 text-[11px] sm:grid-cols-2">{details.map(([label, value]) => <div key={label} className="flex min-w-0 gap-2"><dt className="shrink-0 text-slate-500">{label}:</dt><dd className="break-words font-semibold text-slate-700">{value}</dd></div>)}</dl></details>}
          </div><time className="text-[10px] font-semibold text-slate-500 sm:text-right">{formatDateTime(entry.createdAt, locale)}</time>
        </article>;
      })}</div> : <Empty text={t("operations.audit.empty")} />}
    </div>
  </section>;
}

function entityLabel(entry: LogEntry, t: (key: string) => string) {
  const path = typeof entry.metadata?.path === "string" ? entry.metadata.path : "";
  const area = path.split("/").filter(Boolean)[0]?.toLowerCase() ?? entry.entityType.toLowerCase();
  const known: Record<string, string> = { products: "products", sales: "sales", stock: "stock", employees: "employees", suppliers: "suppliers", purchases: "purchases", categories: "categories", services: "services", financial: "finance", companies: "company", "cash-registers": "cash", "cash-movements": "cash" };
  const key = known[area];
  return key ? t(`operations.audit.areas.${key}`) : area.replaceAll("_", " ");
}

function summary(entry: LogEntry, t: (key: string, params?: Record<string, string | number>) => string, formatCurrency: (value: number, locale?: Locale) => string, locale: Locale) {
  if (entry.action === "DATA_CHANGED") {
    const method = String(entry.metadata?.method ?? "PATCH").toUpperCase();
    const verb = method === "POST" ? t("operations.audit.verbs.created") : method === "DELETE" ? t("operations.audit.verbs.deleted") : t("operations.audit.verbs.updated");
    return t("operations.audit.changedSummary", { verb, area: entityLabel(entry, t) });
  }
  const items = detailItems(entry, t, formatCurrency, locale);
  return items.length ? items.map(([label, value]) => `${label}: ${value}`).join(" · ") : t("operations.audit.recordedSummary");
}

function detailItems(entry: LogEntry, t: (key: string, params?: Record<string, string | number>) => string, formatCurrency: (value: number, locale?: Locale) => string, locale: Locale): [string, string][] {
  const metadata = entry.metadata ?? {};
  const changes = metadata.changes && typeof metadata.changes === "object" && !Array.isArray(metadata.changes) ? metadata.changes as Record<string, unknown> : null;
  if (entry.action === "DATA_CHANGED" && changes) return Object.entries(changes).slice(0, 8).map(([key, value]) => [fieldLabel(key, t), readableValue(value, key, t, formatCurrency, locale)]);

  const selected: Record<string, string[]> = {
    EMPLOYEE_CREATED: ["email", "role"], EMPLOYEE_ROLE_CHANGED: ["from", "to"], EMPLOYEE_STATUS_CHANGED: ["active"],
    COMPANY_UPDATED: ["fields"], PURCHASE_CREATED: ["number", "total"], PURCHASE_RECEIVED: ["total"], PURCHASE_CANCELLED: ["reason"],
    CASH_REGISTER_OPENED: ["openingAmount"], CASH_REGISTER_CLOSED: ["expectedAmount", "actualAmount", "difference", "discrepancy", "resolution"],
    CASH_MOVEMENT_RECORDED: ["type", "amount"], STOCK_TRANSFERRED: ["quantity"], FINANCIAL_PAYMENT_RECORDED: ["amount", "paymentMethod"],
    SUPPLIER_UPDATED: ["fields"], SUPPLIER_CREATED: ["name"], CATEGORY_CREATED: ["name", "itemType"], CATEGORY_UPDATED: ["name"],
    SERVICE_CREATED: ["name", "code"], SERVICE_UPDATED: ["name"], BUSINESS_GROUP_CREATED: ["name"], UNIT_CREATED: ["tradeName", "unitCode"],
    SUBSCRIPTION_REQUESTED: ["type", "targetPlan"], SUBSCRIPTION_CHECKOUT_CREATED: ["targetPlan", "amount", "currency"],
    SUBSCRIPTION_ACTIVATED: ["effectiveAt"], SUBSCRIPTION_CANCELLED: ["effectiveAt"], SUBSCRIPTION_PAYMENT_UPDATED: ["eventType", "status"],
    FISCAL_DOCUMENT_PREPARED: ["documentType", "number"], FISCAL_PROVIDER_CONNECTED: ["provider"], FISCAL_DOCUMENT_SUBMITTED: ["status"],
    FISCAL_DOCUMENT_CANCELLED: ["reason"], FISCAL_SETTINGS_UPDATED: ["fields"],
  };
  return (selected[entry.action] ?? []).filter((key) => metadata[key] !== undefined && metadata[key] !== null).map((key) => [fieldLabel(key, t), readableValue(metadata[key], key, t, formatCurrency, locale)]);
}

function fieldLabel(key: string, t: (key: string) => string) {
  const labels: Record<string, string> = { name: "name", email: "email", role: "role", from: "from", to: "to", active: "active", fields: "fields", number: "number", total: "total", reason: "reason", openingAmount: "openingAmount", expectedAmount: "expectedAmount", actualAmount: "actualAmount", difference: "difference", discrepancy: "difference", type: "type", amount: "amount", quantity: "quantity", paymentMethod: "paymentMethod", itemType: "itemType", code: "code", tradeName: "tradeName", unitCode: "unitCode", targetPlan: "targetPlan", currency: "currency", effectiveAt: "effectiveAt", eventType: "eventType", status: "status", documentType: "documentType", provider: "provider", price: "price", sku: "sku", barcode: "barcode", category: "category", description: "description", trackStock: "trackStock", minimumStock: "minimumStock" };
  const translation = labels[key] ? t(`operations.audit.fields.${labels[key]}`) : "";
  return translation || key.replace(/([a-z])([A-Z])/g, "$1 $2").replaceAll("_", " ");
}

function readableValue(value: unknown, key: string, t: (key: string, params?: Record<string, string | number>) => string, formatCurrency: (value: number, locale?: Locale) => string, locale: Locale): string {
  if (typeof value === "boolean") return t(value ? "operations.audit.values.yes" : "operations.audit.values.no");
  if (typeof value === "number") return /amount|total|difference|discrepancy/i.test(key) ? formatCurrency(value, locale) : String(value);
  if (typeof value === "string") {
    if (/amount|total|difference|discrepancy/i.test(key) && /^-?\d+(\.\d+)?$/.test(value)) return formatCurrency(Number(value), locale);
    const enumValues: Record<string, string> = { OWNER: "owner", ADMIN: "admin", MANAGER: "manager", SELLER: "seller", CASHIER: "cashier", IN: "in", OUT: "out", PIX: "pix", CASH: "cash", CARD: "card", CREDIT_CARD: "creditCard", DEBIT_CARD: "debitCard", BANK_TRANSFER: "bankTransfer" };
    const enumKey = enumValues[value.toUpperCase()];
    return enumKey ? t(`operations.audit.values.${enumKey}`) : value.replaceAll("_", " ");
  }
  if (Array.isArray(value)) return value.map((item) => typeof item === "string" ? (key === "fields" ? fieldLabel(item, t) : readableValue(item, key, t, formatCurrency, locale)) : "").filter(Boolean).join(", ");
  if (value && typeof value === "object") return t("operations.audit.values.updatedFields", { count: Object.keys(value).length });
  return String(value ?? "—");
}

function tone(action: string) { if (action.includes("FAILURE") || action.includes("CANCELLED")) return "bg-red-50 text-red-600"; if (action.includes("CREATED") || action.includes("SUCCESS") || action.includes("RECEIVED")) return "bg-green-50 text-green-700"; return "bg-orange-50 text-orange-700"; }
function Metric({ label, value }: { label: string; value: number }) { return <div className="rounded-2xl border bg-white p-4 shadow-sm"><p className="text-2xl font-black text-slate-950">{value}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p></div>; }
function Empty({ icon, text }: { icon?: ReactNode; text: string }) { return <div className="flex min-h-72 flex-col items-center justify-center gap-3 text-center text-xs font-bold text-slate-500">{icon}{text}</div>; }
