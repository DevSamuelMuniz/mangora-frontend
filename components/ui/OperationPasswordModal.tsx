"use client";

import { useId, useState, type FormEvent } from "react";
import { Eye, EyeOff, KeyRound, LoaderCircle } from "lucide-react";
import { useT } from "@/i18n/provider";
import ModalDialog from "./ModalDialog";

type Props = {
  open: boolean;
  action?: string | null;
  message?: string | null;
  error?: string | null;
  credentialType?: "password" | "pin";
  busy?: boolean;
  onSubmit: (password: string) => void;
  onCancel: () => void;
};

export default function OperationPasswordModal({ open, action, message, error, credentialType = "password", busy = false, onSubmit, onCancel }: Props) {
  const t = useT();
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const id = useId();
  const pin = credentialType === "pin";
  const valid = pin ? /^\d{6}$/.test(password) : Boolean(password);
  if (!open) return null;
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!busy && valid) onSubmit(password);
  }
  return <ModalDialog title={pin ? t("settings.operationPin.promptTitle") : t("forms.modal.confirmWithPassword")} onClose={onCancel} busy={busy}>
    <form noValidate onSubmit={submit} className="space-y-4">
      {action && <p className="text-sm font-bold text-slate-800">{action}</p>}
      <p id={`${id}-help`} className="text-sm leading-6 text-slate-600">{pin ? t("settings.operationPin.promptHint") : message || t("workspace.confirm.passwordHint")}</p>
      <div>
        <label htmlFor={id} className="mb-2 block text-xs font-bold text-slate-700">{pin ? t("settings.operationPin.passwordLabel") : t("forms.modal.passwordLabel")}</label>
        <div className="relative">
          <KeyRound aria-hidden="true" className="pointer-events-none absolute left-3 top-3.5 size-4 text-orange-600" />
          <input id={id} type={visible ? "text" : "password"} autoComplete={pin ? "off" : "current-password"} inputMode={pin ? "numeric" : undefined} maxLength={pin ? 6 : 128} pattern={pin ? "[0-9]{6}" : undefined} value={password} onChange={event => setPassword(pin ? event.target.value.replace(/\D/g, "").slice(0, 6) : event.target.value)} disabled={busy} aria-invalid={Boolean(error)} aria-describedby={`${id}-help${error ? ` ${id}-error` : ""}`} className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-12 text-base text-slate-950 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 disabled:opacity-50" />
          <button type="button" disabled={busy} onClick={() => setVisible(value => !value)} aria-label={visible ? t("forms.modal.hidePassword") : t("forms.modal.showPassword")} aria-pressed={visible} className="absolute right-1 top-0.5 grid size-10 cursor-pointer place-items-center rounded-lg text-slate-500 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-orange-600">{visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>
        </div>
      </div>
      {error && <p id={`${id}-error`} role="alert" className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700">{error}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" disabled={busy} onClick={onCancel} className="h-11 cursor-pointer rounded-xl border border-slate-200 px-4 text-xs font-bold text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-orange-600 disabled:cursor-wait disabled:opacity-50">{t("common.actions.cancel")}</button>
        <button disabled={busy || !valid} className="inline-flex h-11 min-w-28 cursor-pointer items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 text-xs font-bold text-white hover:bg-orange-700 focus-visible:outline-2 focus-visible:outline-orange-600 disabled:cursor-not-allowed disabled:opacity-50">{busy && <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />}{t("settings.operationPin.authorize")}</button>
      </div>
    </form>
  </ModalDialog>;
}
