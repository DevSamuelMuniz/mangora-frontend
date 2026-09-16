"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useI18n, useT } from "@/i18n/provider";
import { useQuery } from "@tanstack/react-query";
import { Activity, AlertTriangle, LoaderCircle, RefreshCw, Search, ShieldCheck } from "lucide-react";
import { apiRequest } from "@/lib/api/client";
import { formatDateTime } from "@/lib/format";

type LogEntry = { id: string; action: string; userName: string; entityType: string; entityId: string | null; ipAddress: string | null; metadata: Record<string, unknown> | null; createdAt: string };
const labelKeys: Record<string, string> = {
  DATA_CHANGED: "DATA_CHANGED",
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_FAILURE: "LOGIN_FAILURE",
  PASSWORD_CHANGED: "PASSWORD_CHANGED",
  SESSION_REVOKED: "SESSION_REVOKED",
  COMPANY_UPDATED: "COMPANY_UPDATED",
  EMPLOYEE_CREATED: "EMPLOYEE_CREATED",
  EMPLOYEE_ROLE_CHANGED: "EMPLOYEE_ROLE_CHANGED",
  EMPLOYEE_STATUS_CHANGED: "EMPLOYEE_STATUS_CHANGED",
  CASH_REGISTER_OPENED: "CASH_REGISTER_OPENED",
  CASH_REGISTER_CLOSED: "CASH_REGISTER_CLOSED",
  CASH_MOVEMENT_RECORDED: "CASH_MOVEMENT_RECORDED",
  SUPPLIER_CREATED: "SUPPLIER_CREATED",
  SUPPLIER_UPDATED: "SUPPLIER_UPDATED",
  PURCHASE_CREATED: "PURCHASE_CREATED",
  PURCHASE_RECEIVED: "PURCHASE_RECEIVED",
  PURCHASE_CANCELLED: "PURCHASE_CANCELLED",
  CATEGORY_CREATED: "CATEGORY_CREATED",
  CATEGORY_UPDATED: "CATEGORY_UPDATED",
  SERVICE_CREATED: "SERVICE_CREATED",
  SERVICE_UPDATED: "SERVICE_UPDATED",
  FINANCIAL_PAYMENT_RECORDED: "FINANCIAL_PAYMENT_RECORDED",
  STOCK_TRANSFERRED: "STOCK_TRANSFERRED",
};

function translateLabel(action: string, t: (key: string) => string) { const key = labelKeys[action]; return key ? t(`operations.audit.labels.${key}`) : action; }


