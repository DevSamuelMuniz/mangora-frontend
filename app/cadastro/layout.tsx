import type { ReactNode } from "react";
import type { Metadata } from "next";
import AuthRouteGuard from "@/components/auth/AuthRouteGuard";

export const metadata: Metadata = { title: "Criar conta", description: "Crie sua conta Mangora e teste o sistema gratuitamente por 7 dias.", robots: { index: false, follow: false } };

export default function RegisterLayout({ children }: { children: ReactNode }) {
  return <AuthRouteGuard>{children}</AuthRouteGuard>;
}
