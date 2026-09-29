import { describe, expect, it } from "vitest";

import { can, type Permission } from "./permissions";

const roles = ["OWNER", "ADMIN", "MANAGER", "CASHIER", "SELLER", "EMPLOYEE"] as const;

describe("can", () => {
    it("concede company:configure apenas a OWNER e ADMIN", () => {
        for (const role of roles) {
            const expected = role === "OWNER" || role === "ADMIN";
            expect(can(role, "company:configure"), `${role} company:configure`).toBe(expected);
        }
    });

    it("concede subscription:manage apenas a OWNER", () => {
        for (const role of roles) {
            expect(can(role, "subscription:manage"), `${role} subscription:manage`).toBe(role === "OWNER");
        }
    });

    it("concede employees:manage a OWNER e ADMIN", () => {
        expect(can("OWNER", "employees:manage")).toBe(true);
        expect(can("ADMIN", "employees:manage")).toBe(true);
        expect(can("MANAGER", "employees:manage")).toBe(false);
        expect(can("EMPLOYEE", "employees:manage")).toBe(false);
    });

    it("a matriz cobre todas as permissões definidas", () => {
        const permissions: Permission[] = ["company:configure", "subscription:manage", "employees:manage"];
        for (const permission of permissions) {
            expect(typeof can("OWNER", permission)).toBe("boolean");
        }
    });
});
