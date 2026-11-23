"use client";

import { useState, type FormEvent } from "react";
import { Eye, EyeOff, KeyRound, LoaderCircle, Mail } from "lucide-react";
import { useT } from "@/i18n/provider";
import ModalDialog from "@/components/ui/ModalDialog";
import { useOperationPin, useSendOperationPinCode, useSetOperationPin, useVerifyOperationPinCode } from "@/features/settings/hooks/useOperationPin";

export default function OperationPinSettings() {
  const t = useT();
  const { data, error, isLoading, refetch } = useOperationPin();
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-center gap-3"><KeyRound aria-hidden="true" className="size-5 shrink-0 text-orange-600" /><h2 className="text-sm font-bold text-slate-950">{t("settings.operationPin.title")}</h2></div>
    <p className="mt-3 text-xs leading-5 text-slate-600">{t("settings.operationPin.description")}</p>
    {isLoading ? <p role="status" className="mt-4 inline-flex items-center gap-2 text-xs text-slate-500"><LoaderCircle className="size-4 animate-spin" />{t("settings.operationPin.loading")}</p> : error ? <div role="alert" className="mt-4 text-xs text-red-700">{error.message}<button type="button" onClick={() => void refetch()} className="ml-3 cursor-pointer underline">{t("settings.operationPin.retry")}</button></div> : data && <>
      <p className="mt-3 text-xs font-bold text-slate-800">{data.configured ? t("settings.operationPin.enabled") : t("settings.operationPin.notConfigured")}</p>
      {data.canManage ? <button type="button" onClick={() => { setSaved(false); setEditing(true); }} className="mt-4 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 text-xs font-bold text-orange-700 hover:bg-orange-100 focus-visible:outline-2 focus-visible:outline-orange-600"><Mail className="size-4" />{data.configured ? t("settings.operationPin.change") : t("settings.operationPin.create")}</button> : <p className="mt-3 text-xs text-slate-500">{t("settings.operationPin.ownerOnly")}</p>}
    </>}
    {saved && <p role="status" className="mt-4 rounded-xl bg-green-50 p-3 text-xs font-semibold text-green-700">{t("settings.operationPin.saved")}</p>}
    {editing && <OperationPinSetup onClose={() => setEditing(false)} onSaved={() => { setEditing(false); setSaved(true); }} />}
  </section>;
}

