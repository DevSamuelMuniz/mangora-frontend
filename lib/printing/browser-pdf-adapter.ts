import { PrintError, type PrinterAdapter, type PrintOutput, type AdapterResult } from "./types";

export class BrowserPdfAdapter implements PrinterAdapter {
  async discover() { return []; }
  async connect() {}
  async diagnose() { return "unknown" as const; }

  async print(output: PrintOutput): Promise<AdapterResult> {
    if (output.format !== "pdf") throw new PrintError("incompatible");
    await openPrintDialog(output.document.pdf.output("blob"));
    return "dialog-opened";
  }
}

function openPrintDialog(blob: Blob): Promise<void> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const frame = document.createElement("iframe");
    frame.title = "PDF";
    frame.style.cssText = "position:fixed;left:-10000px;top:0;width:800px;height:600px;border:0";
    let cleaned = false;
    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      window.clearTimeout(timer);
      frame.onload = null;
      frame.onerror = null;
      frame.remove();
      URL.revokeObjectURL(url);
    };
    frame.onload = () => {
      frame.onload = null;
      try {
        if (!frame.contentWindow) throw new PrintError("browser");
        frame.contentWindow.addEventListener("afterprint", cleanup, { once: true });
        frame.contentWindow.focus();
        frame.contentWindow.print();
        resolve();
      } catch (cause) {
        cleanup();
        reject(new PrintError("browser", { cause }));
      }
    };
    frame.onerror = () => { cleanup(); reject(new PrintError("browser")); };
    const timer = window.setTimeout(() => { cleanup(); reject(new PrintError("browser")); }, 120_000);
    frame.src = url;
    document.body.appendChild(frame);
  });
}
