"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  LayoutDashboard,
  LoaderCircle,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { apiRequest } from "@/lib/api/client";

export default function PasswordRecoveryPage() {
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim().toLowerCase();

    try {
      setLoading(true); setError("");
      const result = await apiRequest<{ previewUrl?: string }>("/auth/password-reset/request", { method: "POST", body: JSON.stringify({ email }) });
      setPreviewUrl(result.previewUrl ?? ""); setSentTo(email);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível solicitar a recuperação."); }
    finally { setLoading(false); }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10">
      <div className="w-full max-w-md">
        <Link href="/" className="mx-auto flex w-fit items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 shadow-lg shadow-violet-200">
            <LayoutDashboard className="size-5 text-white" />
          </span>
          <span className="text-xl font-black text-slate-950">
            Gestão<span className="text-violet-600">+</span>
          </span>
        </Link>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">
          {sentTo ? (
            <div role="status" className="text-center">
              <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="size-7" />
              </span>
              <h1 className="mt-5 text-2xl font-black tracking-tight text-slate-950">
                Verifique seu e-mail
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Se existir uma conta para <strong className="text-slate-700">{sentTo}</strong>, enviaremos as instruções de recuperação.
              </p>
              <Link href="/login" className="mt-6 flex h-11 items-center justify-center rounded-xl bg-violet-600 text-sm font-bold text-white transition hover:bg-violet-700">
                Voltar para o login
              </Link>
              {previewUrl && <Link href={previewUrl} className="mt-3 flex h-11 items-center justify-center rounded-xl border border-amber-300 bg-amber-50 text-xs font-bold text-amber-800">Abrir link de desenvolvimento</Link>}
            </div>
          ) : (
            <>
              <span className="flex size-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                <ShieldCheck className="size-6" />
              </span>
              <h1 className="mt-5 text-2xl font-black tracking-tight text-slate-950">
                Recupere seu acesso
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Informe o e-mail da sua conta para receber as instruções de redefinição de senha.
              </p>

              <form onSubmit={handleSubmit} className="mt-6">
                <label htmlFor="recovery-email" className="mb-2 block text-xs font-bold text-slate-700">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input id="recovery-email" name="email" type="email" required autoComplete="email" placeholder="voce@empresa.com" className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100" />
                </div>
                <button type="submit" disabled={loading} className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70">
                  {loading ? <><LoaderCircle className="size-4 animate-spin" /> Enviando...</> : "Enviar instruções"}
                </button>
              </form>
              {error && <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">{error}</div>}
            </>
          )}
        </section>

        <Link href="/login" className="mx-auto mt-6 flex w-fit items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-violet-700">
          <ArrowLeft className="size-4" />
          Voltar para o login
        </Link>
      </div>
    </main>
  );
}
