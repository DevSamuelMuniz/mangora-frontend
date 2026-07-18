"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Bell,
  CheckCheck,
  ChevronDown,
  CreditCard,
  LogOut,
  Menu,
  Search,
  Settings,
  UserRound,
} from "lucide-react";
import { apiRequest } from "@/lib/api/client";
import { roleLabels, type AuthSession } from "@/lib/auth/types";

type DashboardHeaderProps = {
  onOpenSidebar: () => void;
  session: AuthSession;
};

type NotificationItem = {
  id: string;
  title: string;
  description: string;
  type: string;
  readAt: string | null;
  createdAt: string;
};

export default function DashboardHeader({ onOpenSidebar, session }: DashboardHeaderProps) {
  const router = useRouter();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const notificationMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const unread = notifications.filter((notification) => !notification.readAt).length;
  const roleLabel = roleLabels[session.membership.role];
  const initials = session.user.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name[0]?.toUpperCase())
    .join("");

  useEffect(() => {
    let active = true;
    void apiRequest<{ items: NotificationItem[] }>("/notifications")
      .then((response) => { if (active) setNotifications(response.items); })
      .catch(() => { /* A ausência temporária da API não bloqueia o dashboard. */ });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!profileOpen) return;

    function closeProfileMenu(event: PointerEvent) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    }

    function closeProfileMenuWithKeyboard(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setProfileOpen(false);
      }
    }

    document.addEventListener("pointerdown", closeProfileMenu);
    document.addEventListener("keydown", closeProfileMenuWithKeyboard);

    return () => {
      document.removeEventListener("pointerdown", closeProfileMenu);
      document.removeEventListener("keydown", closeProfileMenuWithKeyboard);
    };
  }, [profileOpen]);

  useEffect(() => {
    if (!notificationOpen) return;
    function closeNotifications(event: PointerEvent) {
      if (notificationMenuRef.current && !notificationMenuRef.current.contains(event.target as Node)) setNotificationOpen(false);
    }
    function closeNotificationsWithKeyboard(event: KeyboardEvent) {
      if (event.key === "Escape") setNotificationOpen(false);
    }
    document.addEventListener("pointerdown", closeNotifications);
    document.addEventListener("keydown", closeNotificationsWithKeyboard);
    return () => {
      document.removeEventListener("pointerdown", closeNotifications);
      document.removeEventListener("keydown", closeNotificationsWithKeyboard);
    };
  }, [notificationOpen]);

  function toggleNotifications() {
    setProfileOpen(false);
    setNotificationOpen((current) => !current);
  }

  function toggleProfile() {
    setNotificationOpen(false);
    setProfileOpen((current) => !current);
  }

  async function markAllRead() {
    await apiRequest<{ updated: number }>("/notifications/read-all", { method: "POST" });
    const readAt = new Date().toISOString();
    setNotifications((current) => current.map((notification) => ({ ...notification, readAt: notification.readAt ?? readAt })));
  }

  async function handleLogout() {
    setLogoutLoading(true);
    try {
      await apiRequest<void>("/auth/logout", { method: "POST" });
    } catch {
      // A sessão local ainda deve ser encerrada quando a API já a invalidou.
    } finally {
      router.push("/login");
      router.refresh();
      setLogoutLoading(false);
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b border-slate-200 bg-white/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex w-full items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <button type="button" onClick={onOpenSidebar} aria-label="Abrir menu" className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 lg:hidden">
            <Menu className="size-4.5" />
          </button>
          <div className="hidden min-w-0 sm:block">
            <h1 className="truncate text-sm font-bold text-slate-950">Painel de controle</h1>
            <p className="mt-0.5 truncate text-[11px] text-slate-400">Acompanhe os resultados da sua empresa</p>
          </div>
        </div>

        <div className="hidden max-w-sm flex-1 md:block">
          <div ref={notificationMenuRef} className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input type="search" placeholder="Buscar no sistema..." className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button type="button" onClick={toggleNotifications} aria-label="Notificações" aria-expanded={notificationOpen} className="relative flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-violet-600">
              <Bell className="size-4.5" />
              {unread > 0 && <span className="absolute right-2.5 top-2.5 size-2 rounded-full border-2 border-white bg-red-500" />}
            </button>

            {notificationOpen && (
              <div role="dialog" aria-label="Central de notificações" className="absolute right-0 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-300/50">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <div><p className="text-sm font-black text-slate-900">Notificações</p><p className="text-[10px] text-slate-400">{unread} não lidas</p></div>
                  <button type="button" disabled={!unread} onClick={() => void markAllRead()} className="flex items-center gap-1.5 text-[10px] font-bold text-violet-600 hover:text-violet-800 disabled:text-slate-300"><CheckCheck className="size-3.5" /> Marcar como lidas</button>
                </div>
                <div className="divide-y divide-slate-100">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="flex gap-3 px-4 py-3">
                      <span className={`mt-1 size-2 shrink-0 rounded-full ${notification.readAt ? "bg-slate-200" : "bg-violet-500"}`} />
                      <div><p className="text-xs font-bold text-slate-800">{notification.title}</p><p className="mt-1 text-[11px] leading-4 text-slate-500">{notification.description}</p></div>
                    </div>
                  ))}
                  {!notifications.length && <p className="px-4 py-6 text-center text-[11px] text-slate-400">Nenhuma notificação por enquanto.</p>}
                </div>
              </div>
            )}
          </div>

          <div ref={profileMenuRef} className="relative">
            <button type="button" onClick={toggleProfile} aria-label={`${session.user.name} ${roleLabel}`} aria-expanded={profileOpen} className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 transition hover:bg-slate-50 sm:pr-3">
              <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 text-[10px] font-black text-white">{initials}</div>
              <div className="hidden text-left sm:block"><p className="max-w-28 truncate text-[11px] font-bold text-slate-800">{session.user.name}</p><p className="text-[9px] text-slate-400">{roleLabel}</p></div>
              <ChevronDown className="hidden size-3.5 text-slate-400 sm:block" />
            </button>

            {profileOpen && (
              <div role="menu" aria-label="Menu do perfil" className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-300/50">
                <div className="border-b border-slate-100 px-3 py-2"><p className="text-xs font-black text-slate-900">{session.user.name}</p><p className="mt-0.5 truncate text-[10px] text-slate-400">{session.user.email}</p></div>
                {(session.membership.role === "OWNER" || session.membership.role === "ADMIN") && <Link href="/configuracoes" role="menuitem" className="mt-1 flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-violet-700"><UserRound className="size-4" /> Dados da empresa</Link>}
                {(session.membership.role === "OWNER" || session.membership.role === "ADMIN") && <Link href="/configuracoes" role="menuitem" className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-violet-700"><Settings className="size-4" /> Configurações</Link>}
                {session.membership.role === "OWNER" && <Link href="/assinatura" role="menuitem" className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-violet-700"><CreditCard className="size-4" /> Assinatura</Link>}
                <button type="button" role="menuitem" disabled={logoutLoading} onClick={() => void handleLogout()} className="mt-1 flex w-full items-center gap-2 border-t border-slate-100 px-3 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"><LogOut className="size-4" /> {logoutLoading ? "Saindo..." : "Sair"}</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
