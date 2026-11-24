import { test, expect } from "@playwright/test";

const config = { theme: "black-friday", promotionEnabled: true, headline: "Sua loja no próximo nível. Pela metade do preço.", description: "PDV, estoque e financeiro juntos.", ctaLabel: "Quero aproveitar", discountPercent: 50, discountMonths: 3, startsAt: null, endsAt: null };

test("campaign editor publishes a persisted offer and keeps a failed draft", async ({ page }) => {
  let saved = { ...config };
  let fail = true;
  await page.route("**/api/backend/system-admin/landing", async route => {
    if (route.request().method() === "PATCH") {
      if (fail) return route.fulfill({ status: 503, json: { message: "Servidor indisponível. Tente novamente." } });
      saved = route.request().postDataJSON();
    }
    await route.fulfill({ json: saved });
  });
  await page.goto("/campaign-editor");
  await expect(page.getByLabel("Desconto (%)", { exact: true })).toHaveValue("50");
  await expect(page.getByLabel("Duração (meses)")).toHaveValue("3");
  await page.getByLabel("Título principal").fill("Black Friday para sua loja");
  await expect(page.locator(".campaign-preview h4")).toHaveText("Black Friday para sua loja");
  await page.getByRole("button", { name: "Publicar alterações" }).click();
  await expect(page.getByRole("alert")).toContainText("Servidor indisponível");
  await expect(page.getByLabel("Título principal")).toHaveValue("Black Friday para sua loja");
  fail = false;
  await page.getByRole("button", { name: "Publicar alterações" }).click();
  await expect(page.getByRole("status")).toContainText("Alterações publicadas");
  expect(saved.headline).toBe("Black Friday para sua loja");
  await page.reload();
  await expect(page.getByLabel("Título principal")).toHaveValue(saved.headline);
  await expect(page.getByRole("button", { name: "Publicar alterações" })).toBeDisabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `test-results/campaign-editor-${test.info().project.name}.png`, fullPage: true });
});

test("campaign editor validates dates, changes themes and applies the preset", async ({ page }) => {
  await page.route("**/api/backend/system-admin/landing", route => route.fulfill({ json: config }));
  await page.goto("/campaign-editor");
  await page.getByLabel("Tema da página").selectOption("standard");
  await expect(page.locator(".campaign-preview--black")).toHaveCount(0);
  await page.getByRole("button", { name: "Usar Black Friday" }).click();
  await expect(page.locator(".campaign-preview--black")).toBeVisible();
  await page.getByLabel("Início (opcional)").fill("2026-12-01");
  await page.getByLabel("Término exclusivo (opcional)").fill("2026-11-01");
  await page.getByRole("button", { name: "Publicar alterações" }).click();
  await expect(page.getByRole("alert")).toContainText("posterior ao início");
  await expect(page.getByLabel("Término exclusivo (opcional)")).toBeFocused();
  await expect(page.getByLabel("Término exclusivo (opcional)")).toHaveAttribute("aria-invalid", "true");
  await page.getByLabel("Ativar promoção").uncheck();
  await expect(page.locator(".campaign-preview__discount")).toHaveCount(0);
});

test("campaign loading failure provides explicit retry", async ({ page }) => {
  let fail = true;
  await page.route("**/api/backend/system-admin/landing", route => route.fulfill(fail ? { status: 503, json: { message: "Falha ao carregar." } } : { json: config }));
  await page.goto("/campaign-editor");
  await expect(page.getByRole("alert")).toHaveText("Falha ao carregar.");
  fail = false;
  await page.getByRole("button", { name: "Tentar novamente" }).click();
  await expect(page.getByLabel("Título principal")).toHaveValue(config.headline);
  await page.getByLabel("Título principal").focus();
  await page.keyboard.press("Tab");
  await expect(page.locator("#campaign-description")).toBeFocused();
});
