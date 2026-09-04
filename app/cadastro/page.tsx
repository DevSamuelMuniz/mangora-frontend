"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, ArrowRight, Building2, CheckCircle2, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, Phone, ShieldCheck, Store, User, type LucideIcon } from "lucide-react";
import AuthVisualPanel from "@/components/auth/AuthVisualPanel";
import BrandLogo from "@/components/brand/BrandLogo";
import { apiRequest } from "@/lib/api/client";
import { setUserProperties, track } from "@/lib/analytics";

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
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess(false);
    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const passwordConfirmation = String(formData.get("passwordConfirmation") ?? "");
    const acceptedTerms = formData.get("acceptedTerms") === "on";

    if (password.length < 8) return setError("A senha deve possuir pelo menos 8 caracteres.");
    if (password !== passwordConfirmation) return setError("As senhas informadas não são iguais.");
    if (!acceptedTerms) return setError("Você precisa aceitar os Termos de Uso.");

    const registerData = {
      name: String(formData.get("name") ?? "").trim(),
      companyName: String(formData.get("companyName") ?? "").trim(),
      segment: String(formData.get("segment") ?? ""),
      phone: String(formData.get("phone") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim().toLowerCase(),
      password,
      acceptedTerms,
    };

    try {
      setLoading(true);
      await apiRequest("/auth/register", { method: "POST", body: JSON.stringify(registerData) });
      track("signup_completed");
      setUserProperties({ logged_in: "true", signup: "completed" });
      setSuccess(true);
      await new Promise((resolve) => setTimeout(resolve, 450));
      window.location.replace("/dashboard");
    } catch (registrationError) {
      setError(registrationError instanceof Error ? registrationError.message : "Não foi possível criar sua conta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fff8ea] font-[family-name:var(--font-manrope)] text-[#123d2b]">
      <div className="grid min-h-screen lg:grid-cols-[0.78fr_1.22fr] xl:grid-cols-[0.92fr_1.08fr]">
        <AuthVisualPanel variant="register" />

        <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-7 sm:px-8 lg:px-9 xl:px-14">
          <div className="absolute -right-20 top-8 size-72 rounded-full bg-[#ffb21a]/15 blur-3xl" />
          <div className="absolute bottom-0 left-0 size-56 rounded-full bg-[#147a45]/10 blur-3xl" />
          <div className="relative w-full max-w-[46rem]">
            <div className="mb-6 flex items-center justify-between lg:hidden">
              <Link href="/" aria-label="Página inicial da Mangora"><BrandLogo className="h-9" priority /></Link>
              <Link href="/" aria-label="Voltar para o início" className="flex size-11 items-center justify-center rounded-xl border-2 border-[#123d2b]/15 bg-white text-[#123d2b]"><ArrowLeft className="size-4" /></Link>
            </div>

            <div className="mb-4 hidden items-center justify-between lg:flex">
              <Link href="/" className="flex items-center gap-2 text-xs font-extrabold text-[#597064] transition hover:text-[#ff6b1a]"><ArrowLeft className="size-4" />Voltar para o início</Link>
              <p className="text-xs font-semibold text-[#597064]">Já tem uma conta? <Link href="/login" className="font-extrabold text-[#147a45] hover:text-[#ff6b1a]">Entrar</Link></p>
            </div>

            <div className="rounded-[2rem] border-2 border-[#123d2b] bg-white p-5 shadow-[7px_8px_0_#ffb21a] sm:p-7 xl:p-8">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ff6b1a]">7 dias grátis · sem cartão</p>
                  <h1 className="mt-2 font-[family-name:var(--font-bricolage)] text-3xl font-extrabold leading-none tracking-[-0.045em] text-[#123d2b] sm:text-4xl xl:text-[2.75rem]">Vamos preparar sua Mangora.</h1>
                  <p className="mt-2 text-sm font-medium leading-6 text-[#597064]">Preencha os dados essenciais e use a experiência completa por 7 dias. No 8º dia, continue no Free ou escolha um plano pago.</p>
                </div>
                <span className="hidden size-12 shrink-0 rotate-6 items-center justify-center rounded-2xl bg-[#dff4e7] text-[#147a45] sm:flex"><ShieldCheck className="size-6" /></span>
              </div>

              <form onSubmit={handleSubmit} className="mt-5">
                <div className="grid gap-x-4 gap-y-3.5 sm:grid-cols-2">
                  <InputField id="name" name="name" label="Seu nome" type="text" placeholder="Nome completo" autoComplete="name" icon={User} />
                  <InputField id="companyName" name="companyName" label="Nome da empresa" type="text" placeholder="Nome do estabelecimento" autoComplete="organization" icon={Building2} />
                  <SelectField />
                  <InputField id="phone" name="phone" label="Telefone ou WhatsApp" type="tel" placeholder="(81) 99999-9999" autoComplete="tel" icon={Phone} />
                  <div className="sm:col-span-2"><InputField id="email" name="email" label="E-mail" type="email" placeholder="voce@empresa.com" autoComplete="email" icon={Mail} /></div>
                  <PasswordField id="password" name="password" label="Crie uma senha" placeholder="Mínimo de 8 caracteres" visible={showPassword} onToggle={() => setShowPassword((current) => !current)} />
                  <PasswordField id="passwordConfirmation" name="passwordConfirmation" label="Confirme a senha" placeholder="Digite novamente" visible={showPasswordConfirmation} onToggle={() => setShowPasswordConfirmation((current) => !current)} />
                </div>

                {error && <div role="alert" className="mt-3 rounded-xl border-2 border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-700">{error}</div>}
                {success && <div role="status" className="mt-3 flex items-center gap-2 rounded-xl border-2 border-green-200 bg-green-50 px-4 py-2.5 text-xs font-bold text-green-700"><CheckCircle2 className="size-4 shrink-0" />Conta criada. Abrindo seu painel...</div>}

                <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-xs font-semibold leading-5 text-[#597064]"><input type="checkbox" name="acceptedTerms" required className="mt-0.5 size-4 shrink-0 rounded border-[#123d2b]/30 accent-[#147a45]" /><span>Li e concordo com os <Link href="/termos" className="font-extrabold text-[#147a45] hover:text-[#ff6b1a]">Termos de Uso</Link> e com a <Link href="/privacidade" className="font-extrabold text-[#147a45] hover:text-[#ff6b1a]">Política de Privacidade</Link>.</span></label>

                <button type="submit" disabled={loading} className="group mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#ff6b1a] px-5 text-sm font-extrabold text-white shadow-[0_5px_0_#c9460b] transition hover:-translate-y-0.5 hover:shadow-[0_7px_0_#c9460b] focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#ffb21a] disabled:cursor-not-allowed disabled:opacity-65 disabled:hover:translate-y-0">{loading ? <><LoaderCircle className="size-4 animate-spin" />Preparando sua conta...</> : <>Começar meus 7 dias grátis<ArrowRight className="size-4 transition group-hover:translate-x-1" /></>}</button>
                <p className="mt-3 text-center text-[11px] font-semibold leading-5 text-[#6a7d73]">Você não informa cartão agora. Após o período completo, sua conta continua ativa no plano Free, sem cobrança.</p>
              </form>

              <p className="mt-4 text-center text-xs font-semibold text-[#6a7d73] lg:hidden">Já possui cadastro? <Link href="/login" className="font-extrabold text-[#147a45]">Entrar na minha conta</Link></p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

type InputFieldProps = { id: string; name: string; label: string; type: "text" | "email" | "tel"; placeholder: string; autoComplete: string; icon: LucideIcon };

function InputField({ id, name, label, type, placeholder, autoComplete, icon: Icon }: InputFieldProps) {
  return <div><FieldLabel htmlFor={id}>{label}</FieldLabel><div className="relative"><Icon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#6a7d73]" /><input id={id} name={name} type={type} required autoComplete={autoComplete} placeholder={placeholder} className="h-11 w-full rounded-xl border-2 border-[#123d2b]/15 bg-[#fffdf7] pl-10 pr-3 text-sm font-semibold text-[#123d2b] outline-none transition placeholder:font-medium placeholder:text-[#789083] focus:border-[#ff6b1a] focus:bg-white focus:ring-4 focus:ring-[#ffb21a]/20" /></div></div>;
}

function SelectField() {
  return <div><FieldLabel htmlFor="segment">Segmento da empresa</FieldLabel><div className="relative"><Store className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#6a7d73]" /><select id="segment" name="segment" required defaultValue="" className="h-11 w-full appearance-none rounded-xl border-2 border-[#123d2b]/15 bg-[#fffdf7] pl-10 pr-9 text-sm font-semibold text-[#123d2b] outline-none transition focus:border-[#ff6b1a] focus:bg-white focus:ring-4 focus:ring-[#ffb21a]/20"><option value="" disabled>Selecione</option>{segments.map((segment) => <option key={segment.value} value={segment.value}>{segment.label}</option>)}</select><span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-[#6a7d73]">▼</span></div></div>;
}

type PasswordFieldProps = { id: string; name: string; label: string; placeholder: string; visible: boolean; onToggle: () => void };

function PasswordField({ id, name, label, placeholder, visible, onToggle }: PasswordFieldProps) {
  return <div><FieldLabel htmlFor={id}>{label}</FieldLabel><div className="relative"><LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#6a7d73]" /><input id={id} name={name} type={visible ? "text" : "password"} required minLength={8} autoComplete="new-password" placeholder={placeholder} className="h-11 w-full rounded-xl border-2 border-[#123d2b]/15 bg-[#fffdf7] pl-10 pr-11 text-sm font-semibold text-[#123d2b] outline-none transition placeholder:font-medium placeholder:text-[#789083] focus:border-[#ff6b1a] focus:bg-white focus:ring-4 focus:ring-[#ffb21a]/20" /><button type="button" onClick={onToggle} aria-label={visible ? "Ocultar senha" : "Mostrar senha"} className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-[#6a7d73] transition hover:bg-[#fff0dd] hover:text-[#ff6b1a]">{visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div></div>;
}

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return <label htmlFor={htmlFor} className="mb-1 block text-xs font-extrabold text-[#315847]">{children}</label>;
}
