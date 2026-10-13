"use client";

import { useLocale, useT } from "@/i18n/provider";
import Link from "next/link";
import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import QRCode from "qrcode";
import { CheckCircle2, Copy, Download, KeyRound, LoaderCircle, MailCheck, ShieldCheck, ShieldOff, Smartphone } from "lucide-react";
import BrandLogo from "@/components/brand/BrandLogo";
import { apiRequest } from "@/lib/api/client";

type SecurityStatus = { email: string; emailVerified: boolean; mfaEnabled: boolean; mfaVerified: boolean; mfaRequired: boolean; nextStep: "email" | "enroll" | "mfa" | null; recoveryCodesRemaining: number; configured: boolean };
type Setup = { secret: string; uri: string };

export default function AccountSecurity({ embedded = false }: { embedded?: boolean }) {
  const t = useT();
  const locale = useLocale();
  const [status, setStatus] = useState<SecurityStatus | null>(null);
  const [setup, setSetup] = useState<Setup | null>(null);
  const [recovery, setRecovery] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [disabling, setDisabling] = useState(false);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    try { setStatus(await apiRequest<SecurityStatus>("/auth/security")); }
    catch { window.location.replace("/login"); }
  }
  useEffect(() => {
    let active = true;
    apiRequest<SecurityStatus>("/auth/security").then((value) => { if (active) setStatus(value); }).catch(() => window.location.replace("/login"));
    return () => { active = false; };
  }, []);

  async function action(path: string, body?: object) {
    setBusy(true); setError(""); setMessage("");
    try { const result = await apiRequest<Record<string, unknown>>(path, { method: "POST", body: JSON.stringify(body ?? {}) }); await refresh(); return result; }
    catch (cause) { setError(cause instanceof Error ? cause.message : t("accountSecurity.error")); return null; }
    finally { setBusy(false); }
  }

  async function sendEmail() { if (await action("/auth/security/email/send")) setMessage(t("accountSecurity.codeSent")); }
  async function verify(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const code = String(new FormData(event.currentTarget).get("code") ?? ""); if (await action("/auth/security/email/verify", { code })) setMessage("E-mail confirmado."); }
  async function begin(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const password = String(new FormData(event.currentTarget).get("password") ?? ""); const result = await action("/auth/security/mfa/setup", { password }); if (result) setSetup(result as Setup); }
  async function confirm(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); const code = String(data.get("code") ?? ""); const result = await action(setup ? "/auth/security/mfa/enable" : "/auth/security/mfa/challenge", { code, trustDevice: data.get("trustDevice") === "on" }); if (result?.recoveryCodes) setRecovery(result.recoveryCodes as string[]); else if (result) window.location.replace("/dashboard"); }
  async function disable(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (await action("/auth/security/mfa/disable", { password: String(data.get("password") ?? ""), code: String(data.get("code") ?? "").trim() })) {
      setDisabling(false); setSetup(null); setRecovery([]);
      setMessage(t("accountSecurity.disabledSuccess"));
    }
  }
  function downloadRecoveryCodes() {
    const content = [t("accountSecurity.recoveryFileTitle"), "", t("accountSecurity.recoveryFileHint"), "", ...recovery, "", t("accountSecurity.recoveryFileGenerated", { date: new Date().toLocaleString(locale) })].join("\r\n");
    const url = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "mangora-codigos-de-recuperacao.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  if (!status) return <div className="grid min-h-32 place-items-center" role="status"><LoaderCircle className="size-8 animate-spin text-[#ff6b1a]" /></div>;
  const content = <section className={embedded ? "overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" : "mt-8 rounded-[2rem] border-2 border-[#123d2b] bg-white p-6 shadow-[7px_8px_0_#ffb21a] sm:p-9"}>
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex items-start gap-3.5">
        <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${status.mfaEnabled ? "bg-emerald-100 text-emerald-700" : "bg-orange-50 text-orange-600"}`}><ShieldCheck className="size-5" /></span>
        <div><p className="text-[10px] font-bold uppercase tracking-[.14em] text-slate-400">{t("accountSecurity.eyebrow")}</p><h2 className="mt-1 text-base font-bold tracking-tight text-slate-950">{t(embedded ? "accountSecurity.settingsTitle" : "accountSecurity.title")}</h2><p className="mt-1 text-xs leading-5 text-slate-500">{t("accountSecurity.subtitle")}</p></div>
      </div>
      {embedded && <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${status.mfaEnabled ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200" : "bg-slate-100 text-slate-600"}`}><span className={`size-1.5 rounded-full ${status.mfaEnabled ? "bg-emerald-500" : "bg-slate-400"}`} />{t(status.mfaEnabled ? "accountSecurity.enabledStatus" : "accountSecurity.offStatus")}</span>}
    </div>
    {embedded && !status.mfaEnabled && <p className="mt-5 rounded-xl bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-500">{t("accountSecurity.disabledStatus")}</p>}
  {!status.configured && <Alert error>{t("accountSecurity.serverKeyMissing")}</Alert>}{error && <Alert error>{error}</Alert>}{message && <Alert>{message}</Alert>}
  {status.nextStep === "email" && <div className="mt-7"><Step icon={MailCheck} title={t("accountSecurity.emailTitle")} text={t("accountSecurity.emailText", { email: status.email })} /><button disabled={busy} onClick={() => void sendEmail()} className="button mt-5">{t("accountSecurity.sendCode")}</button><form onSubmit={verify} className="mt-4 flex gap-2"><CodeInput length={8} /><button disabled={busy} className="button-secondary">Confirmar</button></form></div>}
  {embedded && !status.mfaEnabled && !setup && status.nextStep !== "email" && <form onSubmit={begin} className="mt-5 max-w-xl"><Step icon={KeyRound} title={t("accountSecurity.mfaSetupTitle")} text={t("accountSecurity.mfaSetupText")} /><input name="password" type="password" required autoComplete="current-password" placeholder={t("accountSecurity.currentPasswordPlaceholder")} className="input mt-5" /><button disabled={busy || !status.configured} className="button mt-3">Gerar chave do autenticador</button></form>}
  {!embedded && !status.mfaEnabled && status.nextStep === null && <div className="mt-7"><Link href="/dashboard" className="button inline-flex items-center justify-center">Ir ao painel</Link><Link href="/configuracoes?secao=security" className="mt-4 block text-center text-xs font-bold text-[#597064]">{t("accountSecurity.settingsTitle")}</Link></div>}
  {setup && !recovery.length && <form onSubmit={confirm} className="mt-7"><Step icon={KeyRound} title={t("accountSecurity.keyTitle")} text={t("accountSecurity.keyText")} /><MfaQrCode uri={setup.uri} /><p className="mt-4 text-[11px] font-black uppercase tracking-[.12em] text-[#597064]">{t("accountSecurity.manualKey")}</p><div className="mt-2 flex items-center gap-2 rounded-xl bg-[#fff8ea] p-3"><code className="min-w-0 flex-1 break-all text-xs font-bold">{setup.secret}</code><button type="button" aria-label="Copiar chave" onClick={() => void navigator.clipboard.writeText(setup.secret)}><Copy className="size-4" /></button></div><CodeInput length={6} /><TrustDeviceOption /><button disabled={busy} className="button mt-3">Ativar autenticação em duas etapas</button></form>}
  {status.nextStep === "mfa" && <form onSubmit={confirm} className="mt-7"><Step icon={KeyRound} title={t("accountSecurity.codeTitle")} text={t("accountSecurity.codeText")} /><CodeInput /><TrustDeviceOption /><button disabled={busy} className="button mt-3">{t("accountSecurity.verifyAndContinue")}</button></form>}
  {recovery.length > 0 && <div className="mt-7"><Step icon={CheckCircle2} title={t("accountSecurity.enabledTitle")} text={t("accountSecurity.enabledText")} /><pre className="mt-4 grid grid-cols-1 gap-2 rounded-xl bg-[#123d2b] p-4 text-center text-xs text-white sm:grid-cols-2">{recovery.join("\n")}</pre><button type="button" onClick={downloadRecoveryCodes} className="button-secondary mt-4 flex w-full items-center justify-center gap-2"><Download className="size-4" />{t("accountSecurity.downloadCodes")}</button><button onClick={() => embedded ? (setRecovery([]), setSetup(null)) : window.location.replace("/dashboard")} className="button mt-4">{t("accountSecurity.savedCodes")}</button></div>}
  {status.nextStep === null && status.mfaEnabled && !recovery.length && <div className="mt-5 flex flex-col gap-4 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex items-center gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-lg bg-white text-emerald-700 ring-1 ring-emerald-100"><Smartphone className="size-5" /></span><div><p className="text-sm font-bold text-slate-800">{t("accountSecurity.authenticatorConnected")}</p><p className="mt-1 text-xs leading-5 text-slate-500">{t("accountSecurity.recoveryRemaining", { count: status.recoveryCodesRemaining })}</p></div></div>
    {embedded ? <button type="button" disabled={busy || disabling} onClick={() => { setDisabling(true); setError(""); setMessage(""); }} aria-expanded={disabling} aria-controls="disable-mfa-form" className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 disabled:opacity-50"><ShieldOff className="size-4" />{t("accountSecurity.disableAction")}</button> : <Link href="/dashboard" className="button inline-flex items-center justify-center">Ir ao painel</Link>}
  </div>}
  {embedded && disabling && status.mfaEnabled && <form id="disable-mfa-form" onSubmit={disable} className="mt-4 rounded-xl border border-red-200 bg-red-50/40 p-4 sm:p-5">
    <h3 className="text-sm font-bold text-slate-900">{t("accountSecurity.disableTitle")}</h3><p className="mt-1.5 max-w-2xl text-xs leading-5 text-slate-600">{t("accountSecurity.disableHint")}</p>
    <div className="mt-4 grid max-w-2xl gap-4 sm:grid-cols-2"><label className="text-xs font-semibold text-slate-700">{t("accountSecurity.currentPasswordPlaceholder")}<input name="password" type="password" required minLength={8} maxLength={128} autoComplete="current-password" autoFocus disabled={busy} className="input mt-2" /></label><label className="text-xs font-semibold text-slate-700">{t("accountSecurity.codeTitle")}<input name="code" required minLength={6} maxLength={32} autoComplete="one-time-code" disabled={busy} placeholder={t("accountSecurity.disableCodeHint")} className="input mt-2" /></label></div>
    <div className="mt-5 flex flex-wrap justify-end gap-2"><button type="button" disabled={busy} onClick={() => { setDisabling(false); setError(""); }} className="min-h-10 rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 disabled:opacity-50">{t("accountSecurity.cancel")}</button><button disabled={busy} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-xs font-bold text-white hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 disabled:opacity-50">{busy && <LoaderCircle className="size-4 animate-spin" />}{t("accountSecurity.disableConfirm")}</button></div>
  </form>}
  </section>;
  if (embedded) return content;
  return <main className="min-h-screen bg-[#fff8ea] px-4 py-8 text-[#123d2b] sm:py-14"><div className="mx-auto max-w-xl"><Link href="/"><BrandLogo className="mx-auto h-10" /></Link>{content}</div></main>;
}

