import type { CompanySettings } from "@/types/settings";
import type { Sale } from "@/types/sale";

/** Imprime a nota fiscal/cupom da venda em uma janela dedicada. */
export function printReceipt(sale: Sale, company: Pick<CompanySettings, "tradeName" | "document" | "city" | "state"> | null) {
    const items = sale.items
        .map(
            (item) =>
                `<tr><td style="padding:4px 0;font-size:12px">${escapeHtml(item.productName)}<br><span style="color:#666">${item.quantity} x ${formatMoney(item.unitPrice)}</span></td><td style="text-align:right;font-size:12px;font-weight:bold">${formatMoney(item.subtotal)}</td></tr>`,
        )
        .join("");

    const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Nota ${sale.code}</title>
<style>
  * { box-sizing: border-box; margin: 0; }
  body { font-family: 'Courier New', monospace; color: #111; width: 80mm; margin: 0 auto; padding: 12px 6px; }
  h1 { font-size: 16px; text-align: center; margin-bottom: 2px; }
  .muted { color: #555; font-size: 11px; text-align: center; }
  .row { display: flex; justify-content: space-between; font-size: 12px; padding: 1px 0; }
  .divider { border-top: 1px dashed #333; margin: 8px 0; }
  table { width: 100%; border-collapse: collapse; }
  .total { font-size: 18px; font-weight: bold; }
  .footer { text-align: center; font-size: 11px; margin-top: 10px; }
</style></head><body>
  <h1>${escapeHtml(company?.tradeName ?? "Mangora")}</h1>
  <p class="muted">${company?.document ? `CNPJ/CPF: ${escapeHtml(company.document)}` : ""}</p>
  <p class="muted">${company?.city ? `${escapeHtml(company.city)}${company.state ? " - " + escapeHtml(company.state) : ""}` : ""}</p>
  <div class="divider"></div>
  <div class="row"><span>Venda</span><span>${escapeHtml(sale.code)}</span></div>
  <div class="row"><span>Data</span><span>${new Date(sale.createdAt).toLocaleString("pt-BR")}</span></div>
  <div class="row"><span>Cliente</span><span>${escapeHtml(sale.customerName)}</span></div>
  ${sale.customerDocument ? `<div class="row"><span>CPF/CNPJ</span><span>${escapeHtml(sale.customerDocument)}</span></div>` : ""}
  <div class="row"><span>Pagamento</span><span>${escapeHtml(sale.paymentMethod)}</span></div>
  <div class="divider"></div>
  <table>${items}</table>
  <div class="divider"></div>
  <div class="row"><span>Subtotal</span><span>${formatMoney(sale.subtotal)}</span></div>
  ${Number(sale.discount) > 0 ? `<div class="row"><span>Desconto</span><span>-${formatMoney(Number(sale.discount))}</span></div>` : ""}
  <div class="row total"><span>TOTAL</span><span>${formatMoney(sale.total)}</span></div>
  <p class="footer">Obrigado pela preferência!</p>
  <script>window.onload = function(){ window.print(); }</script>
</body></html>`;

    const win = window.open("", "_blank", "width=420,height=600");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
}

function formatMoney(value: number): string {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function escapeHtml(value: string): string {
    return value.replace(/[&<>"']/g, (char) =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] ?? char,
    );
}
