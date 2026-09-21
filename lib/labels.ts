import JsBarcode from "jsbarcode";

export type LabelSize = { width: number; height: number }; // millimetres
export type LabelItem = { id: string; name: string; code: string; quantity: number };
export type LabelPaper = "roll" | "a4";
export const MAX_LABELS = 500;
export const LABEL_SIZES = [
  { width: 50, height: 50 }, { width: 50, height: 40 },
  { width: 50, height: 30 }, { width: 40, height: 30 },
  { width: 30, height: 20 }, { width: 60, height: 40 },
  { width: 100, height: 50 },
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

export function labelMarkup(item: Pick<LabelItem, "name" | "code">) {
  const data = barcodeData(item.code);
  const bars = [...data].flatMap((bit, index) => bit === "1" ? [`<rect x="${index + 10}" y="0" width="1" height="60"/>`] : []).join("");
  return `<div class="product-label"><div class="product-label-name" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</div><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${data.length + 20} 60" preserveAspectRatio="none" role="img" aria-label="${escapeHtml(item.code)}"><rect width="100%" height="100%" fill="white"/><g fill="black">${bars}</g></svg><div class="product-label-code">${escapeHtml(item.code)}</div></div>`;
}

export const LABEL_CSS = `
.product-label{box-sizing:border-box;width:var(--label-width);height:var(--label-height);padding:2mm;background:#fff;color:#000;display:grid;grid-template-rows:minmax(0,1fr) 45% auto;gap:1mm;overflow:hidden;font-family:Arial,sans-serif;text-align:center;break-inside:avoid;}
.product-label-name{font-size:9pt;font-weight:700;line-height:1.15;overflow:hidden;overflow-wrap:anywhere;align-self:center;max-height:100%;}
.product-label svg{display:block;width:100%;height:100%;}
.product-label-code{font-family:Arial,sans-serif;font-size:8pt;line-height:1.1;white-space:nowrap;}
`;

export function buildLabelDocument(items: LabelItem[], size: LabelSize, paper: LabelPaper, title: string) {
  const total = items.reduce((sum, item) => sum + item.quantity, 0);
  if (!validLabelSize(size) || !items.length || total > MAX_LABELS || items.some((item) => !Number.isInteger(item.quantity) || item.quantity < 1 || !barcodeFits(item.code, size.width))) {
    throw new Error("Invalid label print job");
  }
  const columns = paper === "a4" ? Math.floor(202 / (size.width + 2)) : 1;
  const rows = paper === "a4" ? Math.floor(289 / (size.height + 2)) : 1;
  const perPage = columns * rows;
  const labels = items.flatMap((item) => Array.from({ length: item.quantity }, () => labelMarkup(item)));
  const pages: string[] = [];
  for (let index = 0; index < labels.length; index += perPage) {
    pages.push(`<section class="label-page">${labels.slice(index, index + perPage).join("")}</section>`);
  }
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>
@page{size:${paper === "a4" ? "A4 portrait" : `${size.width}mm ${size.height}mm`};margin:${paper === "a4" ? "5mm" : "0"};}
html,body{margin:0;padding:0;}body{--label-width:${size.width}mm;--label-height:${size.height}mm;}
${LABEL_CSS}
.label-page{display:grid;grid-template-columns:repeat(${columns},${size.width}mm);gap:${paper === "a4" ? "2mm" : "0"};break-after:page;}
.label-page:last-child{break-after:auto;}
</style></head><body>${pages.join("")}</body></html>`;
}

/** Isolated print document so the dashboard and navigation never enter the job. */
export function printLabels(html: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const frame = document.createElement("iframe");
    frame.title = "Print";
    frame.style.cssText = "position:fixed;left:-10000px;top:0;width:1px;height:1px;border:0";
    const cleanup = () => frame.remove();
    frame.onload = async () => {
      try {
        const target = frame.contentWindow;
        if (!target) throw new Error("Print window unavailable");
        await target.document.fonts?.ready;
        target.addEventListener("afterprint", cleanup, { once: true });
        target.focus();
        target.print();
        // Fallback for browsers that do not dispatch afterprint.
        window.setTimeout(cleanup, 300_000);
        resolve();
      } catch (error) {
        cleanup();
        reject(error);
      }
    };
    frame.srcdoc = html;
    document.body.appendChild(frame);
  });
}
