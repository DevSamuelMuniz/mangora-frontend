import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import LabelWorkspace from "@/components/labels/LabelWorkspace";
import I18nProvider from "@/i18n/provider";
import labels from "@/messages/pt-BR/labels.json";
import { printLabels } from "@/lib/labels";

vi.mock("@/features/products/hooks/useProducts", () => ({ useProducts: () => ({
  data: [{ id: "coffee", name: "Café especial", barcode: "0012345678905", sku: "CAFE" }, { id: "tea", name: "Chá", barcode: null, sku: "CHA" }],
  isLoading: false, error: null,
}) }));
vi.mock("@/lib/labels", async (original) => ({ ...await original<typeof import("@/lib/labels")>(), printLabels: vi.fn().mockResolvedValue(undefined) }));

afterEach(() => { cleanup(); vi.clearAllMocks(); });
function setup() { render(<I18nProvider locale="pt-BR" messages={{ labels, navigation: { groups: { supplies: "Suprimentos" } } }}><LabelWorkspace /></I18nProvider>); }

describe("página Etiquetas", () => {
  it("seleciona produto, tamanho e cópias antes de imprimir um documento isolado", async () => {
    setup();
    expect((screen.getByRole("button", { name: "Imprimir 0 etiquetas" }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole("checkbox", { name: "Selecionar Chá" }) as HTMLInputElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole("checkbox", { name: "Selecionar Café especial" }));
    fireEvent.change(screen.getByLabelText("Tamanho (largura × altura)"), { target: { value: "50x40" } });
    fireEvent.change(screen.getByLabelText("Quantidade de etiquetas de Café especial"), { target: { value: "3" } });
    fireEvent.click(screen.getByRole("button", { name: "Imprimir 3 etiquetas" }));
    await waitFor(() => expect(printLabels).toHaveBeenCalledOnce());
    const html = vi.mocked(printLabels).mock.calls[0][0];
    expect(html).toContain("size:50mm 40mm");
    expect(new DOMParser().parseFromString(html, "text/html").querySelectorAll(".product-label")).toHaveLength(3);
  });

  it("mantém a seleção ao pesquisar e bloqueia medidas personalizadas inválidas", () => {
    setup();
    fireEvent.click(screen.getByRole("checkbox", { name: "Selecionar Café especial" }));
    fireEvent.change(screen.getByPlaceholderText(labels.search), { target: { value: "inexistente" } });
    expect(screen.getByText(labels.noProducts)).toBeTruthy();
    expect(screen.getByLabelText("Quantidade de etiquetas de Café especial")).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Tamanho (largura × altura)"), { target: { value: "custom" } });
    fireEvent.change(screen.getByLabelText("Largura (cm)"), { target: { value: "0" } });
    expect(screen.getByRole("alert").textContent).toBe(labels.invalidSize);
    expect((screen.getByRole("button", { name: "Imprimir 1 etiquetas" }) as HTMLButtonElement).disabled).toBe(true);
  });
});
