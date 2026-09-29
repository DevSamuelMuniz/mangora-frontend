import type { MembershipRole } from "@/lib/auth/types";

/**
 * Permissões centralizadas (fonte única de autorização no frontend).
 *
 * Fase 6: substitui checks espalhados como `role === "OWNER" || role === "ADMIN"`.
 * O backend continua sendo a autoridade real — o frontend usa `can()` apenas
 * para exibir/ocultar ações (UX).
 */
export type Permission = "company:configure" | "subscription:manage" | "employees:manage";

const PERMISSIONS: Record<Permission, MembershipRole[]> = {
    "company:configure": ["OWNER", "ADMIN"],
    "subscription:manage": ["OWNER"],
    "employees:manage": ["OWNER", "ADMIN"],
};

export function can(role: MembershipRole, permission: Permission): boolean {
    return PERMISSIONS[permission].includes(role);
}
