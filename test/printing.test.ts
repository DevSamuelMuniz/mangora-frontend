import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildLabelPdf } from "@/lib/printing/label-pdf";
import { buildReceiptPdf, claimAutomaticReceipt } from "@/lib/pdv/print";
import { readPrintPreferences, savePrintPreferences } from "@/lib/printing/preferences";
import { validSigningRequest } from "@/lib/printing/signing";
import { submitPrintJob } from "@/lib/printing/service";
import type { Sale } from "@/types/sale";

const qz = vi.hoisted(() => ({
  websocket: { isActive: vi.fn(() => true), connect: vi.fn() },
  security: { setCertificatePromise: vi.fn(), setSignatureAlgorithm: vi.fn(), setSignaturePromise: vi.fn() },
  api: { setSha256Type: vi.fn() }, configs: { create: vi.fn(() => ({})) }, print: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("qz-tray", () => ({ default: qz }));
const product = { id: "p1", name: "SPACE", code: "000000000005", price: "R$ 20,00", quantity: 2 };
const sale = { id: "sale-print-test", code: "V001", createdAt: "2026-11-02T12:00:00Z", customerName: "Balcão", paymentMethod: "CASH", subtotal: 20, total: 20, discount: 0, items: [{ productName: "SPACE", quantity: 1, unitPrice: 20, subtotal: 20 }] } as Sale;

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
    const short = buildReceiptPdf(sale, null, { received: 30, change: 10 }, "standard", width);
    const long = buildReceiptPdf({ ...sale, items: Array.from({ length: 80 }, () => ({ ...sale.items[0], productName: "Produto muito longo ".repeat(8) })) }, null, undefined, "bold", width);
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
    await submitPrintJob(buildLabelPdf([product], { width: 50, height: 30 }, "roll"));
    expect(qz.configs.create).toHaveBeenCalledWith("Thermal", expect.objectContaining({ units: "mm", size: { width: 50, height: 30 }, margins: 0, scaleContent: false, rasterize: false, copies: 1 }));
    expect(qz.print).toHaveBeenCalledOnce();
    expect(qz.print.mock.calls[0][1]).toEqual([expect.objectContaining({ format: "pdf", flavor: "base64", data: expect.stringMatching(/^JVBERi0/) })]);
    const payload = JSON.stringify({ call: "printers.find", timestamp: Date.now() });
    const hash = qz.api.setSha256Type.mock.calls[0][0] as (value: string) => Promise<string>;
    const sign = qz.security.setSignaturePromise.mock.calls[0][0] as (value: string) => Promise<string>;
    const fetchMock = vi.fn().mockResolvedValueOnce(new Response("public-certificate")).mockResolvedValueOnce(new Response("signed-hash"));
    vi.stubGlobal("fetch", fetchMock);
    try {
      const digest = await hash(payload);
      expect(digest).toMatch(/^[a-f0-9]{64}$/);
      expect(await sign(digest)).toBe("signed-hash");
      expect(fetchMock).toHaveBeenLastCalledWith("/api/printing/sign", expect.objectContaining({ method: "POST", body: payload }));
    } finally { vi.unstubAllGlobals(); }
  });
  it("saves the PDF and never retries a rejected spooler submission", async () => {
    savePrintPreferences({ transport: "qz", labelPrinter: "Thermal" });
    const job = buildLabelPdf([product], { width: 50, height: 30 }, "roll");
    const save = vi.spyOn(job.pdf, "save").mockReturnValue(job.pdf);
    qz.print.mockRejectedValueOnce(new Error("connection-lost"));
    await expect(submitPrintJob(job)).rejects.toThrow("connection-lost");
    expect(save).toHaveBeenCalledWith(job.filename);
    expect(qz.print).toHaveBeenCalledOnce();
  });
  it("does not submit without a selected printer", async () => {
    savePrintPreferences({ transport: "qz", savePdf: false });
    await expect(submitPrintJob(buildReceiptPdf(sale, null))).rejects.toThrow("printer-not-selected");
    expect(qz.print).not.toHaveBeenCalled();
  });
  it("claims automatic printing once per sale", () => {
    expect(claimAutomaticReceipt(sale.id)).toBe(true);
    expect(claimAutomaticReceipt(sale.id)).toBe(false);
  });
  it("only signs recent printer discovery and inline PDF requests", () => {
    const timestamp = Date.now();
    expect(validSigningRequest({ call: "printers.find", timestamp })).toBe(true);
    const payload = { call: "print", timestamp, params: { data: [{ type: "pixel", format: "pdf", flavor: "base64", data: "JVBERi0x" }] } };
    expect(validSigningRequest(payload)).toBe(true);
    expect(validSigningRequest({ ...payload, timestamp: timestamp - 120_000 })).toBe(false);
    expect(validSigningRequest({ ...payload, call: "file.write" })).toBe(false);
    expect(validSigningRequest({ ...payload, params: { data: [{ type: "raw", data: "commands" }] } })).toBe(false);
    expect(validSigningRequest({ ...payload, params: { data: [{ type: "pixel", format: "pdf", flavor: "file", data: "file:///secret" }] } })).toBe(false);
  });
});
