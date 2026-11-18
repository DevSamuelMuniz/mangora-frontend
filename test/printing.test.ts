import { beforeEach, describe, expect, it } from "vitest";
import { LABEL_SIZES } from "@/lib/labels";
import { buildLabelPdf } from "@/lib/printing/label-pdf";
import { receiptLayout } from "@/lib/printing/receipt";
import { renderReceiptPdf } from "@/lib/printing/receipt-pdf";
import { readPrintPreferences, savePrintPreferences } from "@/lib/printing/preferences";
import type { Sale } from "@/types/sale";

const product = { id: "p1", name: "SPACE", code: "000000000005", price: "R$ 20,00", quantity: 2 };
const sale = { id: "sale-print-test", companyId: "one", status: "COMPLETED", code: "V001", createdAt: "2026-11-02T12:00:00Z", customerName: "Balcão", paymentMethod: "CASH", subtotal: 20, total: 20, discount: 0, items: [{ productName: "SPACE", quantity: 1, unitPrice: 20, subtotal: 20 }] } as Sale;

beforeEach(() => { localStorage.clear(); });

describe("physical printing", () => {
  it.each(LABEL_SIZES)("keeps all four fields inside %j with long names and distinct SKU", size => {
    const job = buildLabelPdf([{ ...product, name: 'Café <Especial> & Premium '.repeat(8), productCode: "CAFE-001", code: "001234", quantity: 1 }], size, "roll");
    const root = new DOMParser().parseFromString(job.pages[0].svg, "image/svg+xml");
    const texts = [...root.querySelectorAll("text")];
    expect(texts.map(text => text.textContent)).toEqual(expect.arrayContaining(["CAFE-001", "001234", product.price]));
    expect(root.querySelector("Especial")).toBeNull();
    for (const element of root.querySelectorAll("rect, text")) {
      const y = Number(element.getAttribute("y"));
      expect(y).toBeGreaterThan(0);
      expect(y + Number(element.getAttribute("height") ?? 0)).toBeLessThan(size.height);
    }
    const bars = [...root.querySelectorAll("rect")];
    const nameTexts = texts.slice(0, size.height < 30 ? 1 : 2);
    expect(Number(texts[nameTexts.length].getAttribute("y"))).toBeLessThan(Number(bars[0].getAttribute("y")));
    expect(Number(bars[0].getAttribute("height"))).toBeGreaterThanOrEqual(3);
  });
  it("keeps continuous labels together and sizes the final strip without blank feed", () => {
    const job = buildLabelPdf([product], { width: 50, height: 30 }, "continuous");
    expect(job.pdf.getNumberOfPages()).toBe(1);
    expect(job.pdf.internal.pageSize.getHeight()).toBeCloseTo(60);
    const batch = buildLabelPdf([{ ...product, quantity: 34 }], { width: 50, height: 30 }, "continuous");
    expect(batch.pdf.getNumberOfPages()).toBe(2);
    for (const [index, height] of [990, 30].entries()) {
      batch.pdf.setPage(index + 1);
      expect(batch.pdf.internal.pageSize.getHeight()).toBeCloseTo(height);
    }
  });
  it.each([{ width: 50, height: 30 }, { width: 100, height: 50 }, { width: 30, height: 20 }])("preserves PDF dimensions and produces exactly one roll page per copy: %j", size => {
    const job = buildLabelPdf([{ ...product, code: "123456" }], size, "roll");
    expect(job.pdf.getNumberOfPages()).toBe(2);
    for (let page = 1; page <= 2; page++) {
      job.pdf.setPage(page);
      expect(job.pdf.internal.pageSize.getWidth()).toBeCloseTo(size.width);
      expect(job.pdf.internal.pageSize.getHeight()).toBeCloseTo(size.height);
    }
  });
  it("paginates A4 and rejects impossible sizes before drawing", () => {
    expect(buildLabelPdf([{ ...product, quantity: 19 }], { width: 50, height: 40 }, "a4").pdf.getNumberOfPages()).toBe(2);
    expect(() => buildLabelPdf([product], { width: 200, height: 200 }, "a4")).not.toThrow();
    for (const quantity of [NaN, 0, -1, 1.5, 501]) expect(() => buildLabelPdf([{ ...product, quantity }], { width: 50, height: 30 }, "roll")).toThrow();
    expect(() => buildLabelPdf([{ ...product, code: "1".repeat(32) }], { width: 30, height: 20 }, "roll")).toThrow();
  });
  it.each([58, 80] as const)("sizes a %d mm receipt to its content and wraps long names", width => {
    const short = renderReceiptPdf(receiptLayout({ kind: "receipt", sale, company: null, change: { received: 30, change: 10 }, mode: "standard" }), width);
    const longSale = { ...sale, items: Array.from({ length: 80 }, () => ({ ...sale.items[0], productName: "Produto muito longo ".repeat(8) })) };
    const long = renderReceiptPdf(receiptLayout({ kind: "receipt", sale: longSale, company: null, mode: "bold" }), width);
    expect(short.pdf.internal.pageSize.getWidth()).toBeCloseTo(width);
    expect(short.height).toBeLessThan(200);
    expect(long.pdf.getNumberOfPages()).toBeGreaterThan(1);
    const lastPage = long.pdf.getNumberOfPages();
    long.pdf.setPage(1);
    const firstHeight = long.pdf.internal.pageSize.getHeight();
    for (let page = 1; page <= lastPage; page++) {
      long.pdf.setPage(page);
      expect(long.pdf.internal.pageSize.getHeight()).toBeLessThanOrEqual(990.001);
    }
    expect(long.pdf.internal.pageSize.getHeight()).toBeLessThan(firstHeight);
  });
  it("keeps document preferences and ignores obsolete device fields", () => {
    const key = "mangora.printing.v1";
    localStorage.setItem(key, "invalid");
    expect(readPrintPreferences().labelHeight).toBe(30);
    localStorage.setItem(key, JSON.stringify({
      printerProfile: "knup-kp1025", transport: "qz", labelPrinter: "Labels", receiptPrinter: "Receipts",
      receiptWidth: 80, labelPaper: "a4", labelWidth: 100, autoReceipt: false,
    }));
    expect(readPrintPreferences()).toMatchObject({ receiptWidth: 80, labelPaper: "a4", labelWidth: 100, autoReceipt: false });
    expect(readPrintPreferences()).not.toHaveProperty("receiptPrinter");
    savePrintPreferences({ receiptWidth: 58 });
    expect(JSON.parse(localStorage.getItem(key)!)).not.toHaveProperty("transport");
    expect(readPrintPreferences().receiptWidth).toBe(58);
    localStorage.setItem(key, JSON.stringify({ labelWidth: -1, autoReceipt: "true", receiptWidth: 200 }));
    expect(readPrintPreferences()).toMatchObject({ labelWidth: 50, receiptWidth: 80, autoReceipt: true });
  });
});
