import type qzTray from "qz-tray";
import type { PrintConfig, PrintData } from "qz-tray";
import { QZ_HOST, QZ_SECURE_PORTS } from "./qz-connection";
import { SystemPrinterAdapter } from "./system-printer-adapter";
import { PrintError, type PrinterAdapter, type PrinterProfile, type PrintOutput } from "./types";

type Qz = typeof qzTray;

function printFailure(cause: unknown, fallback: "connection" | "unknown") {
  if (cause instanceof PrintError) return cause;
  const message = cause instanceof Error ? cause.message : String(cause);
  if (/paper.?out|out of paper|no paper|sem papel/i.test(message)) return new PrintError("out-of-paper", { cause });
  if (/user (denied|declined|canceled|cancelled)|request (blocked|denied)|connection blocked by client|cancel[le]*d by/i.test(message)) return new PrintError("cancelled", { cause });
  if (/no (matching )?printer|printer (not found|could not be found)|cannot find printer/i.test(message)) return new PrintError("printer-missing", { cause });
  if (/unsupported (format|flavor)|incompatible|cannot print raw|cannot parse (pdf|raw)/i.test(message)) return new PrintError("incompatible", { cause });
  return new PrintError(fallback, { cause });
}

function waitForQz<T>(operation: Promise<T>, milliseconds: number, code: "connection" | "unknown"): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new PrintError(code)), milliseconds);
    void operation.then(resolve, reject).finally(() => clearTimeout(timer));
  });
}

export class QzTrayAdapter implements PrinterAdapter {
  private connecting?: Promise<Qz>;
  private readonly pixel = new SystemPrinterAdapter();

  constructor(private readonly load: () => Promise<Qz> = async () => (await import("qz-tray")).default) {}

  private async initialize() {
    const qz = await this.load();
    // QZ owns local approval. The web server does not sign spooler operations.
    qz.security.setCertificatePromise(async () => "");
    qz.security.setSignaturePromise(async () => "");
    if (!qz.websocket.isActive()) {
      const connection = qz.websocket.connect({
        host: QZ_HOST, usingSecure: true, retries: 0,
        port: { secure: [...QZ_SECURE_PORTS], insecure: [] },
      });
      await waitForQz(connection, 45_000, "connection");
    }
    return qz;
  }

  private bridge() {
    this.connecting ??= this.initialize()
      .catch(cause => { throw printFailure(cause, "connection"); })
      .finally(() => { this.connecting = undefined; });
    return this.connecting;
  }

  async connect() {
    await this.bridge();
  }

  async discover() {
    const qz = await this.bridge();
    try {
      const printers = await waitForQz(qz.printers.find(), 45_000, "connection");
      return (typeof printers === "string" ? [printers] : printers).filter(Boolean);
    } catch (cause) {
      throw printFailure(cause, "connection");
    }
  }

  async diagnose(profile: PrinterProfile) {
    if (!profile.name || !(await this.discover()).includes(profile.name)) throw new PrintError("printer-missing");
    // QZ discovery confirms a local queue. Driver readiness and paper status can be unknown.
    return "available" as const;
  }

  async print(output: PrintOutput, profile: PrinterProfile) {
    const qz = await this.bridge();
    const send = (options: PrintConfig, data: PrintData[]) =>
      waitForQz(qz.print(qz.configs.create(profile.name, options), data), 90_000, "unknown");
    try {
      if (output.format === "escpos") {
        const data = Array.from(output.bytes, byte => `x${byte.toString(16).padStart(2, "0")}`).join("");
        await send({ jobName: output.filename, copies: 1 }, [{ type: "raw", format: "command", flavor: "hex", data }]);
      } else {
        await this.pixel.print(output.document, profile, send);
      }
      return "submitted" as const;
    } catch (cause) {
      throw printFailure(cause, "unknown");
    }
  }
}
