vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
import React from "react";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SalesCatalog from "@/components/sales/SalesCatalog";
import I18nProvider from "@/i18n/provider";
import { apiRequest } from "@/lib/api/client";
import { printReceipt } from "@/lib/pdv/print";
import sales from "@/messages/pt-BR/sales.json";
import labels from "@/messages/pt-BR/labels.json";
import common from "@/messages/pt-BR/common.json";
import paymentMethods from "@/messages/pt-BR/paymentMethods.json";
import statuses from "@/messages/pt-BR/statuses.json";
import type { Sale } from "@/types/sale";

const spies = vi.hoisted(() => ({ info: vi.fn(), error: vi.fn(), success: vi.fn() }));
const sale = { id: "sale-1", code: "V001", customerName: "Balcão", createdAt: "2026-11-02T12:00:00Z", status: "COMPLETED", total: 20, subtotal: 20, discount: 0, paymentMethod: "CASH", items: [{ id: "item-1", productName: "SPACE", quantity: 1, unitPrice: 20, subtotal: 20 }] } as Sale;
const cancelled = { ...sale, id: "cancelled", code: "V002", status: "CANCELLED" } as Sale;
const company = { tradeName: "Loja Mangora", document: "123" };
vi.mock("@/features/sales/hooks/useSales", () => ({ useSales: () => ({ data: [sale, cancelled], isLoading: false }), useCancelSale: () => ({ isPending: false }), useReturnSaleItems: () => ({ isPending: false }) }));
vi.mock("@/components/ui/toast", () => ({ useToast: () => spies }));
vi.mock("@/lib/api/client", () => ({ apiRequest: vi.fn() }));
vi.mock("@/lib/pdv/print", () => ({ printReceipt: vi.fn() }));
beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  vi.spyOn(HTMLDialogElement.prototype, "showModal").mockImplementation(function (this: HTMLDialogElement) { this.open = true; });
  vi.spyOn(HTMLDialogElement.prototype, "close").mockImplementation(function (this: HTMLDialogElement) { this.open = false; });
  vi.mocked(apiRequest).mockImplementation(async path => path === "/companies/current" ? company : sale);
  vi.mocked(printReceipt).mockResolvedValue(undefined);
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
function confirmPrint() { fireEvent.click(within(screen.getByRole("dialog", { name: "Imprimir notinha da venda V001" })).getByRole("button", { name: labels.dialog.confirm })); }
function setup() { render(<I18nProvider locale="pt-BR" messages={{ sales, labels, common, paymentMethods, statuses }}><SalesCatalog /></I18nProvider>); }

describe("receipt reprinting from recorded sales", () => {
  it("closes preparation without fetching, printing or downloading", () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: "Imprimir notinha da venda V001" }));
    fireEvent.click(within(screen.getByRole("dialog", { name: "Imprimir notinha da venda V001" })).getByRole("button", { name: labels.dialog.cancel }));
    expect(printReceipt).not.toHaveBeenCalled();
    expect(apiRequest).not.toHaveBeenCalled();
  });
  it("requires an explicit local printer for direct printing", () => {
    localStorage.setItem("mangora.printing.v1", JSON.stringify({ transport: "qz" }));
    setup();
    fireEvent.click(screen.getByRole("button", { name: "Imprimir notinha da venda V001" }));
    const dialog = screen.getByRole("dialog", { name: "Imprimir notinha da venda V001" });
    expect((within(dialog).getByRole("button", { name: labels.dialog.confirm }) as HTMLButtonElement).disabled).toBe(true);
    expect(within(dialog).getByText(labels.dialog.selectPrinterHint)).toBeTruthy();
    expect(printReceipt).not.toHaveBeenCalled();
  });
  it("loads the recorded sale and company, then uses the existing receipt printer", async () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: "Imprimir notinha da venda V001" }));
    expect(printReceipt).not.toHaveBeenCalled();
    expect(apiRequest).not.toHaveBeenCalled();
    confirmPrint();
    await waitFor(() => expect(printReceipt).toHaveBeenCalledWith(sale, company, undefined, "standard"));
    expect(apiRequest).toHaveBeenCalledWith("/sales/sale-1");
    expect(apiRequest).toHaveBeenCalledWith("/companies/current");
    expect(spies.info).toHaveBeenCalledWith(labels.printSubmitted);
    expect(screen.queryByRole("button", { name: "Imprimir notinha da venda V002" })).toBeNull();
  });
  it("offers the same print action in sale details", async () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: "Visualizar venda V001" }));
    const dialog = screen.getByRole("dialog", { name: "Venda V001" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Imprimir notinha" }));
    confirmPrint();
    await waitFor(() => expect(printReceipt).toHaveBeenCalledOnce());
  });
  it("blocks concurrent submissions and allows a later explicit reprint", async () => {
    let resolve!: () => void;
    vi.mocked(printReceipt).mockReturnValueOnce(new Promise<void>(done => { resolve = done; }));
    setup();
    const button = screen.getByRole("button", { name: "Imprimir notinha da venda V001" });
    fireEvent.click(button);
    confirmPrint();
    fireEvent.click(within(screen.getByRole("dialog", { name: "Imprimir notinha da venda V001" })).getByRole("button", { name: labels.dialog.confirm }));
    await waitFor(() => expect(printReceipt).toHaveBeenCalledOnce());
    expect((button as HTMLButtonElement).disabled).toBe(true);
    resolve();
    await waitFor(() => expect((button as HTMLButtonElement).disabled).toBe(false));
    fireEvent.click(button);
    confirmPrint();
    await waitFor(() => expect(printReceipt).toHaveBeenCalledTimes(2));
  });
  it("keeps the sale and displays an error without automatically retrying", async () => {
    vi.mocked(printReceipt).mockRejectedValueOnce(new Error("offline"));
    setup();
    fireEvent.click(screen.getByRole("button", { name: "Imprimir notinha da venda V001" }));
    confirmPrint();
    await waitFor(() => expect(within(screen.getByRole("dialog", { name: "Imprimir notinha da venda V001" })).getByRole("alert").textContent).toBe(labels.printError));
    expect(printReceipt).toHaveBeenCalledOnce();
    expect(within(screen.getByRole("dialog", { name: "Imprimir notinha da venda V001" })).getByText("V001")).toBeTruthy();
  });
  it("does not print a sale cancelled since the list was loaded", async () => {
    vi.mocked(apiRequest).mockImplementation(async path => path === "/companies/current" ? company : { ...sale, status: "CANCELLED" });
    setup();
    fireEvent.click(screen.getByRole("button", { name: "Imprimir notinha da venda V001" }));
    confirmPrint();
    await waitFor(() => expect(within(screen.getByRole("dialog", { name: "Imprimir notinha da venda V001" })).getByRole("alert").textContent).toBe(sales.printUnavailable));
    expect(printReceipt).not.toHaveBeenCalled();
  });
});
