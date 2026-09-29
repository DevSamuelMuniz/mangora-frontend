"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
<<<<<<< HEAD
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Boxes,
  CheckCircle2,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Users,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import { apiRequest } from "@/lib/api/client";
import BrandLogo from "@/components/brand/BrandLogo";

const benefits = [
  {
    icon: BarChart3,
    title: "Indicadores em tempo real",
    description: "Acompanhe vendas e resultados.",
  },
  {
    icon: Boxes,
    title: "Estoque organizado",
    description: "Controle entradas e saídas.",
  },
  {
    icon: WalletCards,
    title: "Financeiro simplificado",
    description: "Gerencie receitas e despesas.",
  },
];
=======
import { ArrowLeft, ArrowRight, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import AuthVisualPanel from "@/components/auth/AuthVisualPanel";
import BrandLogo from "@/components/brand/BrandLogo";
import LocaleSwitcher from "@/components/i18n/LocaleSwitcher";
import { useT } from "@/i18n/provider";
import { apiRequest } from "@/lib/api/client";
import { setUserProperties, track } from "@/lib/analytics";
import type { AuthSession } from "@/lib/auth/types";
>>>>>>> 0e59a660a5acf0b652a188ddf2e8ccc96de79e4d

export default function LoginPage() {
  const t = useT();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
<<<<<<< HEAD

    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);

=======
    setLoading(true);
    setError("");
    const formData = new FormData(event.currentTarget);
>>>>>>> 0e59a660a5acf0b652a188ddf2e8ccc96de79e4d
    const loginData = {
      email: String(formData.get("email") ?? "").trim().toLowerCase(),
      password: String(formData.get("password") ?? ""),
      rememberMe: formData.get("remember") === "on",
    };

    try {
<<<<<<< HEAD
      await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify(loginData),
      });
      router.push("/dashboard");
      router.refresh();
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Não foi possível realizar o login.",
      );
=======
      const session = await apiRequest<AuthSession>("/auth/login", { method: "POST", body: JSON.stringify(loginData) });
      track("login");
      setUserProperties({ logged_in: "true" });
      window.location.replace(session.security.nextStep ? "/seguranca-da-conta" : "/dashboard");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : t("publicPages.login.error"));
