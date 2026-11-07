import { expect, test } from "@playwright/test";

test("subscription links to the separate payment history", async ({ page }, testInfo) => {
  await page.goto("/assinatura");
  await expect(page.getByRole("heading", { name: "Assinatura e planos", exact: true })).toBeVisible();
  await page.getByRole("link", { name: /Cobranças e pagamentos/ }).first().click();
  await expect(page).toHaveURL(/assinatura\/cobrancas/);
  await expect(page.getByRole("heading", { name: "Histórico de cobranças" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("payments.png"), fullPage: true });
});

test("invoice dialog traps focus, supports copy and restores focus on Escape", async ({ page }, testInfo) => {
  await page.goto("/assinatura/cobrancas");
  const trigger = page.getByRole("button", { name: "Ver detalhes" });
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("textbox", { name: "Copiar código Pix" })).toHaveValue("000201PIX-TEST-CODE");
  await expect(dialog.getByRole("link", { name: "Pagar agora" })).toHaveAttribute("href", "https://example.test/payment");
  for (let i = 0; i < 9; i++) { await page.keyboard.press("Tab"); expect(await dialog.evaluate(element => element.contains(document.activeElement))).toBe(true); }
  await page.screenshot({ path: testInfo.outputPath("invoice-details.png") });
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test("provider failure is recoverable without losing the invoice", async ({ page }) => {
  await page.route("**/api/backend/subscription/invoices/invoice", route => route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ message: "Provedor indisponível" }) }));
  await page.goto("/assinatura/cobrancas");
  await page.getByRole("button", { name: "Ver detalhes" }).click();
  await expect(page.getByRole("alert")).toContainText("Provedor indisponível");
  await expect(page.getByRole("button", { name: "Tentar novamente" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Ver detalhes" })).toBeVisible();
});

test("admin cancellation requires a concrete confirmation", async ({ page }) => {
  await page.goto("/admin");
  await page.getByRole("button", { name: /Cancelar/ }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("Mercado Aurora");
  await expect(dialog).toContainText("129,00");
  await dialog.getByRole("button", { name: "Cancelar", exact: true }).click();
  await expect(dialog).not.toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
