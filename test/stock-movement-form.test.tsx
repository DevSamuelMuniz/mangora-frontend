import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import StockMovementForm from "@/components/stock/StockMovementForm";
import I18nProvider from "@/i18n/provider";
import stock from "@/messages/pt-BR/stock.json";

const { mutateAsync, push, refresh } = vi.hoisted(() => ({
  mutateAsync: vi.fn().mockResolvedValue({}), push: vi.fn(), refresh: vi.fn(),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, refresh }) }));
vi.mock("@/features/stock/hooks/useStockOverview", () => ({
  useStockOverview: () => ({ data: { products: [{ id: "product-1", name: "Blusa", sku: "600461", stock: 119, reservedStock: 0 }] }, isLoading: false }),
  useCreateStockMovement: () => ({ mutateAsync, isPending: false }),
}));

afterEach(() => { cleanup(); vi.clearAllMocks(); });
function setup() {
  const result = render(<I18nProvider locale="pt-BR" messages={{ stock }}><StockMovementForm initialProductId="product-1" /></I18nProvider>);
  fireEvent.change(screen.getByLabelText("Quantidade"), { target: { value: "1" } });
  return result.container.querySelector("form")!;
}

describe("movimentação de estoque", () => {
  for (const type of ["ENTRY", "EXIT", "ADJUSTMENT"] as const) {
    for (const reason of Object.values(stock.form.reasons[type])) {
      it(`envia o motivo completo para ${type}: ${reason}`, async () => {
        const form = setup();
        fireEvent.click(screen.getByRole("radio", { name: new RegExp(stock.form.types[type].label) }));
        fireEvent.change(screen.getByLabelText("Motivo"), { target: { value: reason } });
        fireEvent.change(screen.getByLabelText("Custo unitário (opcional)"), { target: { value: "10" } });
        fireEvent.change(screen.getByLabelText("Observações (opcional)"), { target: { value: "yyyy" } });
        fireEvent.submit(form);
        await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith({ productId: "product-1", type, quantity: 1, unitCost: 10, reason, notes: "yyyy" }));
        await waitFor(() => expect(push).toHaveBeenCalled());
      });
    }
  }

  it("bloqueia motivo vazio com mensagem em português", () => {
    fireEvent.submit(setup());
    expect(mutateAsync).not.toHaveBeenCalled();
    expect(screen.getByRole("alert").textContent).toBe(stock.form.errors.reason);
  });

  it("exige nova seleção de motivo ao trocar o tipo", () => {
    const form = setup();
    fireEvent.change(screen.getByLabelText("Motivo"), { target: { value: "Compra de fornecedor" } });
    fireEvent.click(screen.getByRole("radio", { name: /Saída/ }));
    fireEvent.submit(form);
    expect(mutateAsync).not.toHaveBeenCalled();
    expect(screen.getByRole("alert").textContent).toBe(stock.form.errors.reason);
  });
});
