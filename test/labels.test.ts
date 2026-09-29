import { describe, expect, it } from "vitest";
import { barcodeData, barcodeFits, buildLabelDocument, labelCode, labelMarkup, validLabelSize } from "@/lib/labels";

const product = { id: "p1", name: 'Café <Especial> & "Premium"', code: "0012345678905", price: "R$ 19,90", quantity: 2 };

describe("etiquetas", () => {
  it("preserva zeros e só usa SKU numérico quando não existe código de barras", () => {
    expect(labelCode({ barcode: "0012345678905", sku: "123" })).toBe("0012345678905");
    expect(labelCode({ barcode: null, sku: "000123" })).toBe("000123");
    expect(labelCode({ barcode: "ABC", sku: "123" })).toBeNull();
    expect(labelCode({ barcode: null, sku: "SKU-123" })).toBeNull();
  });

  it("codifica CODE128 com início, pares numéricos, checksum e parada conhecidos", () => {
    // Start C (105), 12, 34, 56, checksum 44, stop (106).
    expect(barcodeData("123456")).toBe("11010011100" + "10110011100" + "10001011000" + "11100010110" + "10001101110" + "1100011101011");
    expect(() => barcodeData("<script>")).toThrow();
    expect(barcodeFits("0012345678905", 50)).toBe(true);
    expect(barcodeFits("1".repeat(32), 30)).toBe(false);
  });

  it("mantém nome e código como texto seguro, com o número abaixo do SVG", () => {
    const root = document.createElement("div");
    root.innerHTML = labelMarkup(product);
    expect(root.querySelector(".product-label-name")?.textContent).toBe(product.name);
    expect(root.querySelector("svg")?.nextElementSibling?.textContent).toBe(product.code);
    expect(root.querySelector(".product-label-price")?.textContent).toBe(product.price);
    expect(root.querySelector("especial")).toBeNull();
    expect(root.querySelectorAll("svg rect").length).toBeGreaterThan(20);
  });

  it("gera páginas em tamanho físico exato e as quantidades pedidas", () => {
    const html = buildLabelDocument([product], { width: 50, height: 40 }, "roll", "Etiquetas");
    expect(html).toContain("size:50mm 40mm;margin:0");
    const parsed = new DOMParser().parseFromString(html, "text/html");
    expect(parsed.querySelectorAll(".label-page")).toHaveLength(2);
    expect(parsed.querySelectorAll(".product-label")).toHaveLength(2);
    expect(parsed.querySelectorAll(".product-label-code")[1].textContent).toBe(product.code);
    expect(parsed.querySelector("nav")).toBeNull();
  });

  it("pagina A4 sem cortar etiquetas ou criar página extra", () => {
    // Three columns x six rows for 50 x 40 mm, 5 mm margins and 2 mm gaps.
    const html = buildLabelDocument([{ ...product, quantity: 19 }], { width: 50, height: 40 }, "a4", "Etiquetas");
    const parsed = new DOMParser().parseFromString(html, "text/html");
    const pages = parsed.querySelectorAll(".label-page");
    expect(pages).toHaveLength(2);
    expect(pages[0].children).toHaveLength(18);
    expect(pages[1].children).toHaveLength(1);
    expect(html).toContain("size:A4 portrait;margin:5mm");
  });

  it("rejeita medidas, quantidades e códigos que impedem uma impressão válida", () => {
    expect(validLabelSize({ width: NaN, height: 50 })).toBe(false);
    expect(validLabelSize({ width: 29, height: 50 })).toBe(false);
    for (const quantity of [0, -1, 1.5, 501]) {
      expect(() => buildLabelDocument([{ ...product, quantity }], { width: 50, height: 50 }, "roll", "Etiquetas")).toThrow();
    }
    expect(() => buildLabelDocument([{ ...product, code: "1".repeat(32) }], { width: 30, height: 20 }, "roll", "Etiquetas")).toThrow();
  });
});
