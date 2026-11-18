import JsBarcode from "jsbarcode";

export type LabelSize = { width: number; height: number }; // millimetres
export type LabelItem = { id: string; name: string; productCode?: string; code: string; price: string; quantity: number };
export type LabelPaper = "continuous" | "roll" | "a4";
export const MAX_LABELS = 500;
export const LABEL_SIZES = [
  { width: 48, height: 30 },
  { width: 50, height: 50 }, { width: 50, height: 40 },
  { width: 50, height: 30 }, { width: 40, height: 30 },
  { width: 30, height: 20 }, { width: 60, height: 40 },
  { width: 100, height: 50 }, { width: 50, height: 100 },
] satisfies LabelSize[];

/** Keep leading zeroes. Never invent a different product identifier. */
export function labelCode(product: { barcode: string | null; sku: string }) {
  const value = (product.barcode || product.sku).trim();
  return /^\d{1,32}$/.test(value) ? value : null;
}

export function validLabelSize(size: LabelSize) {
  return Number.isFinite(size.width) && Number.isFinite(size.height)
    && size.width >= 30 && size.width <= 200 && size.height >= 20 && size.height <= 200;
}

export function barcodeData(code: string) {
  if (!/^\d{1,32}$/.test(code)) throw new Error("Invalid numeric barcode");
  const result: { encodings?: { data: string }[] } = {};
  JsBarcode(result, code, { format: "CODE128", displayValue: false });
  return result.encodings!.map((encoding) => encoding.data).join("");
}

export function barcodeFits(code: string, width: number) {
  // 10 modules of quiet zone on both sides; minimum module width of 0.25 mm.
  return (barcodeData(code).length + 20) * 0.25 <= width - 4;
}
