import type { jsPDF } from "jspdf";
import { readPrintPreferences } from "./preferences";

export type PrintJob = { pdf: jsPDF; width: number; height: number; kind: "label" | "receipt"; filename: string; parts?: { pdf: jsPDF; width: number; height: number }[] };
let connecting: Promise<void> | undefined;
let securityReady = false;

async function connect() {
  const qz = (await import("qz-tray")).default;
  if (!securityReady) {
    const payloads = new Map<string, string>();
    const hash = async (payload: string) => {
      const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(payload));
      const hex = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
      payloads.set(hex, payload);
      return hex;
    };
    // QZ's runtime accepts a string hasher; its community declaration is inaccurate.
    qz.api.setSha256Type(hash as unknown as Parameters<typeof qz.api.setSha256Type>[0]);
    qz.security.setCertificatePromise(async () => {
      const response = await fetch("/api/printing/certificate", { cache: "no-store" });
      if (!response.ok) throw new Error("certificate-unavailable");
      return response.text();
    });
    qz.security.setSignatureAlgorithm("SHA512");
    qz.security.setSignaturePromise(async (data: string) => {
      const payload = payloads.get(data);
      payloads.delete(data);
      const certificate = await fetch("/api/printing/certificate", { cache: "no-store" });
      if (certificate.status === 204) return "";
      if (!certificate.ok) throw new Error("certificate-unavailable");
      if (!payload) throw new Error("missing-signing-payload");
      const response = await fetch("/api/printing/sign", { method: "POST", headers: { "Content-Type": "text/plain" }, body: payload });
      if (!response.ok) throw new Error("signing-failed");
      return response.text();
    });
    securityReady = true;
  }
  if (!qz.websocket.isActive()) {
    connecting ??= qz.websocket.connect({ retries: 0 }).finally(() => { connecting = undefined; });
    await connecting;
  }
  return qz;
}

export async function findPrinters(): Promise<string[]> {
  const qz = await connect();
  const printers = await qz.printers.find();
  return typeof printers === "string" ? [printers] : printers;
}

/** A rejected submission is never retried: it might already be in the OS spooler. */
export async function submitPrintJob(job: PrintJob): Promise<void> {
  const preferences = readPrintPreferences();
  if (preferences.savePdf) job.pdf.save(job.filename);
  if (preferences.transport === "qz") {
    const printer = job.kind === "label" ? preferences.labelPrinter : preferences.receiptPrinter;
    if (!printer) throw new Error("printer-not-selected");
    const qz = await connect();
    for (const part of job.parts ?? [job]) {
      const config = qz.configs.create(printer, {
        units: "mm", size: { width: part.width, height: part.height }, margins: 0,
        scaleContent: false, rasterize: false, copies: 1,
        orientation: part.width > part.height ? "landscape" : "portrait", jobName: job.filename,
      });
      await qz.print(config, [{ type: "pixel", format: "pdf", flavor: "base64", data: part.pdf.output("datauristring").split(",")[1] }]);
    }
    return;
  }
  await printPdfInBrowser(job.pdf.output("blob"));
}

function printPdfInBrowser(blob: Blob): Promise<void> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const frame = document.createElement("iframe");
    frame.title = "PDF";
    frame.style.cssText = "position:fixed;left:-10000px;top:0;width:800px;height:600px;border:0";
    const cleanup = () => { window.clearTimeout(timer); frame.remove(); URL.revokeObjectURL(url); };
    frame.onload = () => {
      try {
        if (!frame.contentWindow) throw new Error("print-window-unavailable");
        frame.contentWindow.addEventListener("afterprint", cleanup, { once: true });
        frame.contentWindow.focus();
        frame.contentWindow.print();
        resolve();
      } catch (error) { cleanup(); reject(error); }
    };
    frame.onerror = () => { cleanup(); reject(new Error("pdf-load-failed")); };
    const timer = window.setTimeout(() => { cleanup(); reject(new Error("print-timeout")); }, 300_000);
    frame.src = url;
    document.body.appendChild(frame);
  });
}