function OperationPinSetup({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const t = useT();
  const send = useSendOperationPinCode();
  const verify = useVerifyOperationPinCode();
  const save = useSetOperationPin();
  const [step, setStep] = useState<"send" | "code" | "password">("send");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");
  const busy = send.isPending || verify.isPending || save.isPending;

  async function sendCode() {
    if (busy) return;
    setError("");
    try {
      const response = await send.mutateAsync();
      setEmail(response.email); setCode(""); setStep("code");
    } catch (cause) { setError(cause instanceof Error ? cause.message : t("settings.operationPin.failed")); }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setError("");
    try {
      if (step === "code") {
        if (!/^\d{6}$/.test(code)) return setError(t("settings.operationPin.invalidCode"));
        const result = await verify.mutateAsync(code);
        setToken(result.verificationToken); setCode(""); setStep("password");
      } else if (step === "password") {
        if (!/^\d{6}$/.test(password)) return setError(t("settings.operationPin.invalidPassword"));
        if (password !== confirmation) return setError(t("settings.operationPin.mismatch"));
        await save.mutateAsync({ verificationToken: token, password });
        setToken(""); setPassword(""); setConfirmation(""); onSaved();
      }
    } catch (cause) { setError(cause instanceof Error ? cause.message : t("settings.operationPin.failed")); }
  }
  return <ModalDialog title={step === "password" ? t("settings.operationPin.newPassword") : t("settings.operationPin.verifyIdentity")} onClose={onClose} busy={busy}>
    {step === "send" ? <div className="space-y-4">
      <p className="text-sm leading-6 text-slate-600">{t("settings.operationPin.emailHint")}</p>
      {error && <p id="operation-pin-setup-error" role="alert" className="rounded-xl bg-red-50 p-3 text-xs text-red-700">{error}</p>}
      <div className="flex justify-end gap-2"><button type="button" onClick={onClose} disabled={busy} className={secondary}>{t("settings.operationPin.cancel")}</button><button type="button" onClick={() => void sendCode()} disabled={busy} className={primary}>{busy && <LoaderCircle className="size-4 animate-spin" />}{t("settings.operationPin.send")}</button></div>
    </div> : <form noValidate onSubmit={submit} className="space-y-4">
      <p id="operation-pin-setup-help" className="text-sm leading-6 text-slate-600">{step === "code" ? t("settings.operationPin.codeHint", { email }) : t("settings.operationPin.newPasswordHint")}</p>
      {step === "code" ? <div><label htmlFor="operation-pin-email-code" className={label}>{t("settings.operationPin.emailCodeLabel")}</label><input id="operation-pin-email-code" type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={event => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} disabled={busy} aria-describedby={`operation-pin-setup-help${error ? " operation-pin-setup-error" : ""}`} aria-invalid={Boolean(error)} className={input} /></div> : <>
        <div><label htmlFor="new-operation-pin" className={label}>{t("settings.operationPin.newPassword")}</label><input id="new-operation-pin" type={visible ? "text" : "password"} inputMode="numeric" autoComplete="new-password" maxLength={6} value={password} onChange={event => setPassword(event.target.value.replace(/\D/g, "").slice(0, 6))} disabled={busy} aria-describedby={`operation-pin-setup-help${error ? " operation-pin-setup-error" : ""}`} aria-invalid={Boolean(error)} className={input} /></div>
        <div><label htmlFor="confirm-operation-pin" className={label}>{t("settings.operationPin.confirmPassword")}</label><input id="confirm-operation-pin" type={visible ? "text" : "password"} inputMode="numeric" autoComplete="new-password" maxLength={6} value={confirmation} onChange={event => setConfirmation(event.target.value.replace(/\D/g, "").slice(0, 6))} disabled={busy} aria-invalid={Boolean(error)} aria-describedby={`operation-pin-setup-help${error ? " operation-pin-setup-error" : ""}`} className={input} /></div>
        <button type="button" disabled={busy} aria-pressed={visible} onClick={() => setVisible(value => !value)} className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl px-3 text-xs font-bold text-slate-600 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-orange-600">{visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}{visible ? t("settings.operationPin.hide") : t("settings.operationPin.show")}</button>
      </>}
      {error && <p id="operation-pin-setup-error" role="alert" className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700">{error}</p>}
      <div className="flex flex-wrap justify-end gap-2">
        {step === "code" && <button type="button" disabled={busy} onClick={() => void sendCode()} className={secondary}>{t("settings.operationPin.resend")}</button>}
        {step === "password" && <button type="button" disabled={busy} onClick={() => { setToken(""); setPassword(""); setConfirmation(""); setError(""); setStep("send"); }} className={secondary}>{t("settings.operationPin.restart")}</button>}
        <button type="button" disabled={busy} onClick={onClose} className={secondary}>{t("settings.operationPin.cancel")}</button>
        <button disabled={busy} className={primary}>{busy && <LoaderCircle className="size-4 animate-spin" />}{step === "code" ? t("settings.operationPin.verify") : t("settings.operationPin.save")}</button>
      </div>
    </form>}
  </ModalDialog>;
}

const input = "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-base text-slate-950 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 disabled:opacity-50";
const label = "mb-2 block text-xs font-bold text-slate-700";
const primary = "inline-flex h-11 min-w-28 cursor-pointer items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 text-xs font-bold text-white hover:bg-orange-700 focus-visible:outline-2 focus-visible:outline-orange-600 disabled:cursor-wait disabled:opacity-50";
const secondary = "h-11 cursor-pointer rounded-xl border border-slate-200 px-4 text-xs font-bold text-slate-600 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-orange-600 disabled:cursor-wait disabled:opacity-50";
