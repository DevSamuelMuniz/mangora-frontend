"use client";

import { ReactNode, useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";
import type { AuthSession } from "@/lib/auth/types";
import RouteToast from "@/components/ui/RouteToast";
import { setUserProperties } from "@/lib/analytics";
import OfflineBanner from "@/components/pwa/OfflineBanner";
import TrialAccessGate from "@/components/subscription/TrialAccessGate";

type DashboardShellProps = {
  children: ReactNode;
  session: AuthSession;
};

export default function DashboardShell({
  children,
  session,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setUserProperties({ logged_in: "true", role: session.membership.role, app: "mangora-web" });
  }, [session]);

  return (
    <div className="mangora-app min-h-screen bg-slate-50 text-slate-950">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        session={session}
      />

      <div className="mangora-workspace lg:pl-64">
        <RouteToast />
        <OfflineBanner />
        <DashboardHeader
          onOpenSidebar={() => setSidebarOpen(true)}
          session={session}
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
