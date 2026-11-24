import { test, expect } from "@playwright/test";

test("all ready-made layouts render distinct compositions on desktop and mobile", async ({ page, request }) => {
  await page.route("**/api/backend/pricing?*", route => route.fulfill({ json: { amount: 6000, formatted: "R$ 60,00", locale: "pt-BR", currency: "BRL", promotion: { percent: 50, months: 3 } } }));
  for (const layout of ["standard", "showcase", "editorial", "black-friday"]) {
    await request.get(`http://127.0.0.1:4181/test/layout/${layout}`);
    await page.goto("/");
    await expect(page.locator(`main[data-layout="${layout}"]`)).toBeVisible();
    await expect(page.locator(".campaign-banner")).toHaveCount(3);
    await expect(page.locator(".editorial-hero")).toHaveCount(layout === "editorial" ? 1 : 0);
    expect(await page.evaluate(() => {
      const sections = Array.from(document.querySelectorAll("main > section")).map(section => section.id);
      return sections.indexOf("recursos") < sections.indexOf("por-dentro");
    })).toBe(layout === "editorial");
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.evaluate(() => scrollTo(0, 0));
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: `test-results/layout-${layout}-${width}.png` });
    }
  }
});

test("Black Friday spans the actual landing page with regional prices and responsive layouts", async ({ page, request }) => {
  await page.route("**/api/backend/pricing?*", route => {
    const code = new URL(route.request().url()).searchParams.get("plan") ?? "FREE";
    const amount = ({ START: 6000, BUSINESS: 12900, PREMIUM: 24900 } as Record<string, number>)[code] ?? 0;
    return route.fulfill({ json: { planCode: code, amount, formatted: new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(amount / 100), locale: "pt-BR", currency: "BRL", promotion: amount ? { percent: 50, months: 3 } : null } });
  });
  await page.goto("/");
  await expect(page.locator(".landing-black-friday")).toBeVisible();
  await expect(page.locator(".bf-ticket__amount strong")).toHaveText("50");
  await expect(page.locator(".campaign-banner")).toHaveCount(3);
  await expect(page.locator(".campaign-price")).toHaveCount(3);
  await expect(page.locator(".campaign-price").first()).toContainText("30,00");
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(page.locator("h1")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.evaluate(() => {
      for (const image of document.images) image.loading = "eager";
      return Promise.all(Array.from(document.images).filter(img => img.getClientRects().length > 0).map(img => img.decode().catch(() => undefined)));
    });
    await page.screenshot({ path: `test-results/black-friday-${width}.png`, fullPage: true });
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("link", { name: "Ver planos com desconto" }).first().click();
  await expect(page).toHaveURL(/#planos$/);
  await request.get("http://127.0.0.1:4181/test/standard");
  await page.reload();
  await expect(page.locator(".landing-black-friday")).toHaveCount(0);
  await expect(page.locator(".hero-layout")).toBeVisible();
});
