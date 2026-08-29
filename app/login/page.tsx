"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, ArrowRight, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import AuthVisualPanel from "@/components/auth/AuthVisualPanel";
import BrandLogo from "@/components/brand/BrandLogo";
import { apiRequest } from "@/lib/api/client";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    const loginData = {
      email: String(formData.get("email") ?? "").trim().toLowerCase(),
      password: String(formData.get("password") ?? ""),
      rememberMe: formData.get("remember") === "on",
    };

    try {
      await apiRequest("/auth/login", { method: "POST", body: JSON.stringify(loginData) });
      window.location.replace("/dashboard");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Não foi possível realizar o login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fff8ea] font-[family-name:var(--font-manrope)] text-[#123d2b]">
      <div className="grid min-h-screen lg:grid-cols-[0.92fr_1.08fr] xl:grid-cols-[1.02fr_0.98fr]">
        <AuthVisualPanel variant="login" />

        <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-8 sm:px-8 lg:px-10 xl:px-16">
          <div className="absolute -right-20 top-12 size-60 rounded-full bg-[#ffb21a]/15 blur-3xl" />
          <div className="absolute bottom-0 left-0 size-52 rounded-full bg-[#147a45]/10 blur-3xl" />
          <div className="relative w-full max-w-[30rem]">
            <div className="mb-9 flex items-center justify-between lg:hidden">
              <Link href="/" aria-label="Página inicial da Mangora"><BrandLogo className="h-9" priority /></Link>
              <Link href="/" aria-label="Voltar para o início" className="flex size-11 items-center justify-center rounded-xl border-2 border-[#123d2b]/15 bg-white text-[#123d2b]"><ArrowLeft className="size-4" /></Link>
            </div>

            <div className="rounded-[2rem] border-2 border-[#123d2b] bg-white p-6 shadow-[7px_8px_0_#ffb21a] sm:p-9">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ff6b1a]">Área do cliente</p>
                  <h1 className="mt-3 font-[family-name:var(--font-bricolage)] text-4xl font-extrabold leading-none tracking-[-0.045em] text-[#123d2b] sm:text-5xl">Entre e siga o ritmo.</h1>
                </div>
                <span className="hidden size-12 shrink-0 rotate-6 items-center justify-center rounded-2xl bg-[#dff4e7] text-[#147a45] sm:flex"><ShieldCheck className="size-6" /></span>
              </div>
              <p className="mt-4 text-sm font-medium leading-6 text-[#597064]">Seu painel está pronto para mais um dia de trabalho.</p>

              <form onSubmit={handleSubmit} className="mt-7 space-y-4">
                <FieldLabel htmlFor="email" className="pb-4">E-mail</FieldLabel>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#6a7d73]" />
                  <input id="email" name="email" type="email" required autoComplete="email" placeholder="voce@empresa.com" className="h-13 w-full rounded-xl border-2 border-[#123d2b]/15 bg-[#fffdf7] pl-11 pr-4 text-sm font-semibold text-[#123d2b] outline-none transition placeholder:font-medium placeholder:text-[#789083] focus:border-[#ff6b1a] focus:bg-white focus:ring-4 focus:ring-[#ffb21a]/20" />
                </div>

                <div className="flex items-center justify-between gap-4 pt-1">
                  <FieldLabel htmlFor="password">Senha</FieldLabel>
                  <Link href="/recuperar-senha" className="text-xs font-extrabold text-[#147a45] transition hover:text-[#ff6b1a]">Esqueci minha senha</Link>
                </div>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#6a7d73]" />
                  <input id="password" name="password" type={showPassword ? "text" : "password"} required autoComplete="current-password" placeholder="Digite sua senha" className="h-13 w-full rounded-xl border-2 border-[#123d2b]/15 bg-[#fffdf7] pl-11 pr-12 text-sm font-semibold text-[#123d2b] outline-none transition placeholder:font-medium placeholder:text-[#789083] focus:border-[#ff6b1a] focus:bg-white focus:ring-4 focus:ring-[#ffb21a]/20" />
                  <button type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"} className="absolute right-2.5 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-[#6a7d73] transition hover:bg-[#fff0dd] hover:text-[#ff6b1a]">{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>
                </div>

                <label className="flex cursor-pointer items-center gap-2.5 pt-1 text-xs font-semibold text-[#597064]"><input type="checkbox" name="remember" className="size-4 rounded border-[#123d2b]/30 accent-[#147a45]" />Continuar conectado neste dispositivo</label>
                {error && <div role="alert" className="rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-700">{error}</div>}
                <button type="submit" disabled={loading} className="group flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-[#ff6b1a] px-5 text-sm font-extrabold text-white shadow-[0_5px_0_#c9460b] transition hover:-translate-y-0.5 hover:shadow-[0_7px_0_#c9460b] focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#ffb21a] disabled:cursor-not-allowed disabled:opacity-65 disabled:hover:translate-y-0">{loading ? <><LoaderCircle className="size-4 animate-spin" />Entrando...</> : <>Entrar na Mangora<ArrowRight className="size-4 transition group-hover:translate-x-1" /></>}</button>
              </form>

              <div className="my-6 flex items-center gap-3"><div className="h-px flex-1 bg-[#123d2b]/10" /><span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#789083]">Novo por aqui?</span><div className="h-px flex-1 bg-[#123d2b]/10" /></div>
              <Link href="/cadastro" className="flex h-12 w-full items-center justify-center rounded-xl border-2 border-[#123d2b] bg-[#fff8ea] text-sm font-extrabold text-[#123d2b] transition hover:-translate-y-0.5 hover:bg-[#ffb21a]">Criar minha conta</Link>
            </div>
            <p className="mt-6 text-center text-[11px] font-medium leading-5 text-[#6a7d73]">Ao entrar, você concorda com nossos <Link href="/termos" className="font-extrabold hover:text-[#ff6b1a]">Termos</Link> e com a <Link href="/privacidade" className="font-extrabold hover:text-[#ff6b1a]">Política de Privacidade</Link>.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
function FieldLabel({ htmlFor, children, className = "" }: { htmlFor: string; children: React.ReactNode; className?: string }) {
  return <label htmlFor={htmlFor} className={`mb-[-0.5rem] block text-xs font-extrabold text-[#315847] ${className}`}>{children}</label>;
}
