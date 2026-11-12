import { BrowserPdfAdapter } from "./browser-pdf-adapter";
import { renderEscPos } from "./escpos";
import { buildLabelPdf } from "./label-pdf";
import { printerProfile, readPrintPreferences, type PrintPreferences } from "./preferences";
import { QzTrayAdapter } from "./qz-tray-adapter";
import { receiptLayout, receiptTestLayout } from "./receipt";
import { renderReceiptPdf } from "./receipt-pdf";
import { PrintError, type PrinterAdapter, type PrinterProfile, type PrintDocument, type PrintLog, type PrintResult, type PrintState } from "./types";

export type PrintOptions = { scope?: string; automatic?: boolean; pdfOnly?: boolean };

const ATTEMPT_LIMIT = 256;
const ATTEMPT_WINDOW = 7 * 24 * 60 * 60 * 1000;

function renderDocument(document: PrintDocument, preferences: PrintPreferences, profile: PrinterProfile) {
  if (document.kind === "label") {
    return { pdf: buildLabelPdf(document.items, document.size, document.paper, profile.model) };
  }
  if (document.kind === "test" && document.target === "label") {
    const pdf = buildLabelPdf(
      [{ id: "test", name: "TESTE • Café", code: "00123456", price: "R$ 12,00", quantity: 1 }],
      { width: preferences.labelWidth, height: preferences.labelHeight }, preferences.labelPaper, profile.model,
    );
    return { pdf: { ...pdf, filename: "teste-de-etiqueta.pdf" } };
  }
  const layout = document.kind === "receipt" ? receiptLayout(document) : receiptTestLayout(profile.width);
  return {
    pdf: profile.transport !== "escpos" || preferences.savePdf
      ? renderReceiptPdf(layout, profile, profile.transport === "browser" ? profile.copies : 1)
      : undefined,
    layout,
  };
}

export class PrintService {
  private tail: Promise<unknown> = Promise.resolve();
  private pending = new Map<string, Promise<PrintResult>>();
  private attempts = new Map<string, number>();
  private logs: { scope: string; entry: PrintLog }[] = [];

  constructor(
    private readonly direct: PrinterAdapter = new QzTrayAdapter(),
    private readonly browser: PrinterAdapter = new BrowserPdfAdapter(),
  ) {}

  discover() {
    return this.direct.discover();
  }

  history(scope: string): PrintLog[] {
    return this.logs.filter(log => log.scope === scope).map(log => ({ ...log.entry }));
  }

  submit(document: PrintDocument, { scope = "", automatic = false, pdfOnly = false }: PrintOptions = {}): Promise<PrintResult> {
    const preferences = readPrintPreferences(scope);
    if (document.kind === "receipt") {
      const { sale, company } = document;
      if (sale.status !== "COMPLETED" || (scope && (sale.companyId !== scope || (company && company.id !== scope)))) {
        return Promise.reject(new PrintError("invalid"));
      }
    }
    const documentKey = document.kind === "receipt" ? document.sale.id
      : document.kind === "test" ? document.target
        : [document.paper, document.size, document.items.map(({ id, quantity }) => [id, quantity])];
    const key = JSON.stringify([scope, document.kind, documentKey, pdfOnly]);
    const pending = this.pending.get(key);
    if (pending) return pending;
    const target = document.kind === "test" ? document.target : document.kind;
    const profile = printerProfile(preferences, target, pdfOnly ? "browser" : undefined);
    const id = crypto.randomUUID?.() ?? Array.from(crypto.getRandomValues(new Uint32Array(4)), part => part.toString(16)).join("-");
    const entry: PrintLog = { id, kind: document.kind, transport: profile.transport, state: "queued", updatedAt: Date.now() };
    const log = (state: PrintState, reason?: PrintError["code"]) => {
      Object.assign(entry, { state, updatedAt: Date.now(), reason });
    };
    this.logs.push({ scope, entry });
    if (this.logs.length > 100) this.logs.shift();

    const run = this.tail.then(async (): Promise<PrintResult> => {
      try {
        if (automatic && document.kind === "receipt" &&
          (!preferences.autoReceipt || !await this.claimAutomatic(scope, document.sale.id))) {
          log("skipped");
          return "skipped";
        }
        log("preparing");
        const prepared = renderDocument(document, preferences, profile);
        if (prepared.pdf && (pdfOnly || (document.kind !== "test" && preferences.savePdf))) {
          prepared.pdf.pdf.save(prepared.pdf.filename);
        }
        if (pdfOnly) {
          log("download-requested");
          return "download-requested";
        }

        const adapter = profile.transport === "browser" ? this.browser : this.direct;
        const output = profile.transport === "escpos" && prepared.layout
          ? { format: "escpos" as const, bytes: renderEscPos(prepared.layout, profile), filename: prepared.layout.filename.replace(/\.pdf$/, "") }
          : prepared.pdf && { format: "pdf" as const, document: prepared.pdf };
        if (!output) throw new PrintError("incompatible");
        await adapter.diagnose(profile);
        log("sending");
        const result = await adapter.print(output, profile);
        log(result);
        return result;
      } catch (cause) {
        const error = cause instanceof PrintError ? cause : new PrintError(entry.state === "sending" ? "unknown" : "invalid", { cause });
        log(error.code === "unknown" ? "unknown" : error.code === "cancelled" ? "cancelled" : "failed", error.code);
        throw error;
      }
    });
    const settled = run.finally(() => { this.pending.delete(key); });
    this.pending.set(key, settled);
    this.tail = settled.catch(() => undefined);
    return settled;
  }

  private claimAutomatic(scope: string, saleId: string) {
    const storageKey = `mangora.printing.attempts.${encodeURIComponent(scope)}`;
    const memoryKey = JSON.stringify([scope, saleId]);
    const claim = () => {
      const now = Date.now();
      if ((this.attempts.get(memoryKey) ?? 0) > now - ATTEMPT_WINDOW) return false;
      try {
        // Respect claims made by the previous implementation in this tab.
        if (sessionStorage.getItem(`mangora.print-attempt.${saleId}`)) return false;
      } catch { /* Session storage can be unavailable in private browsing. */ }
      try {
        const stored: [string, number][] = JSON.parse(localStorage.getItem(storageKey) || "[]");
        const recent = stored.filter(([id, time]) => typeof id === "string" && Number.isFinite(time) && time > now - ATTEMPT_WINDOW);
        if (recent.some(([id]) => id === saleId)) return false;
        localStorage.setItem(storageKey, JSON.stringify([...recent.slice(1 - ATTEMPT_LIMIT), [saleId, now]]));
      } catch { /* The in-memory claim still protects the current page. */ }
      this.attempts.set(memoryKey, now);
      if (this.attempts.size > ATTEMPT_LIMIT) {
        const oldest = this.attempts.keys().next().value;
        if (oldest !== undefined) this.attempts.delete(oldest);
      }
      return true;
    };
    return navigator.locks ? navigator.locks.request(storageKey, claim) : Promise.resolve(claim());
  }
}

const printing = new PrintService();
export const submitPrintJob = (document: PrintDocument, options?: PrintOptions) => printing.submit(document, options);
export const findPrinters = () => printing.discover();
