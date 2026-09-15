"use client";

import Link from "next/link";
import { useT } from "@/i18n/provider";
import { FormEvent, useEffect, useMemo, useState, type ReactNode } from "react";
import { Cake, CalendarHeart, CheckCircle2, LoaderCircle, Pencil, Search, ShieldCheck, UserPlus, UserRoundCheck, UserRoundX, Users, X } from "lucide-react";
import type { Employee, EmployeeRole } from "@/types/employee";
import { roleLabels, rolePermissions } from "./employee-data";
import { formatDate, formatDateTime } from "@/lib/format";
import { brazilDateKey, brazilDateTimeToIso } from "@/lib/timezone";
import { useEmployees, useToggleEmployeeStatus, useUpdateEmployeeProfile, useUpdateEmployeeRole } from "@/features/employees/hooks/useEmployees";

const roles = Object.keys(roleLabels) as EmployeeRole[];
const inputClass = "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100";

export default function EmployeeManagement() {
  const t = useT();
  const { data: employees = [], isLoading: loading, error } = useEmployees();
  const toggleStatusMutation = useToggleEmployeeStatus();
  const updateRoleMutation = useUpdateEmployeeRole();
  const updateProfileMutation = useUpdateEmployeeProfile();
  const saving = toggleStatusMutation.isPending || updateRoleMutation.isPending || updateProfileMutation.isPending;
  const [actionError, setActionError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<Employee | null>(null);
  const [toToggle, setToToggle] = useState<Employee | null>(null);
  const errorMessage = actionError || (error instanceof Error ? error.message : "");

  const filtered = useMemo(() => employees.filter((employee) => {
    const text = `${employee.name} ${employee.email} ${employee.phone ?? ""} ${employee.jobTitle ?? ""}`.toLocaleLowerCase("pt-BR");
    return text.includes(search.trim().toLocaleLowerCase("pt-BR")) && (role === "all" || employee.role === role) && (status === "all" || String(employee.active) === status);
  }), [employees, role, search, status]);
  const upcoming = useMemo(() => employees.flatMap((employee) => employee.birthDate ? [{ employee, days: daysUntil(employee.birthDate) }] : []).filter((item) => item.days <= 30).sort((a, b) => a.days - b.days), [employees]);

  useEffect(() => {
    if (!selected) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setSelected(null); };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [selected]);

  async function toggleStatus() {
    if (!toToggle) return;
    try {
      setActionError("");
      const updated = await toggleStatusMutation.mutateAsync({ id: toToggle.id, active: !toToggle.active });
      if (selected?.id === updated.id) setSelected(updated);
      setFeedback(updated.active ? t("employees.access.activated") : t("employees.access.deactivated"));
      setToToggle(null);
    } catch (cause) { setActionError(cause instanceof Error ? cause.message : t("employees.errors.accessUpdate")); }
  }

  async function updateRole(employee: Employee, nextRole: EmployeeRole) {
    try {
      setActionError("");
      const updated = await updateRoleMutation.mutateAsync({ id: employee.id, role: nextRole });
      setSelected(updated);
      setFeedback(t("employees.toasts.roleUpdated"));
    } catch (cause) { setActionError(cause instanceof Error ? cause.message : t("employees.errors.roleUpdate")); }
  }

  async function updateProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    const data = new FormData(event.currentTarget);
    try {
      setActionError("");
      const birthDate = String(data.get("birthDate") ?? "");
      const updated = await updateProfileMutation.mutateAsync({
        id: selected.id, payload: {
          jobTitle: String(data.get("jobTitle") ?? "") || null,
          employeeCode: String(data.get("employeeCode") ?? "") || null,
          startDate: brazilDateTimeToIso(String(data.get("startDate"))),
          birthDate: birthDate ? brazilDateTimeToIso(birthDate) : null,
          notes: String(data.get("notes") ?? "") || null,
          birthdayEmailEnabled: data.get("birthdayEmailEnabled") === "on",
          workAnniversaryEmailEnabled: data.get("workAnniversaryEmailEnabled") === "on",
        }
      });
      setSelected(updated);
      setFeedback(t("employees.toasts.updated"));
    } catch (cause) { setActionError(cause instanceof Error ? cause.message : t("employees.errors.save")); }
  }

  return <section>
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-orange-600">Equipe e acessos</p><h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">{t("employees.title")}</h1><p className="mt-1 text-xs text-slate-500">{t("employees.subtitle")}</p></div><Link href="/funcionarios?acao=novo" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 px-4 text-sm font-bold text-white shadow-lg shadow-orange-200"><UserPlus className="size-4" />{t("employees.actions.create")}</Link></div>

    <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Summary label="Pessoas na equipe" value={employees.length} icon={<Users className="size-4" />} /><Summary label={t("employees.metrics.activeAccess")} value={employees.filter((e) => e.active).length} icon={<UserRoundCheck className="size-4" />} tone="green" /><Summary label={t("employees.metrics.inactiveAccess")} value={employees.filter((e) => !e.active).length} icon={<UserRoundX className="size-4" />} tone="slate" /><Summary label={t("employees.metrics.birthdays")} value={upcoming.length} icon={<Cake className="size-4" />} tone="amber" /></div>

    {upcoming.length > 0 && <div className="mt-4 overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4"><div className="flex items-center gap-2"><CalendarHeart className="size-4 text-orange-600" /><p className="text-xs font-black text-slate-900">{t("employees.celebrations.title")}</p></div><div className="mt-3 flex gap-2 overflow-x-auto pb-1">{upcoming.slice(0, 6).map(({ employee, days }) => <button key={employee.id} type="button" onClick={() => setSelected(employee)} className="shrink-0 rounded-xl border border-orange-100 bg-white px-3 py-2 text-left shadow-sm"><p className="text-[11px] font-black text-slate-800">{employee.name}</p><p className="mt-0.5 text-[9px] font-bold text-orange-600">{days === 0 ? "Hoje 🎉" : `Em ${days} dia(s)`}</p></button>)}</div></div>}
    {feedback && <div role="status" className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-xs font-semibold text-green-700">{feedback}</div>}
    {errorMessage && <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">{errorMessage}</div>}

    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="grid gap-3 md:grid-cols-3"><label className="relative"><Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input aria-label={t("employees.search.label")} type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nome, e-mail, telefone ou cargo..." className={`${inputClass} pl-10`} /></label><select aria-label="Filtrar por função" value={role} onChange={(event) => setRole(event.target.value)} className={inputClass}><option value="all">Todas as funções</option>{roles.map((item) => <option key={item} value={item}>{roleLabels[item]}</option>)}</select><select aria-label="Filtrar por status" value={status} onChange={(event) => setStatus(event.target.value)} className={inputClass}><option value="all">Todos os acessos</option><option value="true">Ativos</option><option value="false">Inativos</option></select></div></div>

    <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {loading ? <Empty><LoaderCircle className="size-5 animate-spin text-orange-600" />{t("employees.loading")}</Empty> : filtered.length ? <>
        <div className="divide-y divide-slate-100 md:hidden">{filtered.map((employee) => <EmployeeCard key={employee.id} employee={employee} onOpen={() => setSelected(employee)} />)}</div>
        <div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[900px] text-left"><thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-3">{t("employees.table.employee")}</th><th className="px-4 py-3">{t("employees.table.contact")}</th><th className="px-4 py-3">Função</th><th className="px-4 py-3">{t("employees.celebrations.dates")}</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-center">{t("employees.table.actions")}</th></tr></thead><tbody className="divide-y divide-slate-100">{filtered.map((employee) => <tr key={employee.id} className="hover:bg-orange-50/30"><td className="px-5 py-3.5"><p className="text-xs font-bold text-slate-800">{employee.name}</p><p className="mt-1 text-[10px] text-slate-400">{employee.jobTitle || t("employees.notInformed")}</p></td><td className="px-4 py-3.5"><p className="text-xs font-semibold text-slate-700">{employee.email}</p><p className="mt-1 text-[10px] text-slate-400">{employee.phone || t("employees.noPhone")}</p></td><td className="px-4 py-3.5"><RoleBadge role={employee.role} /></td><td className="px-4 py-3.5"><p className="text-[10px] text-slate-600">Admissão: {formatDate(employee.startDate)}</p><p className="mt-1 text-[10px] text-slate-400">Nascimento: {employee.birthDate ? formatDate(employee.birthDate) : "não informado"}</p></td><td className="px-4 py-3.5"><StatusBadge active={employee.active} /></td><td className="px-4 py-3.5 text-center"><button type="button" onClick={() => setSelected(employee)} className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-[11px] font-bold text-slate-600 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"><Pencil className="size-3.5" />{t("employees.actions.manage")}</button></td></tr>)}</tbody></table></div>
      </> : <Empty>{t("employees.empty.filtered")}</Empty>}
    </div>

    {selected && <EmployeeModal employee={selected} saving={saving} onClose={() => setSelected(null)} onRole={updateRole} onEdit={updateProfile} onToggle={() => setToToggle(selected)} />}
    {toToggle && <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/50 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setToToggle(null); }}><div role="alertdialog" aria-modal="true" className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl"><h2 className="text-base font-black text-slate-950">{toToggle.active ? "Inativar" : "Ativar"} acesso de {toToggle.name}?</h2><p className="mt-2 text-xs leading-5 text-slate-500">{toToggle.active ? "As sessões abertas serão encerradas imediatamente. O histórico será preservado." : "O funcionário poderá entrar novamente na plataforma."}</p><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setToToggle(null)} className="h-10 rounded-xl border border-slate-200 px-4 text-xs font-bold">Voltar</button><button type="button" disabled={saving} onClick={() => void toggleStatus()} className="h-10 rounded-xl bg-orange-600 px-4 text-xs font-bold text-white disabled:opacity-60">Confirmar</button></div></div></div>}
  </section>;
}

