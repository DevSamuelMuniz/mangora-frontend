import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthSession } from "@/lib/auth/types";
import PendingSubscriptionPaymentModal from "./PendingSubscriptionPaymentModal";

const state = vi.hoisted(() => ({ overview: { accessBlocked: false, nextBillingAt: "2099-01-01", price: 40, invoices: [] as unknown[] }, reconcile: vi.fn(), request: vi.fn() }));
vi.mock("@/i18n/provider", () => ({ useT: () => (key: string) => key, useI18n: () => ({ locale: "pt-BR" }), useFormatters: () => ({ formatCurrency: (value: number) => String(value), formatDate: (value: string) => value }) }));
vi.mock("@/features/subscription/hooks/useSubscription", () => ({ useSubscription: () => ({ data: state.overview }), useReconcileSubscription: () => ({ mutateAsync: state.reconcile, isPending: false }) }));
vi.mock("@/features/settings/hooks/useSettings", () => ({ useCompanySettings: () => ({ data: undefined }), useSaveCompanySettings: () => ({ mutateAsync: vi.fn() }) }));
vi.mock("@/lib/api/client", () => ({ apiRequest: state.request }));
const session = { membership: { role: "OWNER" }, company: { subscriptionPlan: "BUSINESS", subscriptionStatus: "ACTIVE", accessBlocked: true, billingDueAt: "2020-01-01" } } as AuthSession;
const invoice = { id: "invoice", reference: "pay", amount: 40, dueDate: "2020-01-01", status: "PENDING", billingType: "PIX", invoiceUrl: "https://asaas.com/i/pay" };

beforeEach(() => { state.overview.invoices = []; state.overview.accessBlocked = false; vi.clearAllMocks(); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
describe("payment recovery dialog", () => {
  it("does not treat a confirmed payment or stale session date as debt", async () => {
    state.overview.invoices = [{ ...invoice, status: "CONFIRMED" }];
    render(<PendingSubscriptionPaymentModal session={session} />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });
  it("opens an existing invoice without requiring billing details again", async () => {
    state.overview.invoices = [invoice];
    const assign = vi.fn();
    vi.spyOn(window, "open").mockReturnValue({ location: { assign }, closed: false } as unknown as Window);
    render(<PendingSubscriptionPaymentModal session={session} />);
    fireEvent.click(await screen.findByRole("button", { name: "billing.pendingPayment.payNow" }));
    expect(assign).toHaveBeenCalledWith(invoice.invoiceUrl);
    expect(state.request).not.toHaveBeenCalled();
  });
  it("offers explicit reconciliation after returning from payment", async () => {
    state.overview.invoices = [invoice];
    state.reconcile.mockResolvedValue({ accessBlocked: false });
    render(<PendingSubscriptionPaymentModal session={session} />);
    fireEvent.click(await screen.findByRole("button", { name: /verificar pagamento/i }));
    await waitFor(() => expect(state.reconcile).toHaveBeenCalledOnce());
  });
});
