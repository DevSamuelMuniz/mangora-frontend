import type { ReactNode } from "react";
import AuthRouteGuard from "@/components/auth/AuthRouteGuard";

export default function LoginLayout({ children }: { children: ReactNode }) {
  return <AuthRouteGuard>{children}</AuthRouteGuard>;
}
