"use client";

import { ReactNode, useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot } from "lucide-react";
import { useT } from "@/i18n/provider";
import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";
import type { AuthSession } from "@/lib/auth/types";
import RouteToast from "@/components/ui/RouteToast";
import { setUserProperties } from "@/lib/analytics";
import OfflineBanner from "@/components/pwa/OfflineBanner";
import TrialAccessGate from "@/components/subscription/TrialAccessGate";
import PendingSubscriptionPaymentModal from "@/components/subscription/PendingSubscriptionPaymentModal";

type DashboardShellProps = {
  children: ReactNode;
  session: AuthSession;
};

export default function DashboardShell({
  children,
  session,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const t = useT();
  const simpleModeKey = `mangora-simple-mode:${session.user.id}`;
  const simpleMode = useSyncExternalStore(
    (onChange) => {
      window.addEventListener("storage", onChange);
      window.addEventListener("mangora-simple-mode-change", onChange);
      return () => {
        window.removeEventListener("storage", onChange);
        window.removeEventListener("mangora-simple-mode-change", onChange);
      };
    },
    () => window.localStorage.getItem(simpleModeKey) === "true",
    () => false,
  );

  useEffect(() => {
    setUserProperties({ logged_in: "true", role: session.membership.role, app: "mangora-web" });
  }, [session]);

  function changeSimpleMode(enabled: boolean) {
    window.localStorage.setItem(simpleModeKey, String(enabled));
    window.dispatchEvent(new Event("mangora-simple-mode-change"));
  }

  return (
    <div className="mangora-app min-h-screen bg-slate-50 text-slate-950">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        session={session}
        simpleMode={simpleMode}
      />

      <div className="mangora-workspace lg:pl-64">
        <PendingSubscriptionPaymentModal session={session} />
        <RouteToast />
        <OfflineBanner />
        <DashboardHeader
          onOpenSidebar={() => setSidebarOpen(true)}
          session={session}
          simpleMode={simpleMode}
          onSimpleModeChange={changeSimpleMode}
        />
        <TrialAccessGate session={session} />

        <main className="mangora-content px-4 py-5 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1600px]">
            {children}
          </div>
        </main>
      </div>
      {pathname !== "/gerente-ia" && !sidebarOpen && (
        <Link
          href="/gerente-ia"
          aria-label={t("navigation.items.ai")}
          title={t("navigation.items.ai")}
          className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-[calc(1rem+env(safe-area-inset-right))] z-30 flex h-14 items-center justify-center gap-2.5 rounded-full bg-[#123d2b] px-4 text-sm font-bold text-white shadow-lg shadow-[#123d2b]/25 transition-colors hover:bg-[#147a45] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-500 sm:px-5 print:hidden"
        >
          <Bot className="size-6" aria-hidden="true" />
          <span className="hidden sm:inline">{t("navigation.items.ai")}</span>
        </Link>
      )}
    </div>
  );
}
