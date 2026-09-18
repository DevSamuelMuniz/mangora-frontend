"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { AlertCircle, Eye, EyeOff, KeyRound, LoaderCircle, LockKeyhole, ShieldCheck, X } from "lucide-react";

import { useT } from "@/i18n/provider";

type OperationPasswordModalProps = {
  open: boolean;
  /** Ação que está sendo liberada (ex.: "Excluir produto", "Fechamento de caixa"). */
  action?: string | null;
  /** Mensagem do servidor explicando a exigência da senha. */
  message?: string | null;
  /** Erro da tentativa anterior (senha incorreta). */
  error?: string | null;
  /** Enquanto `true`, o modal fica bloqueado aguardando o servidor. */
  busy?: boolean;
  onSubmit: (password: string) => void;
  onCancel: () => void;
};

/**
 * Modal controlado de confirmação por senha — substitui os `window.prompt`.
 *
 * Herda a linguagem visual do `WorkspaceModal` (verde + laranja) e cuida de
 * acessibilidade: `role="dialog"`, `aria-modal`, foco automático no campo,
 * fechamento por `Esc`, bloqueio do scroll do body e `aria-describedby`
 * apontando para ajuda/erro. O estado é reiniciado a cada abertura pelo `key`
 * do provedor — por isso não há `setState` dentro de efeito.
 */
export default function OperationPasswordModal({ open, action, message, error, busy = false, onSubmit, onCancel }: OperationPasswordModalProps) {
  const t = useT();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const focus = window.setTimeout(() => inputRef.current?.focus(), 40);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(focus);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onCancel]);

  if (!open) return null;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !password) return;
    onSubmit(password);
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-[#123d2b]/45 backdrop-blur-sm sm:items-center sm:p-5">
      <button type="button" aria-label={t("common.actions.cancel")} onClick={onCancel} className="absolute inset-0 cursor-default" tabIndex={-1} />
      <form
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="operation-password-title"
        className="relative max-h-[96vh] w-full overflow-y-auto rounded-t-[1.5rem] border border-[#173d2b]/15 bg-[#fffdf8] shadow-[0_20px_55px_rgba(23,61,43,0.2)] sm:max-h-[92vh] sm:max-w-lg sm:rounded-[1.5rem]"
      >
        <div className="flex items-center gap-4 border-b border-[#173d2b]/10 bg-[#173d2b] px-5 py-4 text-white sm:px-6">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-orange-500 shadow-[0_0_0_5px_rgba(249,115,22,0.15)]">
            <LockKeyhole className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-300">{t("forms.modal.securityHint")}</p>
            <h2 id="operation-password-title" className="mt-0.5 text-lg font-black sm:text-xl">
              {t("forms.modal.confirmWithPassword")}
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label={t("common.actions.cancel")}
            className="grid size-9 shrink-0 place-items-center rounded-xl border border-white/15 text-white/80 transition hover:border-white/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="p-5 sm:p-6">
          {(action || message) && (
            <div className="flex items-start gap-3 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3">
              <span className="mt-0.5 h-8 w-1 shrink-0 rounded-full bg-orange-500" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-orange-700">{t("forms.modal.actionRequested")}</p>
                {action && <p className="mt-0.5 text-sm font-black text-[#173d2b]">{action}</p>}
                {message && <p className="mt-0.5 text-sm leading-5 text-[#597064]">{message}</p>}
              </div>
            </div>
          )}

          <p id="operation-password-help" className="mt-4 text-sm leading-6 text-[#597064]">
            {t("workspace.confirm.passwordHint")}
          </p>

          <label htmlFor="operation-password-input" className="mt-5 block text-xs font-black text-[#173d2b]">
            {t("forms.modal.passwordLabel")}
          </label>
          <div className="relative mt-2">
            <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-orange-600" />
            <input
              id="operation-password-input"
              ref={inputRef}
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              disabled={busy}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onKeyDown={(event) => setCapsLock(event.getModifierState("CapsLock"))}
              onKeyUp={(event) => setCapsLock(event.getModifierState("CapsLock"))}
              onBlur={() => setCapsLock(false)}
              aria-invalid={Boolean(error)}
              aria-describedby={`operation-password-help${capsLock ? " operation-password-caps" : ""}${error ? " operation-password-error" : ""}`}
              placeholder={t("forms.modal.passwordPlaceholder")}
              className="h-12 w-full rounded-xl border border-[#173d2b]/20 bg-white pl-10 pr-12 text-base font-semibold text-[#173d2b] outline-none transition placeholder:text-[#597064]/55 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 disabled:opacity-60"
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
              <span>
                {error} {t("forms.modal.retryHint")}
              </span>
            </p>
          )}

          <div className="mt-5 flex flex-col-reverse gap-2.5 sm:flex-row">
            <button
              type="button"
              onClick={onCancel}
              disabled={busy}
              className="h-12 flex-1 rounded-xl border border-[#173d2b]/15 bg-white text-sm font-black text-[#173d2b] transition hover:border-[#173d2b]/30 hover:bg-[#f8f3ea] disabled:opacity-50"
            >
              {t("common.actions.cancel")}
            </button>
            <button
              disabled={busy || !password}
              className="flex h-12 flex-[1.4] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 px-5 text-sm font-black text-white shadow-[0_8px_20px_rgba(234,88,12,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(234,88,12,0.3)] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? <LoaderCircle className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
              {busy ? t("forms.modal.confirming") : t("common.actions.confirm")}
            </button>
          </div>

          <p className="mt-4 text-center text-[11px] leading-4 text-[#597064]">{t("workspace.confirm.secureNote")}</p>
        </div>
      </form>
    </div>
  );
}
