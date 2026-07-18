"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, type ReactNode, useEffect, useState } from "react";
import {
  ArrowLeft,
  Building2,
  LoaderCircle,
  MapPin,
  Save,
  UserPlus,
  type LucideIcon,
} from "lucide-react";

import { apiRequest } from "@/lib/api/client";
import type { Customer, CustomerInput, CustomerType } from "@/types/customer";

const states = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];

export default function CustomerForm({ customerId }: { customerId?: string }) {
  const router = useRouter();
  const editing = Boolean(customerId);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerType, setCustomerType] = useState<CustomerType>("INDIVIDUAL");
  const [loadingCustomer, setLoadingCustomer] = useState(editing);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!customerId) return;
    let mounted = true;

    apiRequest<Customer>(`/customers/${customerId}`)
      .then((data) => {
        if (mounted) {
          setCustomer(data);
          setCustomerType(data.type);
        }
      })
      .catch((requestError: unknown) => {
        if (mounted) setError(requestError instanceof Error ? requestError.message : "Não foi possível carregar o cliente.");
      })
      .finally(() => {
        if (mounted) setLoadingCustomer(false);
      });

    return () => {
      mounted = false;
    };
  }, [customerId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const document = digits(formData.get("document"));
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const phone = digits(formData.get("phone"));
    const expectedDocumentLength = customerType === "INDIVIDUAL" ? 11 : 14;

    if (name.length < 3) {
      setError("Informe um nome ou razão social válido.");
      return;
    }
    if (document.length !== expectedDocumentLength) {
      setError(customerType === "INDIVIDUAL" ? "Informe um CPF com 11 dígitos." : "Informe um CNPJ com 14 dígitos.");
      return;
    }
    if (!email.includes("@")) {
      setError("Informe um e-mail válido.");
      return;
    }
    if (phone.length < 10 || phone.length > 15) {
      setError("Informe um telefone válido com DDD.");
      return;
    }

    const optional = (field: string) => String(formData.get(field) ?? "").trim() || null;
    const payload: CustomerInput = {
      type: customerType,
      name,
      tradeName: customerType === "COMPANY" ? optional("tradeName") : null,
      document,
      email,
      phone,
      active: formData.get("status") === "active",
      postalCode: digits(formData.get("postalCode")) || null,
      street: optional("street"),
      number: optional("number"),
      district: optional("district"),
      city: optional("city"),
      state: optional("state"),
      notes: optional("notes"),
    };

    try {
      setLoading(true);
      await apiRequest<Customer>(customerId ? `/customers/${customerId}` : "/customers", {
        method: customerId ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      });
      router.push("/clientes");
      router.refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível salvar o cliente.");
    } finally {
      setLoading(false);
    }
  }

  if (loadingCustomer) {
    return <div className="flex min-h-72 items-center justify-center rounded-2xl border border-slate-200 bg-white"><LoaderCircle className="size-6 animate-spin text-violet-600" /><span className="ml-2 text-sm font-semibold text-slate-500">Carregando cliente...</span></div>;
  }

  if (editing && !customer) {
    return <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center"><p className="text-sm font-bold text-red-700">{error || "Cliente não encontrado."}</p><Link href="/clientes" className="mt-4 inline-flex h-10 items-center rounded-xl bg-white px-4 text-xs font-bold text-violet-600 shadow-sm">Voltar para clientes</Link></div>;
  }

  return (
    <section className="mx-auto max-w-5xl">
      <div className="flex items-start gap-3">
        <Link href="/clientes" aria-label="Voltar para clientes" className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-violet-600"><ArrowLeft className="size-4" /></Link>
        <div><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-violet-600">Relacionamento</p><h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{editing ? "Editar cliente" : "Novo cliente"}</h1><p className="mt-1 text-xs text-slate-500">{editing ? "Atualize os dados do cliente selecionado." : "Preencha os dados para cadastrar o cliente."}</p></div>
      </div>

      <form key={customer?.id ?? "new"} onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <SectionTitle icon={UserPlus} title="Dados principais" description="Identificação e informações de contato do cliente." />
          <fieldset className="mt-4">
            <legend className="mb-1.5 text-xs font-bold text-slate-700">Tipo de cliente</legend>
            <div className="grid gap-2 sm:max-w-md sm:grid-cols-2">
              {(["INDIVIDUAL", "COMPANY"] as CustomerType[]).map((type) => (
                <label key={type} className={`flex h-11 cursor-pointer items-center gap-2.5 rounded-xl border px-3 text-xs font-bold transition ${customerType === type ? "border-violet-300 bg-violet-50 text-violet-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                  <input type="radio" name="type" value={type} checked={customerType === type} onChange={() => setCustomerType(type)} className="accent-violet-600" />
                  {type === "INDIVIDUAL" ? "Pessoa física" : "Pessoa jurídica"}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label={customerType === "INDIVIDUAL" ? "Nome completo" : "Razão social"} id="name"><input id="name" name="name" type="text" required minLength={3} maxLength={160} defaultValue={customer?.name} placeholder={customerType === "INDIVIDUAL" ? "Ex.: Maria Santos" : "Ex.: Empresa Exemplo Ltda."} autoComplete="name" className={inputClassName} /></Field>
            <Field label={customerType === "INDIVIDUAL" ? "CPF" : "CNPJ"} id="document"><input id="document" name="document" type="text" required inputMode="numeric" defaultValue={customer?.document} placeholder={customerType === "INDIVIDUAL" ? "000.000.000-00" : "00.000.000/0000-00"} className={inputClassName} /></Field>
            {customerType === "COMPANY" && <Field label="Nome fantasia (opcional)" id="tradeName"><input id="tradeName" name="tradeName" type="text" maxLength={160} defaultValue={customer?.tradeName ?? ""} placeholder="Nome conhecido da empresa" className={inputClassName} /></Field>}
            <Field label="E-mail" id="email"><input id="email" name="email" type="email" required maxLength={254} defaultValue={customer?.email} placeholder="cliente@email.com" autoComplete="email" className={inputClassName} /></Field>
            <Field label="Telefone ou WhatsApp" id="phone"><input id="phone" name="phone" type="tel" required defaultValue={customer?.phone} placeholder="(81) 99999-9999" autoComplete="tel" className={inputClassName} /></Field>
            <Field label="Status" id="status"><select id="status" name="status" defaultValue={customer?.active === false ? "inactive" : "active"} className={inputClassName}><option value="active">Ativo</option><option value="inactive">Inativo</option></select></Field>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <SectionTitle icon={MapPin} title="Endereço" description="Informações opcionais para localização e atendimento." />
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="CEP" id="postalCode"><input id="postalCode" name="postalCode" type="text" inputMode="numeric" defaultValue={customer?.postalCode ?? ""} placeholder="00000-000" autoComplete="postal-code" className={inputClassName} /></Field>
            <Field label="Endereço" id="street" className="lg:col-span-2"><input id="street" name="street" type="text" maxLength={200} defaultValue={customer?.street ?? ""} placeholder="Rua ou avenida" autoComplete="street-address" className={inputClassName} /></Field>
            <Field label="Número" id="number"><input id="number" name="number" type="text" maxLength={30} defaultValue={customer?.number ?? ""} placeholder="123" className={inputClassName} /></Field>
            <Field label="Bairro" id="district"><input id="district" name="district" type="text" maxLength={100} defaultValue={customer?.district ?? ""} placeholder="Bairro" className={inputClassName} /></Field>
            <Field label="Cidade" id="city" className="lg:col-span-2"><input id="city" name="city" type="text" maxLength={100} defaultValue={customer?.city ?? ""} placeholder="Cidade" autoComplete="address-level2" className={inputClassName} /></Field>
            <Field label="UF" id="state"><select id="state" name="state" defaultValue={customer?.state ?? ""} className={inputClassName}><option value="">Selecione</option>{states.map((state) => <option key={state} value={state}>{state}</option>)}</select></Field>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <SectionTitle icon={Building2} title="Observações" description="Anotações internas sobre preferências ou atendimento." />
          <Field label="Observações (opcional)" id="notes" className="mt-4"><textarea id="notes" name="notes" rows={3} maxLength={2000} defaultValue={customer?.notes ?? ""} placeholder="Informações adicionais sobre o cliente..." className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100" /></Field>
        </div>

        {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">{error}</div>}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Link href="/clientes" className="flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-600 transition hover:bg-slate-50">Cancelar</Link><button type="submit" disabled={loading} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0">{loading ? <><LoaderCircle className="size-4 animate-spin" />Salvando...</> : <><Save className="size-4" />{editing ? "Salvar alterações" : "Salvar cliente"}</>}</button></div>
      </form>
    </section>
  );
}

function digits(value: FormDataEntryValue | null) {
  return String(value ?? "").replace(/\D/g, "");
}

const inputClassName = "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100";

function SectionTitle({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) {
  return <div className="flex items-center gap-3 border-b border-slate-100 pb-4"><div className="flex size-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600"><Icon className="size-4" /></div><div><h2 className="text-sm font-bold text-slate-950">{title}</h2><p className="mt-0.5 text-[10px] text-slate-400">{description}</p></div></div>;
}

function Field({ label, id, children, className = "" }: { label: string; id: string; children: ReactNode; className?: string }) {
  return <div className={className}><label htmlFor={id} className="mb-1.5 block text-xs font-bold text-slate-700">{label}</label>{children}</div>;
}
