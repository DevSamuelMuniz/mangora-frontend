import { describe, expect, it } from "vitest";
import { barcodeData, barcodeFits, labelCode, labelMarkup } from "@/lib/labels";

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

});
