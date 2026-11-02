import JsBarcode from "jsbarcode";

export type LabelSize = { width: number; height: number }; // millimetres
export type LabelItem = { id: string; name: string; code: string; price: string; quantity: number };
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

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);
}

export function labelMarkup(item: Pick<LabelItem, "name" | "code" | "price">) {
  const data = barcodeData(item.code);
  const bars = [...data].flatMap((bit, index) => bit === "1" ? [`<rect x="${index + 10}" y="0" width="1" height="60"/>`] : []).join("");
  return `<div class="product-label"><div class="product-label-name" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</div><div class="product-label-price">${escapeHtml(item.price)}</div><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${data.length + 20} 60" preserveAspectRatio="none" role="img" aria-label="${escapeHtml(item.code)}"><rect width="100%" height="100%" fill="white"/><g fill="black">${bars}</g></svg><div class="product-label-code">${escapeHtml(item.code)}</div></div>`;
}

export const LABEL_CSS = `
.product-label{box-sizing:border-box;width:var(--label-width);height:var(--label-height);padding:2mm;background:#fff;color:#000;display:grid;grid-template-rows:auto auto minmax(3mm,12mm) auto;align-content:start;gap:0.4mm;overflow:hidden;font-family:Arial,sans-serif;text-align:center;break-inside:avoid;}
.product-label-name{font-size:9pt;font-weight:700;line-height:1.15;overflow:hidden;overflow-wrap:anywhere;align-self:start;max-height:7mm;}
.product-label-price{font-size:10pt;font-weight:800;line-height:1.1;white-space:nowrap;}
.product-label svg{display:block;width:100%;height:100%;}
.product-label-code{font-family:Arial,sans-serif;font-size:8pt;line-height:1.1;white-space:nowrap;}
`;
