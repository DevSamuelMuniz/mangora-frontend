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

export function buildBrowserPrintHtml(pages: PrintPage[]) {
  if (!pages.length || pages.some(({ width, height }) => !Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0)) {
    throw new Error("Invalid print page dimensions");
  }
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
    /* Supply default paper geometry as well as each section's named size. */
    @page { size: ${pages[0].width}mm ${pages[0].height}mm; margin: 0; }
    ${rules.join("\n")}
    html, body { margin: 0; padding: 0; }
    body { width: ${pages[0].width}mm; }
    section { display: block; box-sizing: border-box; margin: 0; padding: 0; break-inside: avoid; overflow: hidden; }
    section + section { break-before: page; }
    svg { display: block; width: 100%; height: 100%; }
    </style></head><body>${markup.join("")}</body></html>`;
}

function openPrintDialog(pages: PrintPage[]): Promise<void> {
  const html = buildBrowserPrintHtml(pages);
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
    frame.addEventListener("load", async () => {
      try {
        const printWindow = frame.contentWindow;
        if (!printWindow) throw new Error("Missing print window");
        await frame.contentDocument?.fonts?.ready;
        if (!frame.isConnected) return;
        // Resolve layout before the browser takes its print snapshot.
        frame.contentDocument?.body.getBoundingClientRect();
        window.clearTimeout(loadTimeout);
        printWindow.addEventListener("afterprint", cleanup, { once: true });
        printWindow.print();
        resolve();
      } catch (cause) {
        fail(cause);
      }
    }, { once: true });
    frame.addEventListener("error", () => fail(new Error("Could not load print document")), { once: true });
    frame.srcdoc = html;
    document.body.appendChild(frame);
  });
}
