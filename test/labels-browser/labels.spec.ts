import { expect, test } from "@playwright/test";

test("previews the print drawing, preserves selection and downloads a PDF", async ({ page }, testInfo) => {
  await page.goto("/");
  await page.getByRole("checkbox", { name: "Selecionar Café especial da fazenda 500 g" }).check();
  const preview = page.getByRole("img", { name: /Café especial.*CAFE-001; 0012345678905/ });
  await expect(preview).toBeVisible();
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollbarColor)).not.toBe("auto");
  await expect(preview.locator("text")).toContainText([/Café especial da fazenda/, "CAFE-001", /R\$\s19,90/, "0012345678905"]);
  await page.getByPlaceholder("Buscar por nome, SKU ou código de barras").fill("ausente");
  await expect(page.getByText("Nenhum produto encontrado.")).toBeVisible();
  await page.getByRole("button", { name: "Limpar busca" }).click();
  await expect(page.getByRole("checkbox", { name: /Selecionar Café/ })).toBeChecked();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("labels.png"), fullPage: true });
  await page.getByRole("button", { name: "Imprimir 1 etiquetas" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole("button", { name: "Imprimir 1 etiquetas" })).toBeFocused();
  await page.getByLabel("Tamanho (largura × altura)").selectOption("100x50");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole("button", { name: "Imprimir 1 etiquetas" }).click();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Baixar PDF", exact: true }).click();
  expect((await download).suggestedFilename()).toMatch(/^etiquetas-.*\.pdf$/);
  await expect(dialog).not.toBeVisible();
});

test("small labels print isolated vectors", async ({ page }, testInfo) => {
  await page.goto("/");
  await page.getByRole("checkbox", { name: "Selecionar Chá de camomila" }).check();
  const size = page.getByLabel("Tamanho (largura × altura)");
  await size.focus();
  await page.keyboard.press("Space");
  await page.keyboard.press("Escape");
  await size.selectOption("30x20");
  await page.getByRole("button", { name: "Imprimir 1 etiquetas" }).click();
  await page.evaluate(() => {
    Object.defineProperty(HTMLIFrameElement.prototype, "contentWindow", { configurable: true,
      get() { return { addEventListener() {}, print() {} }; } });
  });
  await page.getByRole("button", { name: "Abrir impressão", exact: true }).click();
  const frame = page.locator("iframe");
  await expect(frame).toHaveCount(1);
  const source = await frame.getAttribute("srcdoc");
  expect(source).toContain("30mm 20mm");
  expect(source).toContain("CHA-002");
  expect(source).toContain("001234");
  expect(source).toMatch(/R\$\s9,50/);
  expect(source).not.toContain("Preferências de impressão");
  const printPage = await page.context().newPage();
  await printPage.setContent(source!);
  await printPage.emulateMedia({ media: "print" });
  await printPage.locator("svg").screenshot({ path: testInfo.outputPath("printed-label.png") });
  await printPage.pdf({ path: testInfo.outputPath("printed-label.pdf"), preferCSSPageSize: true });
  const bounds = await printPage.locator("svg").evaluate(svg => [...svg.querySelectorAll("text")].map(text => {
    const { x, y, width, height } = text.getBBox();
    return { x, y, width, height };
  }));
  for (const box of bounds) {
    expect(box.x).toBeGreaterThan(0);
    expect(box.y).toBeGreaterThan(0);
    expect(box.x + box.width).toBeLessThan(30);
    expect(box.y + box.height).toBeLessThan(20);
  }
  await printPage.close();
});

test("reserves the empty preview while products load", async ({ page }) => {
  let finish!: () => void;
  const gate = new Promise<void>(resolve => { finish = resolve; });
  await page.route("**/api/backend/products", async route => {
    await gate;
    await route.fulfill({ json: [] });
  });
  await page.goto("/");
  await expect(page.getByText("Carregando produtos…")).toBeVisible();
  await expect(page.getByText("Selecione um produto para visualizar sua etiqueta.")).toBeVisible();
  finish();
  await expect(page.getByText("Nenhum produto encontrado.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Imprimir 0 etiquetas" })).toBeDisabled();
});

test("product failure and loading recover without losing the workspace", async ({ page }) => {
  await page.route("**/api/backend/products", route => route.fulfill({ status: 503, json: { message: "Indisponível" } }));
  await page.goto("/");
  await expect(page.getByRole("alert")).toContainText("Não foi possível carregar os produtos.");
  await page.unroute("**/api/backend/products");
  await page.getByRole("button", { name: "Tentar novamente" }).click();
  await expect(page.getByRole("checkbox", { name: /Selecionar Café/ })).toBeVisible();
  await page.getByRole("checkbox", { name: /Selecionar Café/ }).check();
  await page.getByLabel("Tamanho (largura × altura)").selectOption("30x20");
  await expect(page.getByRole("alert")).toContainText("longo demais");
  await expect(page.getByRole("button", { name: "Imprimir 1 etiquetas" })).toBeDisabled();
});
