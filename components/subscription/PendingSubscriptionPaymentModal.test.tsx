import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthSession } from "@/lib/auth/types";
import PendingSubscriptionPaymentModal from "./PendingSubscriptionPaymentModal";

const state = vi.hoisted(() => ({ overview: { accessBlocked: false, billingDueAt: "2026-11-07", invoices: [] }, pathname: "/dashboard", reconcile: vi.fn() }));
vi.mock("next/navigation", () => ({ usePathname: () => state.pathname }));
vi.mock("next/link", () => ({ default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a href={href} {...props}>{children}</a> }));
vi.mock("@/i18n/provider", () => ({ useT: () => (key: string) => key }));
vi.mock("@/features/subscription/hooks/useSubscription", () => ({ useSubscription: () => ({ data: state.overview }), useSubscriptionAccess: () => ({ data: state.overview }), useReconcileSubscription: () => ({ mutateAsync: state.reconcile, isPending: false }) }));
const session = { membership: { role: "OWNER" }, company: { id: "company", tradeName: "Loja", subscriptionPlan: "BUSINESS", subscriptionStatus: "ACTIVE", accessBlocked: true, billingDueAt: "2020-01-01" } } as AuthSession;
beforeEach(() => {
  state.overview.accessBlocked = false; state.pathname = "/dashboard";
  vi.clearAllMocks(); window.sessionStorage.clear();
  vi.spyOn(HTMLDialogElement.prototype, "showModal").mockImplementation(function(this: HTMLDialogElement) { this.setAttribute("open", ""); });
  vi.spyOn(HTMLDialogElement.prototype, "close").mockImplementation(function(this: HTMLDialogElement) { this.removeAttribute("open"); });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
describe("billing access reminder", () => {
  it("uses live access instead of a stale session or browser clock", () => {
    render(<PendingSubscriptionPaymentModal session={session} />);
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.queryByText("billing.paymentFlow.blocked")).toBeNull();
  });
  it("links to the separate payments page and checks without granting access locally", async () => {
    state.overview.accessBlocked = true;
    state.reconcile.mockResolvedValue({ accessBlocked: true });
    render(<PendingSubscriptionPaymentModal session={session} />);
    fireEvent.click(await screen.findByRole("button", { name: "billing.paymentFlow.check" }));
    await waitFor(() => expect(state.reconcile).toHaveBeenCalledOnce());
    expect(await screen.findByText("billing.paymentFlow.waiting")).toBeTruthy();
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getAllByRole("link", { name: "billing.paymentFlow.viewPayments" })[0].getAttribute("href")).toBe("/assinatura/cobrancas");
  });
  it("keeps billing routes usable without an automatic modal on top", () => {
    state.overview.accessBlocked = true; state.pathname = "/assinatura/cobrancas";
    render(<PendingSubscriptionPaymentModal session={session} />);
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByText("billing.paymentFlow.blocked")).toBeTruthy();
  });
  it("snoozes per company and cycle across remounts while retaining the banner", async () => {
    state.overview.accessBlocked = true;
    const first = render(<PendingSubscriptionPaymentModal session={session} />);
    fireEvent.click(await screen.findByRole("button", { name: "common.actions.close" }));
    expect(Number(window.sessionStorage.getItem("mangora:billing-reminder:company:2026-11-07"))).toBeGreaterThan(Date.now() + 29 * 60_000);
    first.unmount();
    render(<PendingSubscriptionPaymentModal session={session} />);
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByText("billing.paymentFlow.blocked")).toBeTruthy();
  });
  it("does not expose payment actions to employees", async () => {
    state.overview.accessBlocked = true;
    render(<PendingSubscriptionPaymentModal session={{ ...session, membership: { ...session.membership, role: "CASHIER" } }} />);
    await screen.findByRole("dialog");
    expect(screen.queryByRole("button", { name: "billing.paymentFlow.check" })).toBeNull();
    expect(screen.queryByRole("link")).toBeNull();
  });
});