>>>>>>> 0e59a660a5acf0b652a188ddf2e8ccc96de79e4d
    } finally {
      setLoading(false);
    }
  }

  return (
<<<<<<< HEAD
    <main className="min-h-screen bg-slate-50 lg:h-screen lg:overflow-hidden">
      <div className="grid min-h-screen lg:h-screen lg:grid-cols-[0.95fr_1.05fr]">
        <PresentationSection />

        <section className="relative flex min-h-screen items-center justify-center px-6 py-8 sm:px-10 lg:h-screen lg:min-h-0 lg:px-12 lg:py-4">
          <div className="absolute inset-x-0 top-0 h-52 bg-gradient-to-b from-orange-50 to-transparent lg:hidden" />

          <div className="relative w-full max-w-sm">
            <MobileHeader />

            <Link
              href="/"
              className="mb-5 hidden w-fit items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-orange-600 lg:flex"
            >
              <ArrowLeft className="size-4" />
              Voltar para o início
            </Link>

            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-700">
                <Users className="size-3.5" />
                Área do cliente
              </span>

              <h1 className="mt-4 text-3xl font-black tracking-[-0.035em] text-slate-950">
                Bem-vindo de volta
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Entre para acessar o painel da sua empresa.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-xs font-bold text-slate-700"
                >
                  E-mail
                </label>

                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="voce@empresa.com"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  />
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between gap-4">
                  <label
                    htmlFor="password"
                    className="text-xs font-bold text-slate-700"
                  >
                    Senha
                  </label>

                  <Link
                    href="/recuperar-senha"
                    className="text-xs font-semibold text-orange-600 transition hover:text-orange-800"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>

                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    placeholder="Digite sua senha"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-11 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={
                      showPassword ? "Ocultar senha" : "Mostrar senha"
                    }
                    className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-2.5 text-xs text-slate-600">
                <input
                  type="checkbox"
                  name="remember"
                  className="size-4 rounded border-slate-300 accent-orange-600"
                />

                Manter minha conta conectada
              </label>

              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 px-5 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {loading ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    Entrar na plataforma
                    <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />

              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Primeira vez?
              </span>

              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <Link
              href="/cadastro"
              className="flex h-12 w-full items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-800 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
            >
              Criar uma conta gratuitamente
            </Link>

            <p className="mt-5 text-center text-[11px] leading-5 text-slate-400">
              Ao entrar, você concorda com nossos{" "}
              <Link
                href="/termos"
                className="font-semibold text-slate-600 hover:text-orange-600"
              >
                Termos de Uso
              </Link>{" "}
              e{" "}
              <Link
                href="/privacidade"
                className="font-semibold text-slate-600 hover:text-orange-600"
              >
                Política de Privacidade
              </Link>
              .
            </p>
=======
    <main className="min-h-screen bg-[#fff8ea] font-[family-name:var(--font-manrope)] text-[#123d2b]">
      <div className="grid min-h-screen lg:grid-cols-[0.92fr_1.08fr] xl:grid-cols-[1.02fr_0.98fr]">
        <AuthVisualPanel variant="login" />

        <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-8 sm:px-8 lg:px-10 xl:px-16">
          <div className="absolute -right-20 top-12 size-60 rounded-full bg-[#ffb21a]/15 blur-3xl" />
          <div className="absolute bottom-0 left-0 size-52 rounded-full bg-[#147a45]/10 blur-3xl" />
          <div className="relative w-full max-w-[30rem]">
            <div className="mb-4 flex justify-end"><LocaleSwitcher /></div>
            <div className="mb-9 flex items-center justify-between lg:hidden">
              <Link href="/" aria-label={t("landing.nav.home")}><BrandLogo className="h-9" priority /></Link>
              <Link href="/" aria-label={t("publicPages.register.backHome")} className="flex size-11 items-center justify-center rounded-xl border-2 border-[#123d2b]/15 bg-white text-[#123d2b]"><ArrowLeft className="size-4" /></Link>
            </div>

            <div className="rounded-[2rem] border-2 border-[#123d2b] bg-white p-6 shadow-[7px_8px_0_#ffb21a] sm:p-9">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ff6b1a]">{t("publicPages.login.eyebrow")}</p>
                  <h1 className="mt-3 font-[family-name:var(--font-bricolage)] text-4xl font-extrabold leading-none tracking-[-0.045em] text-[#123d2b] sm:text-5xl">{t("publicPages.login.title")}</h1>
                </div>
                <span className="hidden size-12 shrink-0 rotate-6 items-center justify-center rounded-2xl bg-[#dff4e7] text-[#147a45] sm:flex"><ShieldCheck className="size-6" /></span>
              </div>
              <p className="mt-4 text-sm font-medium leading-6 text-[#597064]">{t("publicPages.login.subtitle")}</p>

              <form onSubmit={handleSubmit} className="mt-7 space-y-4">
                <FieldLabel htmlFor="email" className="pb-4">{t("publicPages.login.emailLabel")}</FieldLabel>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#6a7d73]" />
                  <input id="email" name="email" type="email" required autoComplete="email" placeholder={t("publicPages.login.emailPlaceholder")} className="h-13 w-full rounded-xl border-2 border-[#123d2b]/15 bg-[#fffdf7] pl-11 pr-4 text-sm font-semibold text-[#123d2b] outline-none transition placeholder:font-medium placeholder:text-[#789083] focus:border-[#ff6b1a] focus:bg-white focus:ring-4 focus:ring-[#ffb21a]/20" />
                </div>

                <div className="flex items-center justify-between gap-4 pt-1">
                  <FieldLabel htmlFor="password">{t("publicPages.login.passwordLabel")}</FieldLabel>
                  <Link href="/recuperar-senha" className="text-xs font-extrabold text-[#147a45] transition hover:text-[#ff6b1a]">{t("publicPages.login.forgot")}</Link>
                </div>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#6a7d73]" />
                  <input id="password" name="password" type={showPassword ? "text" : "password"} required autoComplete="current-password" placeholder={t("publicPages.login.passwordPlaceholder")} className="h-13 w-full rounded-xl border-2 border-[#123d2b]/15 bg-[#fffdf7] pl-11 pr-12 text-sm font-semibold text-[#123d2b] outline-none transition placeholder:font-medium placeholder:text-[#789083] focus:border-[#ff6b1a] focus:bg-white focus:ring-4 focus:ring-[#ffb21a]/20" />
                  <button type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? t("publicPages.login.hidePassword") : t("publicPages.login.showPassword")} className="absolute right-2.5 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-[#6a7d73] transition hover:bg-[#fff0dd] hover:text-[#ff6b1a]">{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>
                </div>

                <label className="flex cursor-pointer items-center gap-2.5 pt-1 text-xs font-semibold text-[#597064]"><input type="checkbox" name="remember" className="size-4 rounded border-[#123d2b]/30 accent-[#147a45]" />{t("publicPages.login.remember")}</label>
                {error && <div role="alert" className="rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-700">{error}</div>}
                <button type="submit" disabled={loading} className="group flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-[#ff6b1a] px-5 text-sm font-extrabold text-white shadow-[0_5px_0_#c9460b] transition hover:-translate-y-0.5 hover:shadow-[0_7px_0_#c9460b] focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#ffb21a] disabled:cursor-not-allowed disabled:opacity-65 disabled:hover:translate-y-0">{loading ? <><LoaderCircle className="size-4 animate-spin" />{t("publicPages.login.submitting")}</> : <>{t("publicPages.login.submit")}<ArrowRight className="size-4 transition group-hover:translate-x-1" /></>}</button>
              </form>

              <div className="my-6 flex items-center gap-3"><div className="h-px flex-1 bg-[#123d2b]/10" /><span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#789083]">{t("publicPages.login.newHere")}</span><div className="h-px flex-1 bg-[#123d2b]/10" /></div>
              <Link href="/cadastro" className="flex h-12 w-full items-center justify-center rounded-xl border-2 border-[#123d2b] bg-[#fff8ea] text-sm font-extrabold text-[#123d2b] transition hover:-translate-y-0.5 hover:bg-[#ffb21a]">{t("publicPages.login.createAccount")}</Link>
            </div>
            <p className="mt-6 text-center text-[11px] font-medium leading-5 text-[#6a7d73]">{t("publicPages.login.legalPrefix")} <Link href="/termos" className="font-extrabold hover:text-[#ff6b1a]">{t("publicPages.login.terms")}</Link> e <Link href="/privacidade" className="font-extrabold hover:text-[#ff6b1a]">{t("publicPages.login.privacy")}</Link>.</p>
>>>>>>> 0e59a660a5acf0b652a188ddf2e8ccc96de79e4d
          </div>
        </section>
      </div>
    </main>
  );
}
<<<<<<< HEAD
function PresentationSection() {
  return (
    <section className="relative hidden h-screen overflow-hidden bg-gradient-to-br from-orange-700 via-amber-700 to-yellow-600 p-8 text-white lg:flex lg:flex-col lg:justify-between xl:p-10">
      <div className="absolute -left-32 -top-32 size-96 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-40 -right-28 size-[420px] rounded-full bg-yellow-300/20 blur-3xl" />

      <div className="absolute left-1/2 top-1/2 size-[430px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
      <div className="absolute left-1/2 top-1/2 size-[290px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />

      <Link href="/" className="relative z-10 flex w-fit items-center gap-3">
        <BrandLogo className="h-10" surface="light" priority />
      </Link>

      <div className="relative z-10 mx-auto w-full max-w-lg">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold backdrop-blur">
          <ShieldCheck className="size-4 text-yellow-200" />
          Ambiente seguro e protegido
        </div>

        <h2 className="mt-5 text-4xl font-black leading-[1.08] tracking-[-0.04em] xl:text-5xl">
          Gestão completa para o seu negócio.
        </h2>

        <p className="mt-4 max-w-md text-sm leading-6 text-white/70 xl:text-base">
          Vendas, estoque, financeiro e clientes trabalhando juntos em uma
          única plataforma.
        </p>

        <div className="mt-6 grid gap-3">
          {benefits.map((benefit) => (
            <BenefitCard
              key={benefit.title}
              icon={benefit.icon}
              title={benefit.title}
              description={benefit.description}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-between text-xs text-white/55">
        <p>© {new Date().getFullYear()} Mangora</p>

        <div className="flex items-center gap-2">
          <CheckCircle2 className="size-4 text-green-300" />
          Dados protegidos
        </div>
      </div>
    </section>
  );
}

function BenefitCard({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 p-3 backdrop-blur-md">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/15">
        <Icon className="size-4 text-yellow-100" />
      </div>

      <div>
        <h3 className="text-sm font-bold">{title}</h3>
        <p className="mt-0.5 text-xs text-white/60">{description}</p>
      </div>
    </div>
  );
}

function MobileHeader() {
  return (
    <div className="mb-8 flex items-center justify-between lg:hidden">
      <Link href="/" className="flex items-center gap-3">
        <BrandLogo className="h-9" priority />
      </Link>

      <Link
        href="/"
        aria-label="Voltar para o início"
        className="flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm"
      >
        <ArrowLeft className="size-4" />
      </Link>
    </div>
  );
=======
function FieldLabel({ htmlFor, children, className = "" }: { htmlFor: string; children: React.ReactNode; className?: string }) {
  return <label htmlFor={htmlFor} className={`mb-[-0.5rem] block text-xs font-extrabold text-[#315847] ${className}`}>{children}</label>;
>>>>>>> 0e59a660a5acf0b652a188ddf2e8ccc96de79e4d
}
