import { describe, expect, it } from "vitest";
import { blackFridayPreset, switchLandingLayout } from "./marketing";

describe("landing layout library", () => {
  it("keeps independent texts and does not alter the promotion or its schedule", () => {
    const current = { ...blackFridayPreset, headline: "Minha Black Friday", discountPercent: 25, discountMonths: 2, startsAt: "2026-11-25T03:00:00Z", endsAt: "2026-12-01T03:00:00Z" };
    const standard = { theme: "standard" as const, headline: "Minha LP original", description: "Uma descrição original", ctaLabel: "Testar agora" };
    const original = switchLandingLayout(current, "standard", standard);
    expect(original).toMatchObject({ ...standard, discountPercent: 25, discountMonths: 2, startsAt: current.startsAt, endsAt: current.endsAt });
    const back = switchLandingLayout(original, "black-friday", { ...standard, theme: "black-friday" });
    expect(back.headline).toBe("Minha Black Friday");
    const again = switchLandingLayout(back, "standard", { ...standard, headline: "Outro padrão" });
    expect(again.headline).toBe(standard.headline);
    expect(switchLandingLayout(again, "standard", standard)).toBe(again);
  });
});
