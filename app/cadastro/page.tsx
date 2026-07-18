"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  LayoutDashboard,
  LoaderCircle,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  Store,
  User,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { apiRequest } from "@/lib/api/client";

const benefits = [
  {
    icon: BarChart3,
    title: "Gestão centralizada",
    description: "Vendas, estoque e financeiro em um só lugar.",
  },
  {
    icon: Zap,
    title: "Configuração rápida",
    description: "Cadastre sua empresa em poucos minutos.",
  },
  {
    icon: ShieldCheck,
    title: "Dados protegidos",
    description: "Informações separadas e acesso controlado.",
  },
];

const segments = [
  { value: "RETAIL", label: "Loja ou comércio" },
  { value: "RESTAURANT", label: "Restaurante" },
  { value: "SNACK_BAR", label: "Lanchonete" },
  { value: "MARKET", label: "Mercado ou minimercado" },
  { value: "BAKERY", label: "Padaria" },
  { value: "SALON", label: "Salão de beleza" },
  { value: "BARBERSHOP", label: "Barbearia" },
  { value: "TECHNICAL_ASSISTANCE", label: "Assistência técnica" },
  { value: "SERVICE_PROVIDER", label: "Prestador de serviços" },
  { value: "OTHER", label: "Outro segmento" },
];

