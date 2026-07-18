"use client";

import { ReactNode, useState } from "react";
import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";
import type { AuthSession } from "@/lib/auth/types";

type DashboardShellProps = {
  children: ReactNode;
  session: AuthSession;
};

export default function DashboardShell({
  children,
  session,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        session={session}
      />

      <div className="lg:pl-64">
        <DashboardHeader
          onOpenSidebar={() => setSidebarOpen(true)}
          session={session}
        />

        <main className="px-4 py-5 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1600px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
