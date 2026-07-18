"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { CheckCircle2, KeyRound, LayoutDashboard, LoaderCircle } from "lucide-react";
import { apiRequest } from "@/lib/api/client";

export default function ResetPasswordPage() {
  const token = "validated-on-submit";
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const data = new FormData(event.currentTarget);
    const password = String(data.get("password") ?? ""); const confirmation = String(data.get("confirmation") ?? "");
    if (password.length < 8) return setError("A senha deve ter ao menos 8 caracteres.");
    if (password !== confirmation) return setError("A confirmação da senha não confere.");
    const rawToken = new URLSearchParams(window.location.search).get("token") ?? "";
    if (!rawToken) return setError("Link de redefinição inválido.");
    try { setLoading(true); setError(""); await apiRequest("/auth/password-reset/confirm", { method: "POST", body: JSON.stringify({ token: rawToken, newPassword: password }) }); setSuccess(true); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível redefinir a senha."); }
    finally { setLoading(false); }
  }
  return <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10"><div className="w-full max-w-md"><Link href="/" className="mx-auto flex w-fit items-center gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500"><LayoutDashboard className="size-5 text-white" /></span><span className="text-xl font-black text-slate-950">Gestão<span className="text-violet-600">+</span></span></Link><section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">{success ? <div className="text-center"><CheckCircle2 className="mx-auto size-12 text-emerald-600" /><h1 className="mt-5 text-2xl font-black text-slate-950">Senha redefinida</h1><p className="mt-2 text-sm text-slate-500">Todas as sessões anteriores foram encerradas.</p><Link href="/login" className="mt-6 flex h-11 items-center justify-center rounded-xl bg-violet-600 text-sm font-bold text-white">Entrar com a nova senha</Link></div> : <><KeyRound className="size-10 text-violet-600" /><h1 className="mt-5 text-2xl font-black text-slate-950">Crie uma nova senha</h1><p className="mt-2 text-sm text-slate-500">O link é pessoal, de uso único e expira em 30 minutos.</p><form onSubmit={submit} className="mt-6 space-y-4"><label className="block text-xs font-bold text-slate-700">Nova senha<input name="password" type="password" required minLength={8} autoComplete="new-password" className={inputClass} /></label><label className="block text-xs font-bold text-slate-700">Confirmar nova senha<input name="confirmation" type="password" required minLength={8} autoComplete="new-password" className={inputClass} /></label>{error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">{error}</div>}<button disabled={loading || !token} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-sm font-bold text-white disabled:opacity-60">{loading ? <><LoaderCircle className="size-4 animate-spin" />Redefinindo...</> : "Redefinir senha"}</button></form></>}</section></div></main>;
}
const inputClass = "mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100";
