import type { ReactNode } from "react";
import AuthRouteGuard from "@/components/auth/AuthRouteGuard";

export default function RegisterLayout({ children }: { children: ReactNode }) {
  return <AuthRouteGuard>{children}</AuthRouteGuard>;
}
