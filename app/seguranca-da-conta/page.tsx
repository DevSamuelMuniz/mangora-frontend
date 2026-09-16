"use client";

import { useLocale, useT } from "@/i18n/provider";
import Link from "next/link";
import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import QRCode from "qrcode";
import { CheckCircle2, Copy, Download, KeyRound, LoaderCircle, MailCheck, ShieldCheck } from "lucide-react";
import BrandLogo from "@/components/brand/BrandLogo";
import { apiRequest } from "@/lib/api/client";

type SecurityStatus = { email: string; emailVerified: boolean; mfaEnabled: boolean; mfaVerified: boolean; mfaRequired: boolean; nextStep: "email" | "enroll" | "mfa" | null; recoveryCodesRemaining: number; configured: boolean };
type Setup = { secret: string; uri: string };

export default function AccountSecurityPage() {
  const t = useT();
  const locale = useLocale();
  const [status, setStatus] = useState<SecurityStatus | null>(null);
  const [setup, setSetup] = useState<Setup | null>(null);
  const [recovery, setRecovery] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
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
  function downloadRecoveryCodes() {
    const content = [t("accountSecurity.recoveryFileTitle"), "", t("accountSecurity.recoveryFileHint"), "", ...recovery, "", t("accountSecurity.recoveryFileGenerated", { date: new Date().toLocaleString(locale) })].join("\r\n");
    const url = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "mangora-codigos-de-recuperacao.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  if (!status) return <main className="grid min-h-screen place-items-center bg-[#fff8ea]"><LoaderCircle className="size-8 animate-spin text-[#ff6b1a]" /></main>;
  return <main className="min-h-screen bg-[#fff8ea] px-4 py-8 text-[#123d2b] sm:py-14"><div className="mx-auto max-w-xl"><Link href="/"><BrandLogo className="mx-auto h-10" /></Link><section className="mt-8 rounded-[2rem] border-2 border-[#123d2b] bg-white p-6 shadow-[7px_8px_0_#ffb21a] sm:p-9"><div className="flex gap-4"><span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#dff4e7] text-[#147a45]"><ShieldCheck /></span><div><p className="text-xs font-black uppercase tracking-[.16em] text-[#ff6b1a]">{t("accountSecurity.eyebrow")}</p><h1 className="mt-1 text-3xl font-black">{t("accountSecurity.title")}</h1><p className="mt-2 text-sm text-[#597064]">{t("accountSecurity.subtitle")}</p></div></div>
  {!status.configured && <Alert error>{t("accountSecurity.serverKeyMissing")}</Alert>}{error && <Alert error>{error}</Alert>}{message && <Alert>{message}</Alert>}
  {status.nextStep === "email" && <div className="mt-7"><Step icon={MailCheck} title={t("accountSecurity.emailTitle")} text={t("accountSecurity.emailText", { email: status.email })} /><button disabled={busy} onClick={() => void sendEmail()} className="button mt-5">{t("accountSecurity.sendCode")}</button><form onSubmit={verify} className="mt-4 flex gap-2"><CodeInput length={8} /><button disabled={busy} className="button-secondary">Confirmar</button></form></div>}
  {!status.mfaEnabled && !setup && status.nextStep !== "email" && <form onSubmit={begin} className="mt-7"><Step icon={KeyRound} title={t("accountSecurity.mfaSetupTitle")} text={t("accountSecurity.mfaSetupText")} /><input name="password" type="password" required autoComplete="current-password" placeholder={t("accountSecurity.currentPasswordPlaceholder")} className="input mt-5" /><button disabled={busy || !status.configured} className="button mt-3">Gerar chave do autenticador</button><Link href="/dashboard" className="mt-4 block text-center text-xs font-bold text-[#597064]">Continuar sem ativar</Link></form>}
  {setup && !recovery.length && <form onSubmit={confirm} className="mt-7"><Step icon={KeyRound} title={t("accountSecurity.keyTitle")} text={t("accountSecurity.keyText")} /><MfaQrCode uri={setup.uri} /><p className="mt-4 text-[11px] font-black uppercase tracking-[.12em] text-[#597064]">{t("accountSecurity.manualKey")}</p><div className="mt-2 flex items-center gap-2 rounded-xl bg-[#fff8ea] p-3"><code className="min-w-0 flex-1 break-all text-xs font-bold">{setup.secret}</code><button type="button" aria-label="Copiar chave" onClick={() => void navigator.clipboard.writeText(setup.secret)}><Copy className="size-4" /></button></div><CodeInput length={6} /><TrustDeviceOption /><button disabled={busy} className="button mt-3">Ativar autenticação em duas etapas</button></form>}
  {status.nextStep === "mfa" && <form onSubmit={confirm} className="mt-7"><Step icon={KeyRound} title={t("accountSecurity.codeTitle")} text={t("accountSecurity.codeText")} /><CodeInput /><TrustDeviceOption /><button disabled={busy} className="button mt-3">{t("accountSecurity.verifyAndContinue")}</button></form>}
  {recovery.length > 0 && <div className="mt-7"><Step icon={CheckCircle2} title={t("accountSecurity.enabledTitle")} text={t("accountSecurity.enabledText")} /><pre className="mt-4 grid grid-cols-1 gap-2 rounded-xl bg-[#123d2b] p-4 text-center text-xs text-white sm:grid-cols-2">{recovery.join("\n")}</pre><button type="button" onClick={downloadRecoveryCodes} className="button-secondary mt-4 flex w-full items-center justify-center gap-2"><Download className="size-4" />{t("accountSecurity.downloadCodes")}</button><button onClick={() => window.location.replace("/dashboard")} className="button mt-4">{t("accountSecurity.savedCodes")}</button></div>}
  {status.nextStep === null && status.mfaEnabled && !recovery.length && <div className="mt-7 text-center"><CheckCircle2 className="mx-auto size-10 text-[#147a45]" /><p className="mt-3 font-black">Conta protegida e liberada.</p><Link href="/dashboard" className="button mt-5 inline-flex items-center justify-center">Ir ao painel</Link></div>}
  </section></div></main>;
}

function Step({ icon: Icon, title, text }: { icon: typeof KeyRound; title: string; text: string }) { return <div><div className="flex items-center gap-2 font-black"><Icon className="size-5 text-[#ff6b1a]" />{title}</div><p className="mt-2 text-sm leading-6 text-[#597064]">{text}</p></div>; }
function CodeInput({ length }: { length?: number }) { const t = useT(); return <input name="code" required minLength={length ?? 6} maxLength={32} autoComplete="one-time-code" inputMode={length ? "numeric" : "text"} placeholder={t("accountSecurity.codePlaceholder")} className="input mt-3" />; }
function Alert({ children, error = false }: { children: React.ReactNode; error?: boolean }) { return <div className={`mt-5 rounded-xl border-2 px-4 py-3 text-xs font-bold ${error ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-700"}`}>{children}</div>; }
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
