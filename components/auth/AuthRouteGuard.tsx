import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/server";

export default async function AuthRouteGuard({ children }: { children: ReactNode }) {
  const session = await getCurrentSession();
  if (session) redirect("/dashboard");
  return children;
}
