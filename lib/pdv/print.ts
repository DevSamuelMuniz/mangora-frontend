import type { CompanySettings } from "@/types/settings";
import { paymentMethodLabels, type Sale } from "@/types/sale";
import { formatDateTime } from "@/lib/format";

type ReceiptCompany = Pick<
    CompanySettings,
    "tradeName" | "document" | "phone" | "email" | "street" | "number" | "city" | "state" | "postalCode"
>;

/** Imprime o cupom da venda (80mm) em uma janela dedicada. */
export function printReceipt(sale: Sale, company: ReceiptCompany | null, changeInfo?: { received: number; change: number }, mode: "standard" | "bold" = "standard") {
    const isCashChange = sale.paymentMethod === "CASH" && changeInfo !== undefined;
    const reinforced = mode === "bold";
    const items = sale.items
        .map((item) => {
            const name = wrapText(escapeHtml(item.productName), 30);
            return `<tr>
                <td colspan="2" style="padding:3px 0 0;font-size:${reinforced ? "14px" : "12px"}">${name}<br><span style="color:${reinforced ? "#000" : "#444"}">${item.quantity} x ${formatMoney(item.unitPrice)}</span></td>
                <td style="text-align:right;font-size:${reinforced ? "14px" : "12px"};font-weight:900;vertical-align:bottom">${formatMoney(item.subtotal)}</td>
            </tr>`;
        })
        .join("");

    const address = [company?.street, company?.number].filter(Boolean).join(", ");
    const cityLine = [company?.city, company?.state].filter(Boolean).join(" - ");
    const contact = [company?.phone, company?.email].filter(Boolean).join(" · ");

    const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Cupom ${sale.code}</title>
<style>
  * { box-sizing: border-box; margin: 0; }
  body { font-family: 'Courier New', monospace; color: #000; width: 80mm; margin: 0 auto; padding: 10px 4px; font-size: ${reinforced ? "14px" : "12px"}; font-weight: ${reinforced ? "700" : "400"}; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .center { text-align: center; }
  .brand { font-weight: 900; font-size: ${reinforced ? "18px" : "15px"}; letter-spacing: 1px; }
  .muted { color: ${reinforced ? "#000" : "#444"}; font-size: ${reinforced ? "12px" : "11px"}; }
  .divider { border-top: ${reinforced ? "2px" : "1px"} dashed #000; margin: 7px 0; }
  .divider-solid { border-top: ${reinforced ? "2px" : "1px"} solid #000; margin: 7px 0; }
  table { width: 100%; border-collapse: collapse; }
  .meta { width: 100%; }
  .meta td { padding: 1px 0; vertical-align: top; }
  .meta td:last-child { text-align: right; white-space: nowrap; }
  .total-row td { font-size: 15px; font-weight: bold; padding-top: 4px; }
  .total-box { border: ${reinforced ? "3px" : "2px"} solid #000; margin: 8px 0; padding: 6px 8px; text-align: center; }
  .total-box .label { font-size: 10px; text-transform: uppercase; letter-spacing: 2px; }
  .total-box .value { font-size: ${reinforced ? "26px" : "22px"}; font-weight: 900; }
  .footer { text-align: center; font-size: ${reinforced ? "12px" : "11px"}; margin-top: 8px; }
  .notes { margin-top: 6px; font-size: ${reinforced ? "12px" : "11px"}; color: #000; }
</style></head><body>
  <p class="center brand">${escapeHtml(company?.tradeName ?? "Mangora")}</p>
  ${company?.document ? `<p class="center muted">CNPJ/CPF ${escapeHtml(company.document)}</p>` : ""}
  ${address ? `<p class="center muted">${escapeHtml(address)}</p>` : ""}
  ${cityLine ? `<p class="center muted">${escapeHtml(cityLine)}${company?.postalCode ? ` · CEP ${escapeHtml(company.postalCode)}` : ""}</p>` : ""}
  ${contact ? `<p class="center muted">${escapeHtml(contact)}</p>` : ""}
  <div class="divider"></div>
  <p class="center" style="font-weight:bold;letter-spacing:2px;">CUPOM DE VENDA</p>
  <div class="divider-solid"></div>
  <table class="meta">
    <tr><td>Venda</td><td>${escapeHtml(sale.code)}</td></tr>
    <tr><td>Data</td><td>${formatDateTime(sale.createdAt)}</td></tr>
    ${sale.createdByName ? `<tr><td>Operador</td><td>${escapeHtml(sale.createdByName)}</td></tr>` : ""}
    <tr><td>Cliente</td><td>${escapeHtml(sale.customerName)}</td></tr>
    ${sale.customerDocument ? `<tr><td>CPF/CNPJ</td><td>${escapeHtml(sale.customerDocument)}</td></tr>` : ""}
    <tr><td>Pagamento</td><td>${escapeHtml(paymentMethodLabels[sale.paymentMethod])}</td></tr>
  </table>
  <div class="divider"></div>
  <table>${items}</table>
  <div class="divider"></div>
  <table class="meta">
    <tr><td>Subtotal</td><td>${formatMoney(sale.subtotal)}</td></tr>
    ${Number(sale.discount) > 0 ? `<tr><td>Desconto</td><td>- ${formatMoney(Number(sale.discount))}</td></tr>` : ""}
  </table>
  <div class="total-box">
    <div class="label">Total</div>
    <div class="value">${formatMoney(sale.total)}</div>
  </div>
  ${sale.payments?.length ? `
  <div class="divider-solid"></div>
  <table class="meta">
    ${sale.payments.map((payment) => `<tr><td>${escapeHtml(paymentMethodLabels[payment.method])}</td><td>${formatMoney(payment.amount)}</td></tr>`).join("")}
  </table>` : ""}
  ${isCashChange ? `
  <div class="divider-solid"></div>
  <table class="meta">
    <tr><td>Valor recebido</td><td>${formatMoney(changeInfo.received)}</td></tr>
    <tr><td style="font-weight:bold">Troco</td><td style="font-weight:bold">${formatMoney(changeInfo.change)}</td></tr>
  </table>` : ""}
  ${sale.notes ? `<div class="notes">Obs: ${escapeHtml(sale.notes)}</div>` : ""}
  <p class="footer">Obrigado pela preferência!</p>
  <p class="footer muted">Gerado por Mangora</p>
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

/** Quebra texto longo em linhas de até `width` caracteres (nomes de itens). */
function wrapText(value: string, width: number): string {
    if (value.length <= width) return value;
    const lines: string[] = [];
    let current = "";
    for (const word of value.split(" ")) {
        if ((current + " " + word).trim().length > width) {
            if (current) lines.push(current);
            current = word;
        } else {
            current = (current + " " + word).trim();
        }
    }
    if (current) lines.push(current);
    return lines.join("<br>");
}
