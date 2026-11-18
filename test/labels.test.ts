import { describe, expect, it } from "vitest";
import { barcodeData, barcodeFits, labelCode } from "@/lib/labels";


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

});
