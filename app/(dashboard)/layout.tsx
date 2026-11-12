import type { ReactNode } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import DashboardShell from "@/components/dashboard/DashboardShell";
import InstallPrompt from "@/components/pwa/InstallPrompt";
import { getCurrentSession } from "@/lib/auth/server";
import { PrintScopeProvider } from "@/lib/printing/scope";

export const metadata: Metadata = { robots: { index: false, follow: false, noarchive: true, nosnippet: true } };

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  if (session.security.nextStep) redirect("/seguranca-da-conta");

  return <PrintScopeProvider key={session.company.id} companyId={session.company.id}><DashboardShell session={session}>{children}<InstallPrompt /></DashboardShell></PrintScopeProvider>;
}
