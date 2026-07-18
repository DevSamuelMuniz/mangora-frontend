import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import DashboardShell from "@/components/dashboard/DashboardShell";
import { getCurrentSession } from "@/lib/auth/server";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const session = await getCurrentSession();
  if (!session) redirect("/login");

  return <DashboardShell session={session}>{children}</DashboardShell>;
}
