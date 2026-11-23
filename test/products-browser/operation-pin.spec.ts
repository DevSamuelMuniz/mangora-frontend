import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/api/backend/auth/operation-pin", route => route.fulfill({ json: { configured: true, canManage: true, updatedAt: new Date().toISOString() } }));
  await page.route("**/api/backend/auth/operation-pin/email/send", route => route.fulfill({ json: { sent: true, email: "ow***@example.com", resendAfterSeconds: 60 } }));
  await page.route("**/api/backend/auth/operation-pin/email/verify", route => {
    const code = route.request().postDataJSON().emailCode;
    return code === "123456" ? route.fulfill({ json: { verificationToken: "a".repeat(64) } }) : route.fulfill({ status: 400, json: { message: "Código inválido ou expirado." } });
  });
});

test("cria ou altera senha somente após confirmar código do e-mail", async ({ page }, testInfo) => {
  await page.goto("/configuracoes");
  const trigger = page.getByRole("button", { name: "Alterar senha de operação" });
  await trigger.click();
  await page.getByRole("button", { name: "Enviar código por e-mail" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("ow***@example.com");
  await expect(dialog.getByLabel("Nova senha de 6 números")).toHaveCount(0);
  await dialog.getByLabel("Código de 6 dígitos do e-mail").fill("000000");
  await dialog.getByRole("button", { name: "Confirmar código" }).click();
  await expect(dialog.getByRole("alert")).toContainText("inválido");
  await dialog.getByLabel("Código de 6 dígitos do e-mail").fill("123456");
  await dialog.getByRole("button", { name: "Confirmar código" }).click();
  const password = dialog.getByLabel("Nova senha de 6 números", { exact: true });
  await expect(password).toHaveAttribute("type", "password");
  await password.fill("012345");
  await dialog.getByLabel("Confirme a nova senha").fill("111111");
  await dialog.getByRole("button", { name: "Salvar senha" }).click();
  await expect(dialog.getByRole("alert")).toContainText("não coincidem");
  await dialog.getByLabel("Confirme a nova senha").fill("012345");
  await page.screenshot({ path: testInfo.outputPath("configure-operation-pin.png") });
  const saved = page.waitForRequest(request => request.method() === "PUT" && request.url().endsWith("/auth/operation-pin"));
  await dialog.getByRole("button", { name: "Salvar senha" }).click();
  expect((await saved).postDataJSON()).toEqual({ verificationToken: "a".repeat(64), password: "012345" });
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole("status")).toContainText("Senha de operação salva");
  await trigger.click();
  await expect(page.getByRole("dialog")).toContainText("Enviaremos um código");
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
});

test("recupera falha de envio e esconde a configuração para membros", async ({ page }) => {
  await page.route("**/api/backend/auth/operation-pin/email/send", route => route.fulfill({ status: 503, json: { message: "Não foi possível enviar o código." } }));
  await page.goto("/configuracoes");
  await page.getByRole("button", { name: "Alterar senha de operação" }).click();
  await page.getByRole("button", { name: "Enviar código por e-mail" }).click();
  await expect(page.getByRole("dialog").getByRole("alert")).toContainText("enviar o código");
  await page.keyboard.press("Escape");
  await page.route("**/api/backend/auth/operation-pin", route => route.fulfill({ json: { configured: true, canManage: false } }));
  await page.reload();
  await expect(page.getByText("Somente o proprietário pode criar ou alterar esta senha", { exact: false })).toBeVisible();
  await expect(page.getByRole("button", { name: "Alterar senha de operação" })).toHaveCount(0);
});

test("exige PIN de seis números ao excluir, permite nova tentativa e mantém foco no modal", async ({ page }, testInfo) => {
  await page.route("**/api/backend/products", route => route.fulfill({ json: [{ id: "product-1", itemType: "PRODUCT", name: "Camiseta", sku: "CAM-001", category: "Roupas", price: 40, stock: 12, reservedStock: 0, minimumStock: 2, trackStock: true, active: true }] }));
  let authorized = 0;
  await page.route("**/api/backend/products/product-1", route => {
    const pin = route.request().headers()["x-operation-password"];
    if (pin === "012345") { authorized++; return route.fulfill({ status: 204 }); }
    return route.fulfill({ status: 428, json: { code: "OPERATION_PASSWORD_REQUIRED", credentialType: "pin", message: pin ? "Senha de operação incorreta." : "Informe a senha de operação." } });
  });
  await page.goto("/produtos");
  await page.getByRole("button", { name: "Excluir produto Camiseta" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Excluir", exact: true }).click();
  const prompt = page.getByRole("dialog", { name: "Autorizar alteração" });
  await expect(prompt).toBeVisible();
  const pin = prompt.getByLabel("Senha de operação (6 números)");
  await pin.fill("12345");
  await expect(prompt.getByRole("button", { name: "Autorizar", exact: true })).toBeDisabled();
  await pin.fill("111111");
  await prompt.getByRole("button", { name: "Autorizar", exact: true }).click();
  await expect(prompt.getByRole("alert")).toContainText("incorreta");
  await pin.fill("012345");
  for (let i = 0; i < 6; i++) { await page.keyboard.press("Tab"); expect(await prompt.evaluate(element => element.contains(document.activeElement))).toBe(true); }
  await page.screenshot({ path: testInfo.outputPath("authorize-operation-pin.png") });
  await prompt.getByRole("button", { name: "Autorizar", exact: true }).click();
  await expect(prompt).not.toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(authorized).toBe(1);
});

test("cancelar a senha não envia a exclusão autorizada", async ({ page }) => {
  await page.route("**/api/backend/products", route => route.fulfill({ json: [{ id: "product-1", itemType: "PRODUCT", name: "Camiseta", sku: "CAM-001", category: "Roupas", price: 40, stock: 12, reservedStock: 0, minimumStock: 2, trackStock: true, active: true }] }));
  let requests = 0;
  await page.route("**/api/backend/products/product-1", route => { requests++; return route.fulfill({ status: 428, json: { code: "OPERATION_PASSWORD_REQUIRED", credentialType: "pin", message: "Informe a senha de operação." } }); });
  await page.goto("/produtos");
  await page.getByRole("button", { name: "Excluir produto Camiseta" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Excluir", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Autorizar alteração" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Excluir produto?" }).getByRole("alert")).toContainText("cancelada");
  expect(requests).toBe(1);
});
