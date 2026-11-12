import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import nextConfig from "@/next.config";
import { BrowserPdfAdapter } from "@/lib/printing/browser-pdf-adapter";
import { renderEscPos } from "@/lib/printing/escpos";
import { printerProfile, readPrintPreferences, savePrintPreferences } from "@/lib/printing/preferences";
import { receiptLayout, receiptTestLayout } from "@/lib/printing/receipt";
import { renderReceiptPdf } from "@/lib/printing/receipt-pdf";
import { PrintService } from "@/lib/printing/service";
import { PrintError, type AdapterResult, type PrinterAdapter, type PrintDocument } from "@/lib/printing/types";
import type { Sale } from "@/types/sale";

const sale = {
  id: "sale-42", companyId: "store-a", code: "V042", status: "COMPLETED", createdAt: "2026-11-02T12:00:00Z",
  customerName: "João", paymentMethod: "CASH", subtotal: 20, discount: 2, total: 18,
  items: [{ productName: "Café de São João com pão de maçã e um nome muito comprido".repeat(3), quantity: 2, unitPrice: 10, subtotal: 20 }],
} as Sale;
const receipt = { kind: "receipt", sale, company: null, mode: "standard" } satisfies PrintDocument;

class SimulatedPrinter implements PrinterAdapter {
  discover = vi.fn().mockResolvedValue(["Thermal"]);
  connect = vi.fn().mockResolvedValue(undefined);
  diagnose = vi.fn().mockResolvedValue("available");
  print = vi.fn<PrinterAdapter["print"]>().mockResolvedValue("submitted");
}

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});
afterEach(() => vi.restoreAllMocks());

describe("typed printing queue", () => {
  it("isolates preferences and rejects a receipt from a different company", async () => {
    savePrintPreferences({ transport: "qz", receiptPrinter: "Legacy", receiptWidth: 58 });
    savePrintPreferences({ transport: "qz", receiptPrinter: "Thermal" }, "store-a");
    expect(readPrintPreferences("store-b")).toMatchObject({ transport: "browser", receiptPrinter: "", receiptWidth: 58 });
    const direct = new SimulatedPrinter();
    const service = new PrintService(direct);
    await expect(service.submit(receipt, { scope: "store-b" })).rejects.toMatchObject({ code: "invalid" });
    expect(direct.print).not.toHaveBeenCalled();
  });

  it("serializes different jobs and coalesces concurrent submissions of the same receipt", async () => {
    savePrintPreferences({ transport: "qz", receiptPrinter: "Thermal", savePdf: false }, "store-a");
    const direct = new SimulatedPrinter();
    const service = new PrintService(direct);
    let complete!: (value: AdapterResult) => void;
    direct.print.mockReturnValueOnce(new Promise(resolve => { complete = resolve; }));
    const options = { scope: "store-a" };
    const first = service.submit(receipt, options);
    expect(service.submit(receipt, options)).toBe(first);
    const next = service.submit({ kind: "test", target: "receipt" }, options);
    await vi.waitFor(() => expect(direct.print).toHaveBeenCalledOnce());
    expect(service.history("store-a").map(log => log.state)).toEqual(["sending", "queued"]);
    complete("submitted");
    await expect(Promise.all([first, next])).resolves.toEqual(["submitted", "submitted"]);
    expect(direct.print).toHaveBeenCalledTimes(2);
    expect(new Set(service.history("store-a").map(log => log.id)).size).toBe(2);
    expect(service.history("store-b")).toEqual([]);
    expect(JSON.stringify(service.history("store-a"))).not.toContain("João");
  });

  it("persists an ambiguous automatic attempt and permits a later explicit reprint", async () => {
    savePrintPreferences({ transport: "qz", receiptPrinter: "Thermal", savePdf: false }, "store-a");
    const direct = new SimulatedPrinter();
    direct.print.mockRejectedValueOnce(new PrintError("unknown"));
    const automatic = { scope: "store-a", automatic: true };
    await expect(new PrintService(direct).submit(receipt, automatic)).rejects.toMatchObject({ code: "unknown" });
    const remounted = new PrintService(direct);
    await expect(remounted.submit(receipt, automatic)).resolves.toBe("skipped");
    await expect(remounted.submit(receipt, { scope: "store-a" })).resolves.toBe("submitted");
    expect(direct.print).toHaveBeenCalledTimes(2);
  });

  it("keeps a browser dialog request distinct from a spooler submission", async () => {
    const direct = new SimulatedPrinter();
    const browser = new SimulatedPrinter();
    browser.print.mockResolvedValue("dialog-opened");
    savePrintPreferences({ savePdf: false, receiptCopies: 3 }, "store-a");
    const service = new PrintService(direct, browser);
    await expect(service.submit(receipt, { scope: "store-a" })).resolves.toBe("dialog-opened");
    const [output] = browser.print.mock.calls[0];
    expect(output.format === "pdf" && output.document.pdf.getNumberOfPages()).toBe(3);
    expect(direct.print).not.toHaveBeenCalled();
  });

  it("opens the local PDF, reports the dialog request, and disposes the frame", async () => {
    const target = new EventTarget();
    const print = vi.fn();
    Object.assign(target, { print, focus: vi.fn() });
    vi.spyOn(HTMLIFrameElement.prototype, "contentWindow", "get").mockReturnValue(target as unknown as Window);
    vi.spyOn(URL, "createObjectURL").mockReturnValue("about:blank");
    const revoke = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    const profile = printerProfile(readPrintPreferences(), "receipt");
    const pending = new BrowserPdfAdapter().print({ format: "pdf", document: renderReceiptPdf(receiptTestLayout(80), profile) });
    const frame = document.querySelector("iframe")!;
    frame.dispatchEvent(new Event("load"));
    await expect(pending).resolves.toBe("dialog-opened");
    expect(print).toHaveBeenCalledOnce();
    target.dispatchEvent(new Event("afterprint"));
    expect(frame.isConnected).toBe(false);
    expect(revoke).toHaveBeenCalledOnce();
  });

  it("allows the local PDF viewer and only the secure QZ loopback destinations in CSP", async () => {
    const headers = await nextConfig.headers!();
    const csp = headers[0].headers.find(header => header.key === "Content-Security-Policy")!.value;
    const directives = csp.split("; ");
    const connect = directives.find(directive => directive.startsWith("connect-src "))!;
    expect(connect.match(/\bwss?:\/\/localhost\S*/g)).toEqual([
      "wss://localhost:8181", "wss://localhost:8282", "wss://localhost:8383", "wss://localhost:8484",
    ]);
    expect(directives.find(directive => directive.startsWith("frame-src "))).toContain("blob:");
  });
});

