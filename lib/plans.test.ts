import { describe, expect, it } from "vitest";

import { marketingPlans, subscriptionPlans } from "./plans";

describe("subscriptionPlans (catálogo canônico)", () => {
    it("define os 5 planos, com Free gratuito e Enterprise sob consulta", () => {
        expect(subscriptionPlans.map((plan) => plan.id)).toEqual(["free", "start", "business", "premium", "enterprise"]);
        expect(subscriptionPlans.find((plan) => plan.id === "free")?.price).toBe(0);
        expect(subscriptionPlans.find((plan) => plan.id === "enterprise")?.price).toBeNull();
        for (const plan of subscriptionPlans.filter((p) => p.id !== "enterprise" && p.id !== "free")) {
            expect(plan.price).toBeGreaterThan(0);
            expect(plan.features.length).toBeGreaterThan(0);
        }
    });

    it("marca apenas Business como destacado", () => {
        expect(subscriptionPlans.filter((plan) => plan.highlighted).map((plan) => plan.id)).toEqual(["business"]);
    });

    it("mantém página online a partir do Start e os novos limites comerciais", () => {
        const free = subscriptionPlans.find((plan) => plan.id === "free");
        const start = subscriptionPlans.find((plan) => plan.id === "start");
        const business = subscriptionPlans.find((plan) => plan.id === "business");
        expect(free?.features).not.toContain("Página online");
        expect(start?.features).toContain("Página online");
        expect(business?.features).toContain("Até 3 lojas");
    });
});

describe("marketingPlans (visão derivada da landing)", () => {
    it("deriva os 4 planos públicos do catálogo canônico (sem Enterprise)", () => {
        expect(marketingPlans.map((plan) => plan.name)).toEqual(["Free", "Start", "Business", "Premium"]);
    });

    it("preserva preço de exibição e destaque a partir da fonte única", () => {
        expect(marketingPlans.find((plan) => plan.name === "Start")?.price).toBe("60");
        expect(marketingPlans.find((plan) => plan.name === "Free")?.price).toBe("0");
        expect(marketingPlans.find((plan) => plan.name === "Business")?.featured).toBe(true);
    });
});
