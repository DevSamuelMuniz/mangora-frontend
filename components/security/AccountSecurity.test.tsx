import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import AccountSecurity from "./AccountSecurity";
import { apiRequest } from "@/lib/api/client";

vi.mock("@/lib/api/client", () => ({ apiRequest: vi.fn() }));
vi.mock("@/i18n/provider", () => ({ useLocale: () => "pt-BR", useT: () => (key: string) => key }));
const enabled = { mfaEnabled: true, configured: true, nextStep: null, recoveryCodesRemaining: 8 };
beforeEach(() => { vi.stubGlobal("React", React); vi.mocked(apiRequest).mockReset().mockResolvedValue(enabled); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

async function openForm() {
  render(<AccountSecurity embedded />);
  fireEvent.click(await screen.findByRole("button", { name: "accountSecurity.disableAction" }));
}
describe("MFA settings", () => {
  it("allows cancelling without changing security", async () => {
    await openForm();
    fireEvent.click(screen.getByRole("button", { name: "accountSecurity.cancel" }));
    expect(screen.queryByRole("button", { name: "accountSecurity.disableConfirm" })).toBeNull();
    expect(apiRequest).toHaveBeenCalledTimes(1);
  });
  it("submits credentials and displays the disabled status", async () => {
    await openForm();
    vi.mocked(apiRequest).mockResolvedValueOnce({ disabled: true }).mockResolvedValueOnce({ ...enabled, mfaEnabled: false });
    fireEvent.change(screen.getByLabelText("accountSecurity.currentPasswordPlaceholder"), { target: { value: "my-password" } });
    fireEvent.change(screen.getByLabelText("accountSecurity.codeTitle"), { target: { value: "123456" } });
    fireEvent.submit(screen.getByRole("button", { name: "accountSecurity.disableConfirm" }).closest("form")!);
    await screen.findByText("accountSecurity.offStatus");
    expect(apiRequest).toHaveBeenCalledWith("/auth/security/mfa/disable", { method: "POST", body: JSON.stringify({ password: "my-password", code: "123456" }) });
    expect(screen.queryByRole("button", { name: "accountSecurity.disableConfirm" })).toBeNull();
  });
  it("keeps MFA enabled when credentials are rejected", async () => {
    await openForm();
    vi.mocked(apiRequest).mockRejectedValueOnce(new Error("Invalid code"));
    fireEvent.submit(screen.getByRole("button", { name: "accountSecurity.disableConfirm" }).closest("form")!);
    await waitFor(() => expect(screen.getByRole("alert").textContent).toBe("Invalid code"));
    expect(screen.getByText("accountSecurity.enabledStatus")).toBeTruthy();
    expect(screen.getByRole("button", { name: "accountSecurity.disableConfirm" })).toBeTruthy();
  });
});
