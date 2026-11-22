import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import nextConfig from "@/next.config";
import { BrowserPrintAdapter, buildBrowserPrintHtml } from "@/lib/printing/browser-print-adapter";
import { buildLabelPdf } from "@/lib/printing/label-pdf";
import { readPrintPreferences, savePrintPreferences } from "@/lib/printing/preferences";
import { receiptTestLayout } from "@/lib/printing/receipt";
import { renderReceiptPdf } from "@/lib/printing/receipt-pdf";
import { PrintService } from "@/lib/printing/service";
import { PrintError, type PdfOutput, type PrintDocument } from "@/lib/printing/types";
import type { Sale } from "@/types/sale";

const sale = {
  id: "sale-42", companyId: "store-a", code: "V042", status: "COMPLETED", createdAt: "2026-11-02T12:00:00Z",
  customerName: "João", paymentMethod: "CASH", subtotal: 20, discount: 2, total: 18,
  items: [{ productName: "Café de São João com pão de maçã e um nome muito comprido".repeat(3), quantity: 2, unitPrice: 10, subtotal: 20 }],
} as Sale;
const receipt = { kind: "receipt", sale, company: null, mode: "standard" } satisfies PrintDocument;

class SimulatedBrowser {
  print = vi.fn<(output: PdfOutput) => Promise<"dialog-opened">>().mockResolvedValue("dialog-opened");
}

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});
afterEach(() => vi.restoreAllMocks());

