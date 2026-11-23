import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  const product = { id: "product-1", itemType: "PRODUCT", name: "Camiseta", sku: "CAM-001", category: "Roupas", price: 40, stock: 12, reservedStock: 0, minimumStock: 2, trackStock: true, active: true, imageUrl: null };
  let deleted = false;
  await page.route("**/api/backend/products", route => route.fulfill({ json: deleted ? [] : [product] }));
  await page.route("**/api/backend/products/product-1", route => { deleted = true; return route.fulfill({ status: 204 }); });
  await page.goto("/produtos");
});

test("exclui diretamente da lista e atualiza o catálogo", async ({ page }) => {
  await page.getByRole("button", { name: "Excluir produto Camiseta" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("O histórico será preservado");
  await dialog.getByRole("button", { name: "Excluir", exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole("heading", { name: "Nenhum produto encontrado" })).toBeVisible();
});

test("falha aparece no diálogo e permite tentar novamente", async ({ page }) => {
  await page.route("**/api/backend/products/product-1", route => route.fulfill({ status: 503, json: { message: "Falha temporária. Tente novamente." } }));
  await page.getByRole("button", { name: "Excluir produto Camiseta" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Excluir", exact: true }).click();
  await expect(dialog.getByRole("alert")).toContainText("Falha temporária");
  await page.unroute("**/api/backend/products/product-1");
  await page.route("**/api/backend/products/product-1", route => route.fulfill({ status: 204 }));
  await dialog.getByRole("button", { name: "Excluir", exact: true }).click();
  await expect(dialog).not.toBeVisible();
});

test("cards oferecem exclusão e Escape restaura o foco", async ({ page }, testInfo) => {
  await page.getByRole("button", { name: "Cards", exact: true }).click();
  const trigger = page.getByRole("button", { name: "Excluir produto Camiseta" });
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press("Tab");
    expect(await dialog.evaluate(element => element.contains(document.activeElement))).toBe(true);
  }
  expect(await dialog.evaluate(element => element.getBoundingClientRect().right <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("delete-product.png") });
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test("bloqueia exclusões repetidas durante a gravação", async ({ page }) => {
  let release!: () => void;
  const pending = new Promise<void>(resolve => { release = resolve; });
  let requests = 0;
  await page.route("**/api/backend/products/product-1", async route => { requests++; await pending; await route.fulfill({ status: 204 }); });
  await page.getByRole("button", { name: "Excluir produto Camiseta" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Excluir", exact: true }).click();
  await expect(dialog.getByRole("button", { name: "Excluindo..." })).toBeDisabled();
  await expect(dialog.getByRole("button", { name: "Cancelar" })).toBeDisabled();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeVisible();
  expect(requests).toBe(1);
  release();
  await expect(dialog).not.toBeVisible();
});