function Step({ icon: Icon, title, text }: { icon: typeof KeyRound; title: string; text: string }) { return <div><div className="flex items-center gap-2 font-black"><Icon className="size-5 text-[#ff6b1a]" />{title}</div><p className="mt-2 text-sm leading-6 text-[#597064]">{text}</p></div>; }
function CodeInput({ length }: { length?: number }) { const t = useT(); return <input name="code" required minLength={length ?? 6} maxLength={32} autoComplete="one-time-code" inputMode={length ? "numeric" : "text"} placeholder={t("accountSecurity.codePlaceholder")} className="input mt-3" />; }
function Alert({ children, error = false }: { children: React.ReactNode; error?: boolean }) { return <div role={error ? "alert" : "status"} className={`mt-5 rounded-xl border-2 px-4 py-3 text-xs font-bold ${error ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-700"}`}>{children}</div>; }
function TrustDeviceOption() { const t = useT(); return <label className="mt-4 flex cursor-pointer items-start gap-2.5 rounded-xl border border-[#123d2b]/10 bg-[#fff8ea] p-3 text-xs font-bold text-[#315847]"><input type="checkbox" name="trustDevice" defaultChecked className="mt-0.5 size-4 shrink-0 accent-[#147a45]" /><span>{t("accountSecurity.trustDevice")}<span className="mt-1 block text-[10px] font-medium leading-4 text-[#597064]">{t("accountSecurity.trustDeviceHint")}</span></span></label>; }

function MfaQrCode({ uri }: { uri: string }) {
  const [source, setSource] = useState("");
  useEffect(() => {
    let active = true;
    QRCode.toDataURL(uri, { width: 240, margin: 2, errorCorrectionLevel: "M", color: { dark: "#123d2b", light: "#ffffff" } }).then((value) => { if (active) setSource(value); });
    return () => { active = false; };
  }, [uri]);
  return <div className="mt-5 grid min-h-64 place-items-center rounded-2xl border-2 border-[#123d2b]/10 bg-white p-3">{source ? <Image src={source} width={240} height={240} unoptimized alt="QR Code para cadastrar a Mangora no aplicativo autenticador" className="size-60 max-w-full" /> : <LoaderCircle className="size-7 animate-spin text-[#ff6b1a]" />}</div>;
}
