"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useT } from "@/i18n/provider";
import { useRouter } from "next/navigation";
import { Bell, Boxes, CheckCheck, ChevronRight, CircleDollarSign, Inbox, LoaderCircle, ShieldAlert, Sparkles, X, type LucideIcon } from "lucide-react";
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications, type NotificationItem } from "@/features/notifications/hooks/useNotifications";
import { formatDateTime } from "@/lib/format";

type NotificationStyle = { icon: LucideIcon; iconClass: string; href: string; labelKey: string };
const styles: Record<string, NotificationStyle> = {
  LOW_STOCK: { icon: Boxes, iconClass: "bg-amber-50 text-amber-700", href: "/estoque", labelKey: "STOCK" },
  OVERDUE_ACCOUNT: { icon: CircleDollarSign, iconClass: "bg-red-50 text-red-600", href: "/financeiro", labelKey: "FINANCE" },
  SECURITY: { icon: ShieldAlert, iconClass: "bg-red-50 text-red-600", href: "/configuracao", labelKey: "SECURITY" },
  SUMMARY: { icon: Sparkles, iconClass: "bg-green-50 text-green-700", href: "/relatorios", labelKey: "SUMMARY" },
  INFO: { icon: Bell, iconClass: "bg-orange-50 text-orange-700", href: "/dashboard", labelKey: "INFO" },
};

export default function NotificationCenter({ onOpen }: { onOpen?: () => void }) {
  const t = useT();
  const router = useRouter();
  const { data, isLoading, isFetching } = useNotifications();
  const markAll = useMarkAllNotificationsRead();
  const markOne = useMarkNotificationRead();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const rootRef = useRef<HTMLDivElement>(null);
  const notifications = data?.items ?? [];
  const unread = notifications.filter((item) => !item.readAt).length;
  const visible = filter === "unread" ? notifications.filter((item) => !item.readAt) : notifications;

  useEffect(() => {
    if (!open) return;
    function closeOutside(event: PointerEvent) { if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false); }
    function closeKeyboard(event: KeyboardEvent) { if (event.key === "Escape") setOpen(false); }
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeKeyboard);
    return () => { document.removeEventListener("pointerdown", closeOutside); document.removeEventListener("keydown", closeKeyboard); };
  }, [open]);

  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener("mangora-close-notifications", close);
    return () => window.removeEventListener("mangora-close-notifications", close);
  }, []);

  async function openNotification(notification: NotificationItem) {
    if (!notification.readAt) {
      try { await markOne.mutateAsync(notification.id); } catch { /* A navegação continua; a leitura poderá ser tentada novamente. */ }
    }
    setOpen(false);
    router.push((styles[notification.type] ?? styles.INFO).href);
  }

  return <div ref={rootRef} className="relative">
    <button type="button" onClick={() => setOpen((current) => { if (!current) onOpen?.(); return !current; })} aria-label={unread ? t("dashboard.notifications.unreadLabel", { count: unread }) : t("dashboard.notifications.label")} aria-expanded={open} className={`relative flex size-10 items-center justify-center rounded-xl border transition ${open ? "border-orange-300 bg-orange-50 text-orange-700 shadow-sm" : "border-slate-200 bg-white text-slate-500 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"}`}>
      <Bell className={`size-[18px] ${unread ? "fill-orange-100" : ""}`} />
      {unread > 0 && <span className="absolute -right-1.5 -top-1.5 flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[9px] font-black leading-none text-white shadow-sm">{unread > 9 ? "9+" : unread}</span>}
    </button>

    {open && <div role="dialog" aria-modal="false" aria-label={t("workspace.notifications.center")} className="fixed left-3 right-3 top-[4.5rem] z-50 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20 sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-[400px]">
      <header className="bg-[#173d2b] px-5 pb-4 pt-5 text-white">
        <div className="flex items-start justify-between gap-3"><div><div className="flex items-center gap-2"><span className="flex size-8 items-center justify-center rounded-xl bg-white/10 text-orange-300"><Bell className="size-4" /></span><h2 className="text-base font-black">{t("workspace.notifications.title")}</h2></div><p className="mt-2 text-[11px] text-green-100/70">{unread ? `${unread} ${unread === 1 ? "aviso precisa" : "avisos precisam"} da sua atenção` : t("workspace.notifications.subtitle")}</p></div><button type="button" onClick={() => setOpen(false)} aria-label={t("workspace.notifications.close")} className="flex size-8 items-center justify-center rounded-xl text-white/60 hover:bg-white/10 hover:text-white"><X className="size-4" /></button></div>
        <div className="mt-4 flex items-center justify-between gap-3"><div className="flex rounded-xl bg-black/15 p-1"><FilterButton active={filter === "all"} onClick={() => setFilter("all")}>{t("workspace.notifications.all")} <span>{notifications.length}</span></FilterButton><FilterButton active={filter === "unread"} onClick={() => setFilter("unread")}>{t("workspace.notifications.unread")} <span>{unread}</span></FilterButton></div><button type="button" disabled={!unread || markAll.isPending} onClick={() => markAll.mutate()} className="flex items-center gap-1.5 text-[10px] font-bold text-orange-300 hover:text-orange-200 disabled:cursor-not-allowed disabled:text-white/30">{markAll.isPending ? <LoaderCircle className="size-3.5 animate-spin" /> : <CheckCheck className="size-3.5" />}Marcar todas</button></div>
      </header>

      <div className="max-h-[min(440px,calc(100vh-12rem))] overflow-y-auto overscroll-contain">
        {isLoading ? <Empty icon={LoaderCircle} spin text={t("workspace.notifications.loading")} /> : visible.length ? <div className="divide-y divide-slate-100">{visible.map((notification) => <NotificationRow key={notification.id} notification={notification} busy={markOne.isPending} onOpen={() => void openNotification(notification)} />)}</div> : <Empty icon={filter === "unread" ? CheckCheck : Inbox} text={filter === "unread" ? t("workspace.notifications.emptyPending") : t("workspace.notifications.empty")} />}
      </div>
      <footer className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-5 py-3"><p className="text-[9px] font-semibold text-slate-400">{isFetching ? t("workspace.notifications.updating") : t("workspace.notifications.updated")}</p><button type="button" onClick={() => { setOpen(false); router.push("/configuracoes?secao=notifications"); }} className="text-[10px] font-black text-orange-700 hover:text-orange-900">{t("workspace.notifications.configure")}</button></footer>
    </div>}
  </div>;
}

