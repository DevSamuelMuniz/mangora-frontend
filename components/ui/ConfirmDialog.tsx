"use client";

import { ReactNode, useEffect, useRef } from "react";
import { AlertTriangle, LoaderCircle, X } from "lucide-react";

import { useT } from "@/i18n/provider";

type ConfirmDialogProps = {
  open: boolean;
  title?: string;
  description?: string;
  /** Texto que explica a consequência (padrão: aviso de ação irreversível). */
  note?: string | null;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "neutral";
  busy?: boolean;
  children?: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * Confirmação controlada — substitui os `window.confirm`.
 *
 * Mesma linguagem visual dos demais modais do sistema (verde + laranja),
 * com `role="dialog"`, foco no botão de confirmar, `Esc` para cancelar e
 * bloqueio do scroll do body enquanto estiver aberto.
 */
export default function ConfirmDialog({
  open,
  title,
  description,
  note,
  confirmLabel,
  cancelLabel,
  tone = "danger",
  busy = false,
  children,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const t = useT();
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const focus = window.setTimeout(() => confirmRef.current?.focus(), 40);
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

  const accent = tone === "danger" ? "bg-red-500 shadow-[0_0_0_5px_rgba(239,68,68,0.15)]" : "bg-orange-500 shadow-[0_0_0_5px_rgba(249,115,22,0.15)]";

  return (
    <div className="fixed inset-0 z-[85] flex items-end justify-center bg-[#123d2b]/45 backdrop-blur-sm sm:items-center sm:p-5">
      <button type="button" aria-label={cancelLabel ?? t("common.actions.cancel")} onClick={onCancel} className="absolute inset-0 cursor-default" tabIndex={-1} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="relative max-h-[96vh] w-full overflow-y-auto rounded-t-[1.5rem] border border-[#173d2b]/15 bg-[#fffdf8] shadow-[0_20px_55px_rgba(23,61,43,0.2)] sm:max-h-[92vh] sm:max-w-md sm:rounded-[1.5rem]"
      >
        <div className="flex items-center gap-4 border-b border-[#173d2b]/10 bg-[#173d2b] px-5 py-4 text-white">
          <span className={`grid size-11 shrink-0 place-items-center rounded-full ${accent}`}>
            <AlertTriangle className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="confirm-dialog-title" className="text-lg font-black">
              {title ?? t("common.confirm.title")}
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label={cancelLabel ?? t("common.actions.cancel")}
            className="grid size-9 shrink-0 place-items-center rounded-xl border border-white/15 text-white/80 transition hover:border-white/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="p-5">
          {description && <p className="text-sm font-semibold leading-6 text-[#173d2b]">{description}</p>}
          {children}
          <p className="mt-3 text-xs leading-5 text-[#597064]">{note ?? t("common.confirm.irreversible")}</p>

          <div className="mt-5 flex flex-col-reverse gap-2.5 sm:flex-row">
            <button
              type="button"
              onClick={onCancel}
              disabled={busy}
              className="h-12 flex-1 rounded-xl border border-[#173d2b]/15 bg-white text-sm font-black text-[#173d2b] transition hover:border-[#173d2b]/30 hover:bg-[#f8f3ea] disabled:opacity-50"
            >
              {cancelLabel ?? t("common.actions.cancel")}
            </button>
            <button
              ref={confirmRef}
              type="button"
              onClick={onConfirm}
              disabled={busy}
              className="flex h-12 flex-[1.2] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 px-5 text-sm font-black text-white shadow-[0_8px_20px_rgba(234,88,12,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(234,88,12,0.3)] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy && <LoaderCircle className="size-4 animate-spin" />}
              {confirmLabel ?? t("common.actions.confirm")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