function EmployeeModal({ employee, saving, onClose, onRole, onEdit, onToggle }: { employee: Employee; saving: boolean; onClose: () => void; onRole: (employee: Employee, role: EmployeeRole) => Promise<void>; onEdit: (event: FormEvent<HTMLFormElement>) => Promise<void>; onToggle: () => void }) {
  const t = useT();
  return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-sm sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div role="dialog" aria-modal="true" aria-labelledby="employee-dialog-title" className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
    <header className="flex items-start justify-between border-b border-slate-200 bg-gradient-to-r from-orange-50 to-amber-50 px-5 py-4 sm:px-6"><div><p className="text-[10px] font-black uppercase tracking-[0.15em] text-white">{t("employees.drawer.title")}</p><h2 id="employee-dialog-title" className="mt-1 text-xl font-black text-slate-900">{employee.name}</h2><p className="mt-1 text-[11px] text-slate-50">{employee.email} · último acesso {employee.lastAccessAt ? formatDateTime(employee.lastAccessAt) : "ainda não realizado"}</p></div><button type="button" aria-label="Fechar ficha" onClick={onClose} className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm hover:text-orange-600"><X className="size-4" /></button></header>
    <form key={`${employee.id}:${employee.startDate}:${employee.birthDate ?? ""}`} onSubmit={(event) => void onEdit(event)} className="overflow-y-auto p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2"><Field label={t("employees.form.fields.jobTitleShort")} id="jobTitle"><input id="jobTitle" name="jobTitle" defaultValue={employee.jobTitle ?? ""} className={inputClass} /></Field><Field label="Código interno" id="employeeCode"><input id="employeeCode" name="employeeCode" defaultValue={employee.employeeCode ?? ""} className={inputClass} /></Field><Field label="Data de admissão" id="startDate"><input id="startDate" name="startDate" type="date" required defaultValue={brazilDateKey(employee.startDate)} className={inputClass} /></Field><Field label="Data de nascimento" id="birthDate"><input id="birthDate" name="birthDate" type="date" max={new Date().toISOString().slice(0, 10)} defaultValue={employee.birthDate ? brazilDateKey(employee.birthDate) : ""} className={inputClass} /></Field></div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2"><EmailToggle name="birthdayEmailEnabled" defaultChecked={employee.birthdayEmailEnabled} icon={<Cake className="size-4" />} title="Parabéns no aniversário" text={t("employees.celebrations.birthdayEmailHint")} /><EmailToggle name="workAnniversaryEmailEnabled" defaultChecked={employee.workAnniversaryEmailEnabled} icon={<CalendarHeart className="size-4" />} title="Aniversário de empresa" text={t("employees.celebrations.companyAnniversaryHint")} /></div>
      <Field label={t("employees.form.fields.notes")} id="notes" className="mt-4"><textarea id="notes" name="notes" rows={3} defaultValue={employee.notes ?? ""} className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-700 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100" /></Field>
      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-end"><Field label="Função e nível de acesso" id="employeeRole" className="flex-1"><select id="employeeRole" disabled={saving || employee.role === "OWNER"} value={employee.role} onChange={(event) => void onRole(employee, event.target.value as EmployeeRole)} className={inputClass}>{roles.filter((item) => item !== "OWNER" || employee.role === "OWNER").map((item) => <option key={item} value={item}>{roleLabels[item]}</option>)}</select></Field>{employee.role !== "OWNER" && <button type="button" onClick={onToggle} className={`h-11 rounded-xl border px-4 text-xs font-black ${employee.active ? "border-red-200 bg-white text-red-600 hover:bg-red-50" : "border-green-200 bg-white text-green-700 hover:bg-green-50"}`}>{employee.active ? "Inativar acesso" : "Ativar acesso"}</button>}</div><ul className="mt-4 grid gap-2 sm:grid-cols-2">{rolePermissions[employee.role].map((item) => <li key={item} className="flex gap-2 text-[11px] text-slate-600"><CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-green-500" />{item}</li>)}</ul></div>
      <footer className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} className="h-11 rounded-xl border border-slate-200 px-5 text-xs font-bold text-slate-600">{t("employees.actions.close")}</button><button type="submit" disabled={saving} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 text-xs font-black text-white shadow-md shadow-orange-200 disabled:opacity-60">{saving ? <LoaderCircle className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}Salvar alterações</button></footer>
    </form>
  </div></div>;
}

