import React, { StrictMode } from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import I18nProvider from "@/i18n/provider";
import DoneStep from "@/components/pdv/DoneStep";
import PrintSettings from "@/components/printing/PrintSettings";
import { printReceipt } from "@/lib/pdv/print";
import { findPrinters } from "@/lib/printing/service";
import { savePrintPreferences } from "@/lib/printing/preferences";
import labels from "@/messages/pt-BR/labels.json";
import pdv from "@/messages/pt-BR/pdv.json";
import type { Sale } from "@/types/sale";

vi.mock("@/lib/pdv/print", async original => ({ ...await original<typeof import("@/lib/pdv/print")>(), printReceipt: vi.fn().mockResolvedValue(undefined) }));
vi.mock("@/lib/printing/service", () => ({ findPrinters: vi.fn().mockResolvedValue(["Thermal 80"]), submitPrintJob: vi.fn() }));
afterEach(() => { cleanup(); localStorage.clear(); vi.clearAllMocks(); });
const sale = { id: "automatic-ui", code: "V001", total: 20, customerName: "Balcão", paymentMethod: "CASH" } as Sale;
function Provider({ children }: { children: React.ReactNode }) { return <I18nProvider locale="pt-BR" messages={{ labels, pdv }}>{children}</I18nProvider>; }

describe("printing workflow", () => {
  it("applies and persists the Knup media profile", () => {
    render(<Provider><PrintSettings kind="label" /></Provider>);
    fireEvent.click(screen.getByText(labels.printSettings));
    fireEvent.change(screen.getByLabelText(labels.printerProfile), { target: { value: "knup-kp1025" } });
    expect(JSON.parse(localStorage.getItem("mangora.printing.v1")!)).toMatchObject({ printerProfile: "knup-kp1025", labelWidth: 48, receiptWidth: 58, labelPaper: "continuous" });
    expect(screen.getByText(labels.knupHint)).toBeTruthy();
  });
  it("dispatches automatic receipts once even under Strict Mode", async () => {
    render(<StrictMode><Provider><DoneStep sale={sale} company={null} onFinish={vi.fn()} /></Provider></StrictMode>);
    await waitFor(() => expect(printReceipt).toHaveBeenCalledOnce());
    await waitFor(() => expect(screen.getByText(labels.printSubmitted)).toBeTruthy());
  });
  it("honors the preference to disable automatic printing", async () => {
    savePrintPreferences({ autoReceipt: false });
    render(<Provider><DoneStep sale={{ ...sale, id: "automatic-off" }} company={null} onFinish={vi.fn()} /></Provider>);
    await Promise.resolve();
    expect(printReceipt).not.toHaveBeenCalled();
  });
  it("keeps the completed sale visible when automatic printing fails", async () => {
    vi.mocked(printReceipt).mockRejectedValueOnce(new Error("offline"));
    const finish = vi.fn();
    render(<Provider><DoneStep sale={{ ...sale, id: "automatic-failure" }} company={null} onFinish={finish} /></Provider>);
    await waitFor(() => expect(screen.getByRole("alert").textContent).toBe(labels.printError));
    expect(screen.getByText("Venda V001")).toBeTruthy();
    expect(finish).not.toHaveBeenCalled();
    expect(printReceipt).toHaveBeenCalledOnce();
  });
  it("discovers printers and saves the selected local device", async () => {
    savePrintPreferences({ transport: "qz" });
    render(<Provider><PrintSettings kind="label" /></Provider>);
    fireEvent.click(screen.getByText(labels.printSettings));
    fireEvent.click(screen.getByRole("button", { name: labels.findPrinters }));
    await waitFor(() => expect(findPrinters).toHaveBeenCalledOnce());
    await screen.findByText("Thermal 80");
    fireEvent.change(screen.getByLabelText(labels.printer), { target: { value: "Thermal 80" } });
    expect(JSON.parse(localStorage.getItem("mangora.printing.v1")!).labelPrinter).toBe("Thermal 80");
  });
  it("shows actionable connection failures", async () => {
    savePrintPreferences({ transport: "qz" });
    vi.mocked(findPrinters).mockRejectedValueOnce(new Error("offline"));
    render(<Provider><PrintSettings kind="receipt" /></Provider>);
    fireEvent.click(screen.getByText(labels.printSettings));
    fireEvent.click(screen.getByRole("button", { name: labels.findPrinters }));
    await waitFor(() => expect(screen.getByRole("status").textContent).toBe(labels.connectionError));
    expect((screen.getByRole("button", { name: labels.findPrinters }) as HTMLButtonElement).disabled).toBe(false);
  });
});
