"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { CheckCircle2, Eye, LoaderCircle, MoreHorizontal, Search, ShieldCheck, UserPlus, UserRoundCheck, UserRoundX, Users, X } from "lucide-react";
import { apiRequest } from "@/lib/api/client";
import type { Employee, EmployeeRole } from "@/types/employee";
import { roleLabels, rolePermissions } from "./employee-data";

const roles = Object.keys(roleLabels) as EmployeeRole[];

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<Employee | null>(null);
  const [toToggle, setToToggle] = useState<Employee | null>(null);

  useEffect(() => {
    let active = true;
    void apiRequest<Employee[]>("/employees")
      .then((items) => { if (active) setEmployees(items); })
      .catch((cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : "Não foi possível carregar a equipe."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => employees.filter((employee) => {
    const text = `${employee.name} ${employee.email} ${employee.phone ?? ""}`.toLocaleLowerCase("pt-BR");
    return text.includes(search.trim().toLocaleLowerCase("pt-BR")) && (role === "all" || employee.role === role) && (status === "all" || String(employee.active) === status);
  }), [employees, role, search, status]);

  async function toggleStatus() {
    if (!toToggle) return;
    try {
      setSaving(true); setError("");
      const updated = await apiRequest<Employee>(`/employees/${toToggle.id}/status`, { method: "PATCH", body: JSON.stringify({ active: !toToggle.active }) });
      setEmployees((items) => items.map((item) => item.id === updated.id ? updated : item));
      if (selected?.id === updated.id) setSelected(updated);
      setToToggle(null);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível alterar o acesso."); }
    finally { setSaving(false); }
  }

  async function updateRole(employee: Employee, nextRole: EmployeeRole) {
    try {
      setSaving(true); setError("");
      const updated = await apiRequest<Employee>(`/employees/${employee.id}/role`, { method: "PATCH", body: JSON.stringify({ role: nextRole }) });
      setEmployees((items) => items.map((item) => item.id === updated.id ? updated : item)); setSelected(updated);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível alterar o papel."); }
    finally { setSaving(false); }
  }

  return <section>
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-violet-600">Administração</p><h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">Funcionários</h1><p className="mt-1 text-xs text-slate-500">Gerencie acessos e permissões reais da equipe.</p></div><Link href="/funcionarios/novo" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 text-sm font-bold text-white shadow-lg shadow-violet-200"><UserPlus className="size-4" />Novo funcionário</Link></div>
    <div className="mt-5 grid gap-3 sm:grid-cols-3"><Summary label="Total da equipe" value={employees.length} icon={<Users className="size-4" />} /><Summary label="Acessos ativos" value={employees.filter((e) => e.active).length} icon={<UserRoundCheck className="size-4" />} /><Summary label="Acessos inativos" value={employees.filter((e) => !e.active).length} icon={<UserRoundX className="size-4" />} /></div>
    {error && <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">{error}</div>}
    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="grid gap-3 md:grid-cols-3"><label className="relative"><Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input aria-label="Buscar funcionários" type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nome, e-mail ou telefone..." className={`${inputClass} pl-10`} /></label><select aria-label="Filtrar por função" value={role} onChange={(e) => setRole(e.target.value)} className={inputClass}><option value="all">Função: todas</option>{roles.map((item) => <option key={item} value={item}>{roleLabels[item]}</option>)}</select><select aria-label="Filtrar por status" value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}><option value="all">Status: todos</option><option value="true">Ativos</option><option value="false">Inativos</option></select></div></div>
    <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {loading ? <div className="flex min-h-64 items-center justify-center gap-2 text-sm text-slate-500"><LoaderCircle className="size-4 animate-spin" />Carregando equipe...</div> : filtered.length ? <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left"><thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-3">Funcionário</th><th className="px-4 py-3">Contato</th><th className="px-4 py-3">Função</th><th className="px-4 py-3">Último acesso</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Ações</th></tr></thead><tbody className="divide-y divide-slate-100">{filtered.map((employee) => <tr key={employee.id} className="hover:bg-slate-50"><td className="px-5 py-3.5"><p className="text-xs font-bold text-slate-800">{employee.name}</p><p className="mt-1 text-[10px] text-slate-400">Desde {formatDate(employee.startDate)}</p></td><td className="px-4 py-3.5"><p className="text-xs font-semibold text-slate-700">{employee.email}</p><p className="mt-1 text-[10px] text-slate-400">{employee.phone || "Sem telefone"}</p></td><td className="px-4 py-3.5"><span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-bold text-violet-700"><ShieldCheck className="size-3" />{roleLabels[employee.role]}</span></td><td className="px-4 py-3.5 text-xs text-slate-600">{employee.lastAccessAt ? formatDateTime(employee.lastAccessAt) : "Nunca acessou"}</td><td className="px-4 py-3.5"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${employee.active ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>{employee.active ? "Ativo" : "Inativo"}</span></td><td className="px-4 py-3.5"><details className="relative inline-block"><summary aria-label={`Ações de ${employee.name}`} className="flex size-8 cursor-pointer list-none items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"><MoreHorizontal className="size-4" /></summary><div className="absolute right-0 z-20 mt-1 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"><button onClick={() => setSelected(employee)} className="flex h-9 w-full items-center gap-2 rounded-lg px-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"><Eye className="size-3.5" />Ver permissões</button>{employee.role !== "OWNER" && <button onClick={() => setToToggle(employee)} className={`flex h-9 w-full items-center gap-2 rounded-lg px-2.5 text-xs font-semibold ${employee.active ? "text-red-600 hover:bg-red-50" : "text-emerald-600 hover:bg-emerald-50"}`}>{employee.active ? <UserRoundX className="size-3.5" /> : <UserRoundCheck className="size-3.5" />}{employee.active ? "Inativar acesso" : "Ativar acesso"}</button>}</div></details></td></tr>)}</tbody></table></div> : <div className="flex min-h-64 items-center justify-center text-sm text-slate-500">Nenhum funcionário encontrado.</div>}
    </div>
    {selected && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/40 p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) setSelected(null); }}><div role="dialog" aria-modal="true" className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl"><div className="flex justify-between"><div><p className="text-[10px] font-bold uppercase text-violet-600">Acesso do funcionário</p><h2 className="mt-1 text-lg font-black text-slate-950">{selected.name}</h2></div><button aria-label="Fechar detalhes" onClick={() => setSelected(null)} className="flex size-9 items-center justify-center rounded-xl hover:bg-slate-100"><X className="size-4" /></button></div>{selected.role !== "OWNER" && <label className="mt-4 block text-xs font-bold text-slate-700">Papel<select disabled={saving} value={selected.role} onChange={(e) => void updateRole(selected, e.target.value as EmployeeRole)} className={`${inputClass} mt-1.5`}>{roles.filter((item) => item !== "OWNER").map((item) => <option key={item} value={item}>{roleLabels[item]}</option>)}</select></label>}<div className="mt-4 rounded-xl bg-slate-50 p-3"><p className="text-[10px] font-bold uppercase text-slate-400">Permissões aplicadas</p><ul className="mt-3 grid gap-2 sm:grid-cols-2">{rolePermissions[selected.role].map((item) => <li key={item} className="flex gap-2 text-xs text-slate-600"><CheckCircle2 className="size-3.5 shrink-0 text-emerald-500" />{item}</li>)}</ul></div></div></div>}
    {toToggle && <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/40 p-4"><div role="alertdialog" className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl"><h2 className="text-base font-black text-slate-950">{toToggle.active ? "Inativar" : "Ativar"} acesso?</h2><p className="mt-2 text-xs leading-5 text-slate-500">{toToggle.active ? "As sessões abertas serão encerradas imediatamente." : "O funcionário poderá entrar novamente na plataforma."}</p><div className="mt-5 flex justify-end gap-2"><button onClick={() => setToToggle(null)} className="h-10 rounded-xl border border-slate-200 px-4 text-xs font-bold">Cancelar</button><button disabled={saving} onClick={() => void toggleStatus()} className="h-10 rounded-xl bg-violet-600 px-4 text-xs font-bold text-white disabled:opacity-60">Confirmar</button></div></div></div>}
  </section>;
}

const inputClass = "h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-600 outline-none focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100";
function Summary({ label, value, icon }: { label: string; value: number; icon: ReactNode }) { return <article className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex size-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">{icon}</div><div><p className="text-[10px] font-semibold text-slate-400">{label}</p><p className="text-xl font-black text-slate-950">{value}</p></div></article>; }
function formatDate(value: string) { return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(value)); }
function formatDateTime(value: string) { return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value)); }
