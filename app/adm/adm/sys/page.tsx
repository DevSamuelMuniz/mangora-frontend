import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/server";
import SystemAdminConsole from "@/components/system-admin/SystemAdminConsole";

export const metadata: Metadata = { title: "Central do sistema", robots: { index: false, follow: false } };

export default async function SystemAdminPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login?retorno=/adm/adm/sys");
  return <SystemAdminConsole operatorName={session.user.name} />;
}
