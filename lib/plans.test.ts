import { describe, expect, it } from "vitest";

import { marketingPlans, subscriptionPlans } from "./plans";

describe("subscriptionPlans (catálogo canônico)", () => {
    it("define os 4 planos com preço numérico (Enterprise sob consulta)", () => {
        expect(subscriptionPlans.map((plan) => plan.id)).toEqual(["start", "business", "premium", "enterprise"]);
        expect(subscriptionPlans.find((plan) => plan.id === "enterprise")?.price).toBeNull();
        for (const plan of subscriptionPlans.filter((p) => p.id !== "enterprise")) {
            expect(plan.price).toBeGreaterThan(0);
            expect(plan.features.length).toBeGreaterThan(0);
        }
    });

    it("marca apenas Business como destacado", () => {
        expect(subscriptionPlans.filter((plan) => plan.highlighted).map((plan) => plan.id)).toEqual(["business"]);
    });
});

describe("marketingPlans (visão derivada da landing)", () => {
    it("deriva os 3 planos públicos do catálogo canônico (sem Enterprise)", () => {
        expect(marketingPlans.map((plan) => plan.name)).toEqual(["Start", "Business", "Premium"]);
    });

    it("preserva preço de exibição e destaque a partir da fonte única", () => {
        expect(marketingPlans.find((plan) => plan.name === "Start")?.price).toBe("60");
        expect(marketingPlans.find((plan) => plan.name === "Business")?.featured).toBe(true);
    });
});
