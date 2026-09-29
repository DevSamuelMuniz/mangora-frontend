"use client";

import { ReactNode, useEffect, useState, useSyncExternalStore } from "react";
import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";
import type { AuthSession } from "@/lib/auth/types";
import RouteToast from "@/components/ui/RouteToast";
import { setUserProperties } from "@/lib/analytics";
import OfflineBanner from "@/components/pwa/OfflineBanner";
import TrialAccessGate from "@/components/subscription/TrialAccessGate";
import MfaRecommendationModal from "@/components/security/MfaRecommendationModal";

type DashboardShellProps = {
  children: ReactNode;
  session: AuthSession;
};

export default function DashboardShell({
  children,
  session,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
        <MfaRecommendationModal session={session} />
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
    </div>
  );
}