export default function ActivityLog() {
  const t = useT();
  const { locale } = useI18n();
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("all");
  const { data = [], isLoading, error, refetch, isFetching } = useQuery<LogEntry[]>({ queryKey: ["activity-log"], queryFn: () => apiRequest<LogEntry[]>("/audit"), refetchInterval: 5000 });
  const actions = [...new Set(data.map((entry) => entry.action))].sort();
  const visible = useMemo(() => {
    const query = search.trim().toLocaleLowerCase(locale);
    return data.filter((entry) => (action === "all" || entry.action === action) && (!query || `${entry.userName} ${entry.entityType} ${translateLabel(entry.action, t) ?? entry.action} ${JSON.stringify(entry.metadata)}`.toLocaleLowerCase(locale).includes(query)));
  }, [action, data, search, t, locale]);

  return <section>
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div><p className="text-[11px] font-black uppercase tracking-[0.16em] text-orange-600">{t("operations.audit.subtitle")}</p><h1 className="mt-1 text-3xl font-black text-slate-950">LOG</h1><p className="mt-1 text-xs text-slate-500">Acompanhe em tempo quase real todas as ações e alterações da equipe.</p></div>
      <div className="flex items-center gap-2"><span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-2 text-[10px] font-black text-green-700"><span className="size-2 animate-pulse rounded-full bg-green-500" />{t("operations.audit.autoRefresh")}</span><button type="button" aria-label="Atualizar LOG" onClick={() => void refetch()} className="flex size-10 items-center justify-center rounded-xl border bg-white text-slate-600"><RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} /></button></div>
    </div>
    <div className="mt-5 grid gap-3 sm:grid-cols-3"><Metric label={t("operations.audit.metrics.visible")} value={visible.length} /><Metric label="Usuários ativos no log" value={new Set(data.map((entry) => entry.userName)).size} /><Metric label="Alterações registradas" value={data.filter((entry) => entry.action === "DATA_CHANGED").length} /></div>
    <div className="mt-4 grid gap-3 rounded-2xl border bg-white p-4 shadow-sm sm:grid-cols-[1fr_240px]"><label className="relative"><Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input aria-label="Buscar no LOG" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar pessoa, ação ou área..." className="h-11 w-full rounded-xl border bg-white pl-10 pr-3 text-sm outline-none focus:border-orange-400" /></label><select aria-label="Filtrar tipo de ação" value={action} onChange={(event) => setAction(event.target.value)} className="h-11 rounded-xl border bg-white px-3 text-xs font-bold"><option value="all">Todas as ações</option>{actions.map((value) => <option key={value} value={value}>{translateLabel(value, t)}</option>)}</select></div>
    <div className="mt-4 overflow-hidden rounded-2xl border bg-white shadow-sm">
      {isLoading ? <Empty icon={<LoaderCircle className="size-5 animate-spin text-orange-600" />} text={t("operations.audit.loading")} /> : error ? <Empty icon={<AlertTriangle className="size-6 text-red-500" />} text={t("operations.audit.loadFailed")} /> : visible.length ? <div className="divide-y">{visible.map((entry) => <article key={entry.id} className="grid gap-3 px-4 py-4 transition hover:bg-orange-50/40 sm:grid-cols-[44px_1fr_auto]">
        <span className={`flex size-10 items-center justify-center rounded-xl ${tone(entry.action)}`}>{entry.action.includes("LOGIN") || entry.action.includes("PASSWORD") ? <ShieldCheck className="size-4" /> : <Activity className="size-4" />}</span>
        <div><div className="flex flex-wrap items-center gap-2"><h2 className="text-xs font-black text-slate-900">{translateLabel(entry.action, t) ?? entry.action}</h2><span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-bold text-slate-600">{entry.entityType}</span></div><p className="mt-1 text-[11px] text-slate-600"><strong>{entry.userName}</strong>{description(entry)}</p>{entry.entityId && <p className="mt-1 truncate font-mono text-[9px] text-slate-400">ID: {entry.entityId}</p>}{hasChanges(entry) && <details className="mt-2"><summary className="cursor-pointer text-[10px] font-black text-orange-700">Ver dados da alteração</summary><pre className="mt-2 max-h-48 overflow-auto rounded-xl bg-slate-950 p-3 text-[9px] leading-5 text-orange-100">{JSON.stringify(entry.metadata?.changes, null, 2)}</pre></details>}</div>
        <time className="text-[10px] font-semibold text-slate-500 sm:text-right">{formatDateTime(entry.createdAt, locale)}</time>
      </article>)}</div> : <Empty text={t("operations.audit.empty")} />}
    </div>
  </section>;
}

function Metric({ label, value }: { label: string; value: number }) { return <div className="rounded-2xl border bg-white p-4 shadow-sm"><p className="text-2xl font-black text-slate-950">{value}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p></div>; }
function Empty({ icon, text }: { icon?: ReactNode; text: string }) { return <div className="flex min-h-72 flex-col items-center justify-center gap-3 text-center text-xs font-bold text-slate-500">{icon}{text}</div>; }
function tone(action: string) { if (action.includes("FAILURE") || action.includes("CANCELLED")) return "bg-red-50 text-red-600"; if (action.includes("CREATED") || action.includes("SUCCESS")) return "bg-green-50 text-green-700"; return "bg-orange-50 text-orange-700"; }
function hasChanges(entry: LogEntry) { const changes = entry.metadata?.changes; return Boolean(changes && typeof changes === "object" && Object.keys(changes).length); }
function description(entry: LogEntry) { const path = typeof entry.metadata?.path === "string" ? entry.metadata.path : null; return path ? ` alterou ${path}` : ` atuou em ${entry.entityType}`; }