describe("typed printing queue", () => {
  it("isolates preferences and rejects a receipt from a different company", async () => {
    savePrintPreferences({ receiptWidth: 58 });
    savePrintPreferences({ receiptWidth: 80 }, "store-a");
    expect(readPrintPreferences("store-b")).toMatchObject({ receiptWidth: 58 });
    const browser = new SimulatedBrowser();
    const service = new PrintService(browser);
    await expect(service.submit(receipt, { scope: "store-b" })).rejects.toMatchObject({ code: "invalid" });
    expect(browser.print).not.toHaveBeenCalled();
  });

  it("serializes different jobs and coalesces concurrent submissions of the same receipt", async () => {
    savePrintPreferences({ receiptWidth: 80, savePdf: false }, "store-a");
    const browser = new SimulatedBrowser();
    const service = new PrintService(browser);
    let complete!: (value: "dialog-opened") => void;
    browser.print.mockReturnValueOnce(new Promise(resolve => { complete = resolve; }));
    const options = { scope: "store-a" };
    const first = service.submit(receipt, options);
    expect(service.submit(receipt, options)).toBe(first);
    const next = service.submit({ kind: "test", target: "receipt" }, options);
    await vi.waitFor(() => expect(browser.print).toHaveBeenCalledOnce());
    expect(service.history("store-a").map(log => log.state)).toEqual(["sending", "queued"]);
    complete("dialog-opened");
    await expect(Promise.all([first, next])).resolves.toEqual(["dialog-opened", "dialog-opened"]);
    expect(browser.print).toHaveBeenCalledTimes(2);
    expect(new Set(service.history("store-a").map(log => log.id)).size).toBe(2);
    expect(service.history("store-b")).toEqual([]);
    expect(JSON.stringify(service.history("store-a"))).not.toContain("João");
  });

  it("persists an ambiguous automatic attempt and permits a later explicit reprint", async () => {
    savePrintPreferences({ receiptWidth: 80, savePdf: false }, "store-a");
    const browser = new SimulatedBrowser();
    browser.print.mockRejectedValueOnce(new PrintError("browser"));
    const automatic = { scope: "store-a", automatic: true };
    await expect(new PrintService(browser).submit(receipt, automatic)).rejects.toMatchObject({ code: "browser" });
    const remounted = new PrintService(browser);
    await expect(remounted.submit(receipt, automatic)).resolves.toBe("skipped");
    await expect(remounted.submit(receipt, { scope: "store-a" })).resolves.toBe("dialog-opened");
    expect(browser.print).toHaveBeenCalledTimes(2);
  });

  it("uses the browser and keeps the requested receipt size and copies despite old printer preferences", async () => {
    const browser = new SimulatedBrowser();
    const scope = "store-a";
    localStorage.setItem("mangora.printing.v1.company.store-a", JSON.stringify({
      transport: "qz", receiptPrinter: "Thermal", printerProfile: "knup-kp1025", receiptProtocol: "escpos",
      receiptWidth: 80, savePdf: false, receiptCopies: 3,
    }));
    const service = new PrintService(browser);
    await expect(service.submit(receipt, { scope })).resolves.toBe("dialog-opened");
    const [output] = browser.print.mock.calls[0];
    expect(output.pdf.getNumberOfPages()).toBe(3);
    expect(output.pdf.internal.pageSize.getWidth()).toBeCloseTo(80);
  });

  it("prints the HTML document with the native dialog and disposes the frame", async () => {
    const target = new EventTarget();
    const print = vi.fn();
    Object.assign(target, { print });
    vi.spyOn(HTMLIFrameElement.prototype, "contentWindow", "get").mockReturnValue(target as unknown as Window);
    const pending = new BrowserPrintAdapter().print(renderReceiptPdf(receiptTestLayout(80), 80));
    const frame = document.querySelector("iframe")!;
    expect(frame.srcdoc).toContain("@page { size: auto; margin: 0; }");
    expect(frame.srcdoc).toContain("width:80mm");
    expect(frame.srcdoc).not.toContain("@page sheet-");
    expect(frame.srcdoc).toContain("TESTE DE IMPRESSÃO");
    expect(frame.srcdoc).not.toContain("<embed");
    frame.dispatchEvent(new Event("load"));
    await expect(pending).resolves.toBe("dialog-opened");
    expect(print).toHaveBeenCalledOnce();
    target.dispatchEvent(new Event("afterprint"));
    expect(frame.isConnected).toBe(false);
  });

  it("declares a default 40 × 40 mm page as well as the named page for a single continuous label", () => {
    const output = buildLabelPdf([{ id: "blouse", name: "Blusa de Tule CAOS", productCode: "600461", code: "2028813", price: "R$ 599,90", quantity: 1 }], { width: 40, height: 40 }, "continuous");
    const html = buildBrowserPrintHtml(output.pages);
    expect(html).toContain("@page { size: 40mm 40mm; margin: 0; }");
    expect(html).toContain("@page sheet-0 { size: 40mm 40mm; margin: 0; }");
    expect(html).toContain('<svg width="40mm" height="40mm"');
    expect(output.pdf.internal.pageSize.getWidth()).toBeCloseTo(40);
    expect(output.pdf.internal.pageSize.getHeight()).toBeCloseTo(40);
  });

  it("waits for fonts before opening the print dialog", async () => {
    let ready!: () => void;
    const fonts = new Promise<void>(resolve => { ready = resolve; });
    const target = new EventTarget();
    const print = vi.fn();
    Object.assign(target, { print });
    vi.spyOn(HTMLIFrameElement.prototype, "contentWindow", "get").mockReturnValue(target as unknown as Window);
    vi.spyOn(HTMLIFrameElement.prototype, "contentDocument", "get").mockReturnValue({ fonts: { ready: fonts }, body: document.body } as unknown as Document);
    const pending = new BrowserPrintAdapter().print(renderReceiptPdf(receiptTestLayout(58), 58));
    const frame = document.querySelector("iframe")!;
    frame.dispatchEvent(new Event("load"));
    expect(print).not.toHaveBeenCalled();
    ready();
    await pending;
    expect(print).toHaveBeenCalledOnce();
    target.dispatchEvent(new Event("afterprint"));
  });

  it("rejects empty or invalid paper sizes before opening a frame", async () => {
    const output = renderReceiptPdf(receiptTestLayout(58), 58);
    for (const pages of [[], [{ ...output.pages[0], width: NaN }], [{ ...output.pages[0], height: 0 }]]) {
      await expect(new BrowserPrintAdapter().print({ ...output, pages })).rejects.toMatchObject({ code: "browser" });
      expect(document.querySelector("iframe")).toBeNull();
    }
  });

  it("allows same-origin frames without granting WebSocket access to local printers", async () => {
    const headers = await nextConfig.headers!();
    const csp = headers[0].headers.find(header => header.key === "Content-Security-Policy")!.value;
    const directives = csp.split("; ");
    const connect = directives.find(directive => directive.startsWith("connect-src "))!;
    expect(connect).not.toMatch(/\bwss?:\/\/localhost\S*/);
    expect(directives.find(directive => directive.startsWith("frame-src "))).toContain("'self'");
  });
});
