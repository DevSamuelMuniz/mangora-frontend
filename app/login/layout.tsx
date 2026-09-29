import type { ReactNode } from "react";
import type { Metadata } from "next";
import AuthRouteGuard from "@/components/auth/AuthRouteGuard";

export const metadata: Metadata = { title: "Entrar", description: "Acesse sua conta Mangora.", robots: { index: false, follow: false } };

export default function LoginLayout({ children }: { children: ReactNode }) {
  return <AuthRouteGuard>{children}</AuthRouteGuard>;
}