describe("thermal output", () => {
  const profile = printerProfile({ ...readPrintPreferences(), receiptWidth: 58 }, "receipt");

  it("wraps to the font width, preserves accents and values, and strips injected controls", () => {
    const layout = receiptLayout({ ...receipt, sale: { ...sale, notes: "Antes\u001bp\u0000\u001dV\nDepois" } });
    const bytes = Buffer.from(renderEscPos(layout, profile));
    const rows = bytes.toString("latin1").split("\n");
    expect(rows.filter(row => row.startsWith("\x1ba")).every(row => row.length <= 41)).toBe(true);
    expect(bytes.includes(Buffer.from([0x43, 0x61, 0x66, 0x82]))).toBe(true); // Café in PC850
    expect(bytes.toString("latin1")).toContain("Desconto: -R$\xff2,00");
    expect(bytes.toString("latin1")).toContain("TOTAL: R$\xff18,00");
    expect(bytes.toString("latin1")).toContain("Antes p  V Depois");
    expect(bytes.includes(Buffer.from([27, 112]))).toBe(false);
    expect(bytes.includes(Buffer.from([29, 86]))).toBe(false);
  });

  it("uses the selected code page and rejects characters outside it", () => {
    const layout = { filename: "test", lines: [{ text: "€", center: false, bold: false, size: 9 }] };
    expect(() => renderEscPos(layout, profile)).toThrow("incompatible");
    const bytes = Buffer.from(renderEscPos(layout, { ...profile, encoding: "cp858" }));
    expect(bytes.includes(Buffer.from([27, 116, 19]))).toBe(true);
    expect(bytes.includes(0xd5)).toBe(true);
  });

  it("gates QR and cutting, and repeats complete RAW copies", () => {
    const layout = receiptTestLayout(58);
    const disabled = Buffer.from(renderEscPos(layout, { ...profile, cut: true }));
    const enabled = Buffer.from(renderEscPos(layout, { ...profile, copies: 2, cut: true, capabilities: { qr: true, cut: true } }));
    const qrPrint = Buffer.from([29, 40, 107, 3, 0, 49, 81, 48]);
    expect(disabled.includes(qrPrint)).toBe(false);
    expect(disabled.includes(Buffer.from([29, 86, 0]))).toBe(false);
    expect(enabled.includes(qrPrint)).toBe(true);
    expect(enabled.toString("latin1").split("\x1dV\x00")).toHaveLength(3);
    expect(renderReceiptPdf(layout, profile, 2).pdf.getNumberOfPages()).toBe(2);
  });
});