function EmployeeCard({ employee, onOpen }: { employee: Employee; onOpen: () => void }) { return <button type="button" onClick={onOpen} className="flex w-full items-center gap-3 p-4 text-left hover:bg-orange-50/40"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 font-black text-orange-700">{employee.name.slice(0, 1).toUpperCase()}</span><span className="min-w-0 flex-1"><strong className="block truncate text-xs text-slate-900">{employee.name}</strong><span className="mt-1 block truncate text-[10px] text-slate-500">{employee.jobTitle || roleLabels[employee.role]} · {employee.email}</span></span><StatusBadge active={employee.active} /></button>; }
function RoleBadge({ role }: { role: EmployeeRole }) { return <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-bold text-orange-700"><ShieldCheck className="size-3" />{roleLabels[role]}</span>; }
function StatusBadge({ active }: { active: boolean }) { return <span className={`shrink-0 rounded-full px-2.5 py-1 text-[9px] font-bold ${active ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"}`}>{active ? "Ativo" : "Inativo"}</span>; }
function Summary({ label, value, icon, tone = "orange" }: { label: string; value: number; icon: ReactNode; tone?: "orange" | "green" | "slate" | "amber" }) { const colors = { orange: "bg-orange-50 text-orange-600", green: "bg-green-50 text-green-700", slate: "bg-slate-100 text-slate-500", amber: "bg-amber-50 text-amber-600" }; return <article className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className={`flex size-10 items-center justify-center rounded-xl ${colors[tone]}`}>{icon}</div><div><p className="text-[10px] font-semibold text-slate-400">{label}</p><p className="text-xl font-black text-slate-950">{value}</p></div></article>; }
function Field({ label, id, children, className = "" }: { label: string; id: string; children: ReactNode; className?: string }) { return <div className={className}><label htmlFor={id} className="mb-1.5 block text-xs font-bold text-slate-700">{label}</label>{children}</div>; }
function EmailToggle({ name, defaultChecked, icon, title, text }: { name: string; defaultChecked: boolean; icon: ReactNode; title: string; text: string }) { return <label className="flex cursor-pointer gap-3 rounded-2xl border border-orange-100 bg-orange-50/50 p-3"><span className="mt-0.5 text-orange-600">{icon}</span><span className="min-w-0 flex-1"><strong className="block text-[11px] text-slate-800">{title}</strong><span className="mt-1 block text-[9px] leading-4 text-slate-500">{text}</span></span><input name={name} type="checkbox" defaultChecked={defaultChecked} className="mt-0.5 size-4 accent-orange-600" /></label>; }
function Empty({ children }: { children: ReactNode }) { return <div className="flex min-h-64 items-center justify-center gap-2 p-6 text-center text-sm text-slate-500">{children}</div>; }
function daysUntil(value: string) { const date = new Date(value); const now = new Date(); const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()); let next = Date.UTC(now.getFullYear(), date.getMonth(), date.getDate()); if (next < today) next = Date.UTC(now.getFullYear() + 1, date.getMonth(), date.getDate()); return Math.round((next - today) / 86_400_000); }