function NotificationRow({ notification, busy, onOpen }: { notification: NotificationItem; busy: boolean; onOpen: () => void }) {
  const t = useT();
  const style = styles[notification.type] ?? styles.INFO;
  const Icon = style.icon;
  return <button type="button" disabled={busy} onClick={onOpen} className={`group flex w-full gap-3 px-4 py-4 text-left transition hover:bg-orange-50/50 disabled:cursor-wait ${notification.readAt ? "bg-white" : "bg-orange-50/25"}`}><span className={`flex size-10 shrink-0 items-center justify-center rounded-2xl ${style.iconClass}`}><Icon className="size-4" /></span><span className="min-w-0 flex-1"><span className="flex items-center gap-2"><strong className="min-w-0 flex-1 truncate text-xs text-slate-900">{notification.title}</strong>{!notification.readAt && <span className="size-2 shrink-0 rounded-full bg-orange-500" />}</span><span className="mt-1.5 line-clamp-2 block text-[11px] leading-[1.55] text-slate-500">{notification.description}</span><span className="mt-2 flex items-center gap-2 text-[9px] font-semibold text-slate-400"><span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-500">{t(`workspace.notifications.kinds.${style.labelKey}`)}</span><time suppressHydrationWarning dateTime={notification.createdAt}>{relativeTime(notification.createdAt, t)}</time><span className="hidden sm:inline">· {formatDateTime(notification.createdAt)}</span></span></span><ChevronRight className="mt-3 size-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-orange-500" /></button>;
}
function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) { return <button type="button" onClick={onClick} className={`flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[10px] font-black transition ${active ? "bg-white text-[#173d2b] shadow-sm" : "text-white/60 hover:text-white"}`}>{children}</button>; }
function Empty({ icon: Icon, text, spin = false }: { icon: LucideIcon; text: string; spin?: boolean }) { return <div className="flex min-h-52 flex-col items-center justify-center px-6 text-center"><span className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><Icon className={`size-5 ${spin ? "animate-spin" : ""}`} /></span><p className="mt-3 text-xs font-bold text-slate-600">{text}</p></div>; }
function relativeTime(value: string, t: (key: string, params?: Record<string, string | number>) => string) { const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000)); if (seconds < 60) return t("workspace.notifications.relative.now"); const minutes = Math.floor(seconds / 60); if (minutes < 60) return t("workspace.notifications.relative.minutes", { count: minutes }); const hours = Math.floor(minutes / 60); if (hours < 24) return t("workspace.notifications.relative.hours", { count: hours }); const days = Math.floor(hours / 24); return days === 1 ? t("workspace.notifications.relative.yesterday") : t("workspace.notifications.relative.days", { count: days }); }
