"use client";

import { FormEvent, useEffect, useState, type ReactNode } from "react";
import { useT } from "@/i18n/provider";
import { AlertCircle, Eye, EyeOff, KeyRound, LoaderCircle, LockKeyhole, ShieldCheck, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiRequest, rememberOperationPassword } from "@/lib/api/client";
import { useCompanySettings } from "@/features/settings/hooks/useSettings";

type WorkspaceModalProps = {
  children: ReactNode;
  closeHref: string;
  label: string;
  size?: "medium" | "large" | "wide";
};

const sizes = {
  medium: "max-w-3xl",
  large: "max-w-5xl",
  wide: "max-w-7xl",
};

export default function WorkspaceModal({ children, closeHref, label, size = "large" }: WorkspaceModalProps) {
  const t = useT();
  const router = useRouter();
  const { data: settings, isLoading } = useCompanySettings();
  const policy = ["/produtos", "/clientes", "/fornecedores", "/servicos", "/funcionarios"].includes(closeHref) ? "records" : closeHref === "/estoque" ? "stock" : null;
  const passwordRequired = policy === "records" ? settings?.requirePasswordForRecords : policy === "stock" ? settings?.requirePasswordForStock : false;
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);

  const close = () => router.replace(closeHref, { scroll: false });

  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setVerifying(true);
      setError("");
      await apiRequest<{ verified: boolean }>("/auth/operation-password/verify", { method: "POST", body: JSON.stringify({ password }) });
      rememberOperationPassword(password);
      setPassword("");
      setUnlocked(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t("forms.modal.passwordFailed"));
    } finally {
      setVerifying(false);
    }
  }

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") router.replace(closeHref, { scroll: false });
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [closeHref, router]);

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-[#123d2b]/45 p-0 backdrop-blur-sm sm:items-center sm:p-5">
      <button type="button" aria-label={t("workspace.confirm.close", { label })} onClick={close} className="absolute inset-0 cursor-default" />
      <div role="dialog" aria-modal="true" aria-label={label} className={`relative max-h-[96vh] w-full overflow-y-auto rounded-t-[1.75rem] border border-[#123d2b]/20 bg-[#e9dfd2] p-4 shadow-[0_28px_90px_rgba(18,61,43,0.32)] sm:max-h-[92vh] sm:rounded-[1.75rem] sm:p-6 ${sizes[size]}`}>
        <div className="sticky top-0 z-20 -mx-1 mb-4 flex justify-end bg-gradient-to-b from-[#e9dfd2] via-[#e9dfd2] to-transparent px-1 pb-3">
          <button type="button" onClick={close} className="flex size-10 items-center justify-center rounded-xl border border-[#123d2b]/10 bg-white text-[#597064] shadow-sm transition hover:border-orange-200 hover:text-orange-700" aria-label={t("workspace.confirm.close", { label })}>
            <X className="size-4" />
          </button>
        </div>
        {isLoading && policy ? (
          <div className="flex min-h-64 items-center justify-center gap-2 text-sm font-bold text-[#597064]">
            <LoaderCircle className="size-4 animate-spin" />
            {t("workspace.confirm.checking")}
          </div>
        ) : passwordRequired && !unlocked ? (
          <form onSubmit={(event) => void verify(event)} className="mx-auto w-full max-w-lg pb-3 sm:pb-5">
            <div className="overflow-hidden rounded-[1.5rem] border border-[#173d2b]/15 bg-[#fffdf8] shadow-[0_20px_55px_rgba(23,61,43,0.12)]">
              <div className="flex items-center gap-4 border-b border-[#173d2b]/10 bg-[#173d2b] px-5 py-4 text-white sm:px-6">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-orange-500 shadow-[0_0_0_5px_rgba(249,115,22,0.15)]">
                  <LockKeyhole className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-300">{t("forms.modal.securityHint")}</p>
                  <h2 className="mt-0.5 truncate text-lg font-black sm:text-xl">{t("forms.modal.confirmWithPassword")}</h2>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <div className="flex items-start gap-3 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3">
                  <span className="mt-0.5 h-8 w-1 shrink-0 rounded-full bg-orange-500" aria-hidden="true" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-orange-700">{t("forms.modal.actionRequested")}</p>
                    <p className="mt-0.5 text-sm font-black text-[#173d2b]">{label}</p>
                  </div>
                </div>

                <p id="operation-password-help" className="mt-4 text-sm leading-6 text-[#597064]">
                  {t("workspace.confirm.passwordHint")}
                </p>

                <label htmlFor="operation-password" className="mt-5 block text-xs font-black text-[#173d2b]">
                  {t("forms.modal.passwordLabel")}
                </label>
                <div className="relative mt-2">
                  <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-orange-600" />
                  <input
                    id="operation-password"
                    autoFocus
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      if (error) setError("");
                    }}
                    onKeyDown={(event) => setCapsLock(event.getModifierState("CapsLock"))}
                    onKeyUp={(event) => setCapsLock(event.getModifierState("CapsLock"))}
                    onBlur={() => setCapsLock(false)}
                    aria-invalid={Boolean(error)}
                    aria-describedby={`operation-password-help${capsLock ? " operation-password-caps" : ""}${error ? " operation-password-error" : ""}`}
                    className="h-12 w-full rounded-xl border border-[#173d2b]/20 bg-white pl-10 pr-12 text-base font-semibold text-[#173d2b] outline-none transition placeholder:text-[#597064]/55 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                    placeholder={t("forms.modal.passwordPlaceholder")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute right-1.5 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-[#597064] transition hover:bg-orange-50 hover:text-orange-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                    aria-label={showPassword ? t("forms.modal.hidePassword") : t("forms.modal.showPassword")}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>

                {capsLock && (
                  <p id="operation-password-caps" className="mt-2 flex items-center gap-1.5 text-xs font-bold text-amber-700">
                    <AlertCircle className="size-3.5" />
                    {t("workspace.confirm.capsLock")}
                  </p>
                )}

                {error && (
                  <p id="operation-password-error" role="alert" className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-left text-xs font-bold leading-5 text-red-700">
                    <AlertCircle className="mt-0.5 size-4 shrink-0" />
                    <span>{error} {t("forms.modal.retryHint")}</span>
                  </p>
                )}

                <div className="mt-5 flex flex-col-reverse gap-2.5 sm:flex-row">
                  <button type="button" onClick={close} disabled={verifying} className="h-12 flex-1 rounded-xl border border-[#173d2b]/15 bg-white text-sm font-black text-[#173d2b] transition hover:border-[#173d2b]/30 hover:bg-[#f8f3ea] disabled:opacity-50">
                    {t("common.actions.cancel")}
                  </button>
                  <button disabled={verifying || !password} className="flex h-12 flex-[1.4] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 px-5 text-sm font-black text-white shadow-[0_8px_20px_rgba(234,88,12,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(234,88,12,0.3)] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50">
                    {verifying ? <LoaderCircle className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
                    {verifying ? t("forms.modal.confirming") : t("forms.modal.confirm")}
                  </button>
                </div>

                <p className="mt-4 text-center text-[11px] leading-4 text-[#597064]">{t("workspace.confirm.secureNote")}</p>
              </div>
            </div>
          </form>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
