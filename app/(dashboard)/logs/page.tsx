import type { Metadata } from "next";
import { redirect } from "next/navigation";
import ActivityLog from "@/components/audit/ActivityLog";
import { getCurrentSession } from "@/lib/auth/server";

export const metadata: Metadata = { title: "LOG", description: "Histórico completo das ações realizadas no sistema." };

export default async function LogsPage() {
  const session = await getCurrentSession();
  if (!session || session.membership.role !== "OWNER") redirect("/dashboard");
  return <ActivityLog />;
}
