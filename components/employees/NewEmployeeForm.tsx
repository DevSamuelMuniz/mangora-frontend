"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, type ReactNode, useState } from "react";
import { ArrowLeft, CheckCircle2, Clock3, LoaderCircle, Save, ShieldCheck, UserPlus, type LucideIcon } from "lucide-react";
import { apiRequest } from "@/lib/api/client";
import { roleLabels, rolePermissions } from "./employee-data";
import type { Employee, EmployeeRole } from "@/types/employee";

const roles: EmployeeRole[] = ["ADMIN", "MANAGER", "CASHIER", "SELLER", "EMPLOYEE"];

export default function NewEmployeeForm() {
  const router = useRouter();
  const [role, setRole] = useState<EmployeeRole>("EMPLOYEE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setError("");
    try {
      setLoading(true);
      await apiRequest<Employee>("/employees", {
        method: "POST",
        body: JSON.stringify({
          name: data.get("name"), email: data.get("email"), phone: data.get("phone"),
          password: data.get("password"), role, active: data.get("active") === "true",
          startDate: `${data.get("startDate")}T12:00:00.000Z`, jobTitle: data.get("jobTitle") || undefined,
          employeeCode: data.get("employeeCode") || undefined, notes: data.get("notes") || undefined,
        }),
      });
      router.push("/funcionarios?created=1");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível cadastrar o funcionário.");
    } finally { setLoading(false); }
  }

  return <section className="mx-auto max-w-5xl">
    <div className="flex items-start gap-3"><Link href="/funcionarios" aria-label="Voltar para funcionários" className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm hover:text-violet-600"><ArrowLeft className="size-4" /></Link><div><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-violet-600">Administração</p><h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">Novo funcionário</h1><p className="mt-1 text-xs text-slate-500">Crie o acesso e defina as permissões do colaborador.</p></div></div>
    <form onSubmit={handleSubmit} className="mt-5 space-y-4">
      <div className="grid items-start gap-4 lg:grid-cols-[1fr_0.72fr]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><SectionTitle icon={UserPlus} title="Dados do funcionário" description="Identificação, contato e credencial inicial." /><div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Nome completo" id="name" className="sm:col-span-2"><input id="name" name="name" required minLength={3} autoComplete="name" className={inputClassName} /></Field>
            <Field label="E-mail" id="email"><input id="email" name="email" type="email" required autoComplete="email" className={inputClassName} /></Field>
            <Field label="Telefone" id="phone"><input id="phone" name="phone" type="tel" required placeholder="(81) 99999-9999" className={inputClassName} /></Field>
            <Field label="Senha temporária" id="password" className="sm:col-span-2"><input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" className={inputClassName} /><p className="mt-1 text-[10px] text-slate-400">Compartilhe a senha por um canal seguro. Ela deve ter ao menos 8 caracteres.</p></Field>
            <Field label="Cargo interno (opcional)" id="jobTitle"><input id="jobTitle" name="jobTitle" className={inputClassName} /></Field>
            <Field label="Código interno (opcional)" id="employeeCode"><input id="employeeCode" name="employeeCode" className={inputClassName} /></Field>
          </div></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><SectionTitle icon={Clock3} title="Vínculo" description="Data de início e situação inicial do acesso." /><div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label="Data de início" id="startDate"><input id="startDate" name="startDate" type="date" required className={inputClassName} /></Field><Field label="Situação inicial" id="active"><select id="active" name="active" defaultValue="true" className={inputClassName}><option value="true">Ativo</option><option value="false">Inativo</option></select></Field></div></div>
        </div>
        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-20"><SectionTitle icon={ShieldCheck} title="Papel e permissões" description="A API aplicará estes limites em cada operação." /><Field label="Papel do usuário" id="role" className="mt-4"><select id="role" value={role} onChange={(e) => setRole(e.target.value as EmployeeRole)} className={inputClassName}>{roles.map((item) => <option key={item} value={item}>{roleLabels[item]}</option>)}</select></Field><div className="mt-4 rounded-xl bg-slate-50 p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Permissões</p><ul className="mt-3 space-y-2.5">{rolePermissions[role].map((permission) => <li key={permission} className="flex gap-2 text-xs leading-5 text-slate-600"><CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />{permission}</li>)}</ul></div></aside>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><Field label="Observações internas (opcional)" id="notes"><textarea id="notes" name="notes" rows={3} className="w-full resize-y rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100" /></Field></div>
      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">{error}</div>}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Link href="/funcionarios" className="flex h-11 items-center justify-center rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-600">Cancelar</Link><button disabled={loading} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 text-sm font-bold text-white disabled:opacity-70">{loading ? <><LoaderCircle className="size-4 animate-spin" />Cadastrando...</> : <><Save className="size-4" />Criar acesso</>}</button></div>
    </form>
  </section>;
}

const inputClassName = "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-950 outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100";
function SectionTitle({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) { return <div className="flex items-center gap-3 border-b border-slate-100 pb-4"><div className="flex size-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600"><Icon className="size-4" /></div><div><h2 className="text-sm font-bold text-slate-950">{title}</h2><p className="mt-0.5 text-[10px] text-slate-400">{description}</p></div></div>; }
function Field({ label, id, children, className = "" }: { label: string; id: string; children: ReactNode; className?: string }) { return <div className={className}><label htmlFor={id} className="mb-1.5 block text-xs font-bold text-slate-700">{label}</label>{children}</div>; }
