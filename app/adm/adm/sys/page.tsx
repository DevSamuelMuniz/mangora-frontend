import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/server";
import { isSystemAdminEmail } from "@/lib/auth/system-admin";
import SystemAdminConsole from "@/components/system-admin/SystemAdminConsole";

export const metadata: Metadata = { title: "Central do sistema", robots: { index: false, follow: false } };

export default async function SystemAdminPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login?retorno=/adm/adm/sys");
  if (!isSystemAdminEmail(session.user.email)) redirect("/dashboard");
  return <SystemAdminConsole operatorName={session.user.name} />;
}
