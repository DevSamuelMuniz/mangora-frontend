"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Boxes,
  CheckCircle2,
  Eye,
  EyeOff,
  LayoutDashboard,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Users,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import { apiRequest } from "@/lib/api/client";

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

export default function LoginPage() {
  const router = useRouter();
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
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 lg:h-screen lg:overflow-hidden">
      <div className="grid min-h-screen lg:h-screen lg:grid-cols-[0.95fr_1.05fr]">
        <PresentationSection />

        <section className="relative flex min-h-screen items-center justify-center px-6 py-8 sm:px-10 lg:h-screen lg:min-h-0 lg:px-12 lg:py-4">
          <div className="absolute inset-x-0 top-0 h-52 bg-gradient-to-b from-violet-50 to-transparent lg:hidden" />

          <div className="relative w-full max-w-sm">
            <MobileHeader />

            <Link
              href="/"
              className="mb-5 hidden w-fit items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-violet-600 lg:flex"
            >
              <ArrowLeft className="size-4" />
              Voltar para o início
            </Link>

            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700">
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
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
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
                    className="text-xs font-semibold text-violet-600 transition hover:text-violet-800"
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
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-11 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
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
                  className="size-4 rounded border-slate-300 accent-violet-600"
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
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
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
              className="flex h-12 w-full items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-800 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
            >
              Criar uma conta gratuitamente
            </Link>

            <p className="mt-5 text-center text-[11px] leading-5 text-slate-400">
              Ao entrar, você concorda com nossos{" "}
              <Link
                href="/termos"
                className="font-semibold text-slate-600 hover:text-violet-600"
              >
                Termos de Uso
              </Link>{" "}
              e{" "}
              <Link
                href="/privacidade"
                className="font-semibold text-slate-600 hover:text-violet-600"
              >
                Política de Privacidade
              </Link>
              .
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function PresentationSection() {
  return (
    <section className="relative hidden h-screen overflow-hidden bg-gradient-to-br from-violet-700 via-indigo-700 to-cyan-600 p-8 text-white lg:flex lg:flex-col lg:justify-between xl:p-10">
      <div className="absolute -left-32 -top-32 size-96 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-40 -right-28 size-[420px] rounded-full bg-cyan-300/20 blur-3xl" />

      <div className="absolute left-1/2 top-1/2 size-[430px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
      <div className="absolute left-1/2 top-1/2 size-[290px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />

      <Link href="/" className="relative z-10 flex w-fit items-center gap-3">
        <Logo variant="light" />

        <div>
          <p className="text-lg font-black tracking-tight">
            Gestão<span className="text-cyan-200">+</span>
          </p>

          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55">
            Gestão inteligente
          </p>
        </div>
      </Link>

      <div className="relative z-10 mx-auto w-full max-w-lg">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold backdrop-blur">
          <ShieldCheck className="size-4 text-cyan-200" />
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
        <p>© {new Date().getFullYear()} Gestão+</p>

        <div className="flex items-center gap-2">
          <CheckCircle2 className="size-4 text-emerald-300" />
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
        <Icon className="size-4 text-cyan-100" />
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
        <Logo />

        <span className="text-lg font-black text-slate-950">
          Gestão<span className="text-violet-600">+</span>
        </span>
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
}

function Logo({ variant = "default" }: { variant?: "default" | "light" }) {
  return (
    <div
      className={`flex size-10 items-center justify-center rounded-xl ${
        variant === "light"
          ? "border border-white/20 bg-white/15 backdrop-blur"
          : "bg-gradient-to-br from-violet-600 to-cyan-500 shadow-lg shadow-violet-200"
      }`}
    >
      <LayoutDashboard className="size-5 text-white" />
    </div>
  );
}
