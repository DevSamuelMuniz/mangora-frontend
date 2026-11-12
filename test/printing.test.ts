import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildLabelPdf } from "@/lib/printing/label-pdf";
import { receiptLayout } from "@/lib/printing/receipt";
import { renderReceiptPdf } from "@/lib/printing/receipt-pdf";
import { printerProfile } from "@/lib/printing/preferences";
import { readPrintPreferences, savePrintPreferences } from "@/lib/printing/preferences";
import { QzTrayAdapter } from "@/lib/printing/qz-tray-adapter";
import { PrintService, submitPrintJob } from "@/lib/printing/service";
import type { Sale } from "@/types/sale";

const qz = vi.hoisted(() => ({
  websocket: { isActive: vi.fn(() => true), connect: vi.fn() },
  security: { setCertificatePromise: vi.fn(), setSignatureAlgorithm: vi.fn(), setSignaturePromise: vi.fn() },
  printers: { find: vi.fn().mockResolvedValue(["Thermal"]) }, configs: { create: vi.fn(() => ({})) }, print: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("qz-tray", () => ({ default: qz }));
const product = { id: "p1", name: "SPACE", code: "000000000005", price: "R$ 20,00", quantity: 2 };
const sale = { id: "sale-print-test", companyId: "one", status: "COMPLETED", code: "V001", createdAt: "2026-11-02T12:00:00Z", customerName: "Balcão", paymentMethod: "CASH", subtotal: 20, total: 20, discount: 0, items: [{ productName: "SPACE", quantity: 1, unitPrice: 20, subtotal: 20 }] } as Sale;

beforeEach(() => { localStorage.clear(); vi.clearAllMocks(); qz.print.mockResolvedValue(undefined); });

describe("physical printing", () => {
  it("uses 58 mm media and a centered 48 mm label for the Knup KP-1025", () => {
    const job = buildLabelPdf([product], { width: 48, height: 30 }, "continuous", "knup-kp1025");
    expect(job.pdf.internal.pageSize.getWidth()).toBeCloseTo(58);
    expect(job.pdf.internal.pageSize.getHeight()).toBeCloseTo(60);
    expect(job.pdf.getNumberOfPages()).toBe(1);
    expect(job.parts![0].width).toBe(58);
    expect(() => buildLabelPdf([product], { width: 50, height: 30 }, "continuous", "knup-kp1025")).toThrow("knup-printable-width-exceeded");
    expect(() => buildLabelPdf([product], { width: 48, height: 30 }, "a4", "knup-kp1025")).toThrow("knup-printable-width-exceeded");
    savePrintPreferences({ printerProfile: "knup-kp1025", receiptWidth: 80 });
    expect(readPrintPreferences().receiptWidth).toBe(58);
  });
  it("keeps continuous labels together and sizes the final strip without blank feed", () => {
    const job = buildLabelPdf([product], { width: 50, height: 30 }, "continuous");
    expect(job.pdf.getNumberOfPages()).toBe(1);
    expect(job.pdf.internal.pageSize.getHeight()).toBeCloseTo(60);
    const batch = buildLabelPdf([{ ...product, quantity: 34 }], { width: 50, height: 30 }, "continuous");
    expect(batch.pdf.getNumberOfPages()).toBe(2);
    expect(batch.parts!.map(part => part.height)).toEqual([990, 30]);
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
    const profile = printerProfile({ ...readPrintPreferences(), receiptWidth: width }, "receipt");
    const short = renderReceiptPdf(receiptLayout({ kind: "receipt", sale, company: null, change: { received: 30, change: 10 }, mode: "standard" }), profile);
    const longSale = { ...sale, items: Array.from({ length: 80 }, () => ({ ...sale.items[0], productName: "Produto muito longo ".repeat(8) })) };
    const long = renderReceiptPdf(receiptLayout({ kind: "receipt", sale: longSale, company: null, mode: "bold" }), profile);
    expect(short.pdf.internal.pageSize.getWidth()).toBeCloseTo(width);
    expect(short.height).toBeLessThan(200);
    expect(long.pdf.getNumberOfPages()).toBeGreaterThan(1);
    expect(long.parts!.at(-1)!.height).toBeLessThan(long.parts![0].height);
    for (const part of long.parts!) {
      expect(part.pdf.internal.pageSize.getHeight()).toBeCloseTo(part.height);
      expect(part.height).toBeLessThanOrEqual(990);
    }
  });
  it("persists printer profiles and recovers from malformed storage", () => {
    localStorage.setItem("mangora.printing.v1", "invalid");
    expect(readPrintPreferences().labelHeight).toBe(30);
    savePrintPreferences({ transport: "qz", labelPrinter: "Labels", receiptPrinter: "Receipts" });
    savePrintPreferences({ receiptWidth: 58 });
    expect(readPrintPreferences()).toMatchObject({ transport: "qz", labelPrinter: "Labels", receiptPrinter: "Receipts", receiptWidth: 58 });
    localStorage.setItem("mangora.printing.v1", JSON.stringify({ labelWidth: -1, autoReceipt: "true", receiptWidth: 200 }));
    expect(readPrintPreferences()).toMatchObject({ labelWidth: 50, receiptWidth: 80, autoReceipt: true });
  });
  it("submits a vector PDF with zero margins, explicit paper size and no scaling", async () => {
    savePrintPreferences({ transport: "qz", labelPrinter: "Thermal", savePdf: false });
    await submitPrintJob({ kind: "label", items: [product], size: { width: 50, height: 30 }, paper: "roll" });
    expect(qz.configs.create).toHaveBeenCalledWith("Thermal", expect.objectContaining({ units: "mm", size: { width: 50, height: 30 }, margins: 0, scaleContent: false, rasterize: false, copies: 1 }));
    expect(qz.print).toHaveBeenCalledOnce();
    expect(qz.print.mock.calls[0][1]).toEqual([expect.objectContaining({ format: "pdf", flavor: "base64", data: expect.stringMatching(/^JVBERi0/) })]);
    expect(await qz.security.setCertificatePromise.mock.calls[0][0]()).toBe("");
    expect(await qz.security.setSignaturePromise.mock.calls[0][0]("untrusted request")).toBe("");
  });
  it("classifies an ambiguous rejection and never retries", async () => {
    savePrintPreferences({ transport: "qz", labelPrinter: "Thermal", savePdf: false });
    const service = new PrintService();
    qz.print.mockRejectedValueOnce(new Error("connection-lost"));
    await expect(service.submit({ kind: "label", items: [product], size: { width: 50, height: 30 }, paper: "roll" })).rejects.toMatchObject({ code: "unknown" });
    expect(qz.print).toHaveBeenCalledOnce();
    expect(service.history("")[0]).toMatchObject({ state: "unknown", reason: "unknown" });
  });
  it("stops later pages and records unknown after a partial submission", async () => {
    savePrintPreferences({ transport: "qz", labelPrinter: "Thermal", savePdf: false });
    const service = new PrintService();
    qz.print.mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error("Request blocked"));
    await expect(service.submit({ kind: "label", items: [{ ...product, quantity: 70 }], size: { width: 50, height: 30 }, paper: "continuous" })).rejects.toMatchObject({ code: "unknown" });
    expect(qz.print).toHaveBeenCalledTimes(2);
    expect(service.history("")[0].state).toBe("unknown");
  });
  it("does not submit without a selected or available printer", async () => {
    savePrintPreferences({ transport: "qz", savePdf: false });
    const receipt = { kind: "receipt", sale, company: null, mode: "standard" } as const;
    await expect(submitPrintJob(receipt)).rejects.toMatchObject({ code: "printer-missing" });
    savePrintPreferences({ receiptPrinter: "Nonexistent" });
    await expect(submitPrintJob(receipt)).rejects.toMatchObject({ code: "printer-missing" });
    expect(qz.print).not.toHaveBeenCalled();
  });
  it("sends RAW bytes over the local bridge with explicit copies and capabilities", async () => {
    qz.websocket.isActive.mockReturnValueOnce(false);
    qz.websocket.connect.mockResolvedValueOnce(undefined);
    savePrintPreferences({ transport: "qz", receiptPrinter: "Thermal", receiptProtocol: "escpos", receiptCopies: 2, receiptCutter: true, receiptCut: true, receiptQr: true });
    const result = await submitPrintJob({ kind: "test", target: "receipt" });
    expect(result).toBe("submitted");
    expect(qz.websocket.connect).toHaveBeenCalledWith({
      host: "localhost", usingSecure: true, retries: 0,
      port: { secure: [8181, 8282, 8383, 8484], insecure: [] },
    });
    expect(qz.print).toHaveBeenCalledOnce();
    expect(qz.print.mock.calls[0][1]).toEqual([{ type: "raw", format: "command", flavor: "hex", data: expect.stringMatching(/^x1bx40.*x1dx56x00x1bx40.*x1dx56x00$/) }]);
  });
  it.each([["User denied request", "cancelled"], ["out of paper", "out-of-paper"], ["unsupported format", "incompatible"]])("classifies driver response %s", async (message, code) => {
    const adapter = new QzTrayAdapter();
    const profile = printerProfile({ ...readPrintPreferences(), receiptPrinter: "Thermal" }, "receipt");
    qz.print.mockRejectedValueOnce(new Error(message));
    await expect(adapter.print({ format: "escpos", bytes: Uint8Array.of(27, 64), filename: "test" }, profile)).rejects.toMatchObject({ code });
  });
});