export default function CadastroPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess(false);

    const formData = new FormData(event.currentTarget);

    const name = String(formData.get("name") ?? "").trim();
    const companyName = String(formData.get("companyName") ?? "").trim();
    const segment = String(formData.get("segment") ?? "");
    const phone = String(formData.get("phone") ?? "").trim();
    const email = String(formData.get("email") ?? "")
      .trim()
      .toLowerCase();

    const password = String(formData.get("password") ?? "");
    const passwordConfirmation = String(
      formData.get("passwordConfirmation") ?? "",
    );

    const acceptedTerms = formData.get("acceptedTerms") === "on";

    if (password.length < 8) {
      setError("A senha deve possuir pelo menos 8 caracteres.");
      return;
    }

    if (password !== passwordConfirmation) {
      setError("As senhas informadas não são iguais.");
      return;
    }

    if (!acceptedTerms) {
      setError("Você precisa aceitar os Termos de Uso.");
      return;
    }

    const registerData = {
      name,
      companyName,
      segment,
      phone,
      email,
      password,
      acceptedTerms,
    };

    try {
      setLoading(true);

      await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify(registerData),
      });

      setSuccess(true);

      await new Promise((resolve) => setTimeout(resolve, 700));
      router.push("/dashboard");
      router.refresh();
    } catch (registrationError) {
      setError(
        registrationError instanceof Error
          ? registrationError.message
          : "Não foi possível criar sua conta.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 lg:h-screen lg:overflow-hidden">
      <div className="grid min-h-screen lg:h-screen lg:grid-cols-[0.85fr_1.15fr]">
        <PresentationSection />

        <section className="relative flex min-h-screen items-center justify-center px-5 py-8 sm:px-8 lg:h-screen lg:min-h-0 lg:px-10 lg:py-3">
          <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-violet-50 to-transparent lg:hidden" />

          <div className="relative w-full max-w-xl">
            <MobileHeader />

            <div className="mb-4 hidden items-center justify-between lg:flex">
              <Link
                href="/"
                className="flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-violet-600"
              >
                <ArrowLeft className="size-4" />
                Voltar para o início
              </Link>

              <p className="text-xs text-slate-500">
                Já possui conta?{" "}
                <Link
                  href="/login"
                  className="font-bold text-violet-600 hover:text-violet-800"
                >
                  Entrar
                </Link>
              </p>
            </div>

            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700">
                <Sparkles className="size-3.5" />
                Crie sua conta
              </span>

              <h1 className="mt-3 text-3xl font-black tracking-[-0.035em] text-slate-950">
                Comece a organizar sua empresa
              </h1>

              <p className="mt-1.5 text-sm leading-6 text-slate-500">
                Preencha os dados para criar seu acesso à plataforma.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-5">
              <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
                <InputField
                  id="name"
                  name="name"
                  label="Seu nome"
                  type="text"
                  placeholder="Nome completo"
                  autoComplete="name"
                  icon={User}
                />

                <InputField
                  id="companyName"
                  name="companyName"
                  label="Nome da empresa"
                  type="text"
                  placeholder="Nome do estabelecimento"
                  autoComplete="organization"
                  icon={Building2}
                />

                <SelectField />

                <InputField
                  id="phone"
                  name="phone"
                  label="Telefone ou WhatsApp"
                  type="tel"
                  placeholder="(81) 99999-9999"
                  autoComplete="tel"
                  icon={Phone}
                />

                <div className="sm:col-span-2">
                  <InputField
                    id="email"
                    name="email"
                    label="E-mail"
                    type="email"
                    placeholder="voce@empresa.com"
                    autoComplete="email"
                    icon={Mail}
                  />
                </div>

                <PasswordField
                  id="password"
                  name="password"
                  label="Senha"
                  placeholder="Mínimo de 8 caracteres"
                  visible={showPassword}
                  onToggle={() => setShowPassword((current) => !current)}
                />

                <PasswordField
                  id="passwordConfirmation"
                  name="passwordConfirmation"
                  label="Confirmar senha"
                  placeholder="Digite novamente"
                  visible={showPasswordConfirmation}
                  onToggle={() =>
                    setShowPasswordConfirmation((current) => !current)
                  }
                />
              </div>

              {error && (
                <div
                  role="alert"
                  className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-700"
                >
                  {error}
                </div>
              )}

              {success && (
                <div
                  role="status"
                  className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-700"
                >
                  <CheckCircle2 className="size-4 shrink-0" />
                  Conta criada com sucesso. Acessando o painel...
                </div>
              )}

              <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-xs leading-5 text-slate-600">
                <input
                  type="checkbox"
                  name="acceptedTerms"
                  required
                  className="mt-0.5 size-4 shrink-0 rounded border-slate-300 accent-violet-600"
                />

                <span>
                  Concordo com os{" "}
                  <Link
                    href="/termos"
                    className="font-bold text-violet-600 hover:text-violet-800"
                  >
                    Termos de Uso
                  </Link>{" "}
                  e com a{" "}
                  <Link
                    href="/privacidade"
                    className="font-bold text-violet-600 hover:text-violet-800"
                  >
                    Política de Privacidade
                  </Link>
                  .
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="group mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {loading ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  <>
                    Criar minha conta
                    <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            <div className="my-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />

              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                Já possui cadastro?
              </span>

              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <Link
              href="/login"
              className="flex h-11 w-full items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-800 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
            >
              Entrar na minha conta
            </Link>

            <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="size-3.5 text-emerald-500" />
              Seus dados serão armazenados com segurança.
            </div>
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
          <Sparkles className="size-4 text-cyan-200" />
          Gestão completa para seu negócio
        </div>

        <h2 className="mt-5 text-4xl font-black leading-[1.08] tracking-[-0.04em] xl:text-5xl">
          Um sistema que cresce com sua empresa.
        </h2>

        <p className="mt-4 max-w-md text-sm leading-6 text-white/70 xl:text-base">
          Centralize vendas, produtos, clientes, estoque e financeiro em uma
          plataforma moderna.
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
          Cadastro protegido
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
    <div className="mb-6 flex items-center justify-between lg:hidden">
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

type InputFieldProps = {
  id: string;
  name: string;
  label: string;
  type: "text" | "email" | "tel";
  placeholder: string;
  autoComplete: string;
  icon: LucideIcon;
};

function InputField({
  id,
  name,
  label,
  type,
  placeholder,
  autoComplete,
  icon: Icon,
}: InputFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 block text-xs font-bold text-slate-700"
      >
        {label}
      </label>

      <div className="relative">
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

        <input
          id={id}
          name={name}
          type={type}
          required
          autoComplete={autoComplete}
          placeholder={placeholder}
          className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
        />
      </div>
    </div>
  );
}

function SelectField() {
  return (
    <div>
      <label
        htmlFor="segment"
        className="mb-1 block text-xs font-bold text-slate-700"
      >
        Segmento da empresa
      </label>

      <div className="relative">
        <Store className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

        <select
          id="segment"
          name="segment"
          required
          defaultValue=""
          className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-10 pr-9 text-sm text-slate-950 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
        >
          <option value="" disabled>
            Selecione
          </option>

          {segments.map((segment) => (
            <option key={segment.value} value={segment.value}>
              {segment.label}
            </option>
          ))}
        </select>

        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
          ▼
        </span>
      </div>
    </div>
  );
}

type PasswordFieldProps = {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  visible: boolean;
  onToggle: () => void;
};

function PasswordField({
  id,
  name,
  label,
  placeholder,
  visible,
  onToggle,
}: PasswordFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 block text-xs font-bold text-slate-700"
      >
        {label}
      </label>

      <div className="relative">
        <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          required
          minLength={8}
          autoComplete="new-password"
          placeholder={placeholder}
          className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-11 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
        />

        <button
          type="button"
          onClick={onToggle}
          aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
          className="absolute right-2.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          {visible ? (
            <EyeOff className="size-4" />
          ) : (
            <Eye className="size-4" />
          )}
        </button>
      </div>
    </div>
  );
}
