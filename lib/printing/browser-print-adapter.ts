import { PrintError, type PdfOutput, type PrintPage } from "./types";

export class BrowserPrintAdapter {
  async print({ pages }: PdfOutput): Promise<"dialog-opened"> {
    try {
      await openPrintDialog(pages);
    } catch (cause) {
      throw new PrintError("browser", { cause });
    }
    return "dialog-opened";
  }
}

function printHtml(pages: PrintPage[]) {
  const pageSizes = new Map<string, string>();
  const markup = pages.map(({ width, height, svg }) => {
    const size = `${width}mm ${height}mm`;
    let name = pageSizes.get(size);
    if (!name) {
      name = `sheet-${pageSizes.size}`;
      pageSizes.set(size, name);
    }
    return `<section style="page:${name};width:${width}mm;height:${height}mm">${svg}</section>`;
  });
  const rules = [...pageSizes].map(([size, name]) => `@page ${name} { size: ${size}; margin: 0; }`);
  return `<!doctype html><html><head><meta charset="utf-8"><title>Mangora</title><style>
    ${rules.join("\n")}
    html, body { margin: 0; padding: 0; }
    section { break-inside: avoid; overflow: hidden; }
    section + section { break-before: page; }
    svg { display: block; width: 100%; height: 100%; }
    </style></head><body>${markup.join("")}</body></html>`;
}

function openPrintDialog(pages: PrintPage[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const frame = document.createElement("iframe");
    frame.title = "Mangora";
    frame.tabIndex = -1;
    frame.setAttribute("aria-hidden", "true");
    frame.style.cssText = "position:fixed;left:-10000px;top:0;width:800px;height:600px;border:0";
    const cleanup = () => {
      window.clearTimeout(loadTimeout);
      frame.remove();
    };
    const fail = (cause: unknown) => {
      cleanup();
      reject(cause);
    };
    const loadTimeout = window.setTimeout(() => fail(new Error("Print document load timed out")), 15_000);
    frame.addEventListener("load", () => {
      try {
        const printWindow = frame.contentWindow;
        if (!printWindow) throw new Error("Missing print window");
        window.clearTimeout(loadTimeout);
        printWindow.addEventListener("afterprint", cleanup, { once: true });
        printWindow.print();
        resolve();
      } catch (cause) {
        fail(cause);
      }
    }, { once: true });
    frame.addEventListener("error", () => fail(new Error("Could not load print document")), { once: true });
    frame.srcdoc = printHtml(pages);
    document.body.appendChild(frame);
  });
}
