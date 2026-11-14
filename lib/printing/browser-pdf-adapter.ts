import { PrintError, type PdfOutput } from "./types";

export class BrowserPdfAdapter {
  async print(document: PdfOutput): Promise<"dialog-opened"> {
    try {
      await openPrintDialog(document.pdf.output("blob"));
    } catch (cause) {
      throw new PrintError("browser", { cause });
    }
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
        if (!frame.contentWindow) throw new Error("Missing PDF frame window");
        frame.contentWindow.addEventListener("afterprint", cleanup, { once: true });
        frame.contentWindow.focus();
        frame.contentWindow.print();
        resolve();
      } catch (cause) {
        cleanup();
        reject(cause);
      }
    };
    frame.onerror = () => { cleanup(); reject(new Error("Could not load PDF")); };
    const timer = window.setTimeout(() => { cleanup(); reject(new Error("PDF load timed out")); }, 120_000);
    frame.src = url;
    document.body.appendChild(frame);
  });
}
