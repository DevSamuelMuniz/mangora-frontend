"use client";

import Link from "next/link";
import { useT } from "@/i18n/provider";
import { useRouter } from "next/navigation";
import { FormEvent, type ReactNode, useState } from "react";
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  FileText,
  LoaderCircle,
  Save,
  WalletCards,
  type LucideIcon,
} from "lucide-react";

import { expenseCategories, incomeCategories } from "./financial-data";
import { financialTypeLabels, recurrenceLabels, type FinancialEntryType, type Recurrence, type StoredFinancialEntryStatus } from "@/types/financial";
import { useAccountCategories, useCostCenters, useCreateFinancialEntry } from "@/features/financial/hooks/useFinancialEntries";
import { brazilDateTimeToIso } from "@/lib/timezone";

export default function NewFinancialEntryForm() {
  const t = useT();
  const router = useRouter();
  const createEntry = useCreateFinancialEntry();
  const { data: costCenters } = useCostCenters();
  const { data: accountCategories } = useAccountCategories();
  const loading = createEntry.isPending;
  const [entryType, setEntryType] = useState<FinancialEntryType>("INCOME");
  const [entryStatus, setEntryStatus] = useState<StoredFinancialEntryStatus>("PENDING");
  const [error, setError] = useState("");
  const categories = entryType === "INCOME" ? incomeCategories : expenseCategories;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const description = String(formData.get("description") ?? "").trim();
    const category = String(formData.get("category") ?? "");
    const amount = Number(formData.get("amount"));
    const dueDate = String(formData.get("dueDate") ?? "");
    const recurrence = String(formData.get("recurrence") ?? "NONE") as Recurrence;
    const recurrenceDay = formData.get("recurrenceDay") ? Number(formData.get("recurrenceDay")) : undefined;
    const competenceDate = String(formData.get("competenceDate") ?? "");
    const recurrenceEndDate = String(formData.get("recurrenceEndDate") ?? "");

    setError("");

    if (description.length < 3) {
      setError(t("finance.form.errors.description"));
      return;
    }
    if (!category) {
      setError(t("finance.form.errors.category"));
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setError(t("finance.form.errors.amount"));
      return;
    }
    if (!dueDate) {
      setError(t("finance.form.errors.dueDate"));
      return;
    }

    try {
      await createEntry.mutateAsync({
        type: entryType,
        status: entryStatus,
        description,
        category,
        amount,
        dueDate: brazilDateTimeToIso(dueDate),
        paidAt: entryStatus === "PAID" ? brazilDateTimeToIso(String(formData.get("paymentDate"))) : undefined,
        account: String(formData.get("account")),
        contact: String(formData.get("contact") ?? "") || undefined,
        document: String(formData.get("document") ?? "") || undefined,
        costCenter: String(formData.get("costCenter") ?? "") || undefined,
        costCenterId: String(formData.get("costCenterId") ?? "") || undefined,
        accountCategoryId: String(formData.get("accountCategoryId") ?? "") || undefined,
        competenceDate: competenceDate ? brazilDateTimeToIso(competenceDate) : undefined,
        recurrence,
        recurrenceDay,
        recurrenceEndDate: recurrenceEndDate ? brazilDateTimeToIso(recurrenceEndDate) : undefined,
        paymentMethod: String(formData.get("paymentMethod") ?? "") || undefined,
        notes: String(formData.get("notes") ?? "") || undefined,
      });
      router.push(`/financeiro?toast=${encodeURIComponent(t("finance.toasts.created"))}`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t("finance.errors.save"));
    }
  }

  return (
    <section className="mx-auto max-w-5xl">
      <div className="flex items-start gap-3">
        <Link href="/financeiro" aria-label="Voltar para financeiro" className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-orange-600"><ArrowLeft className="size-4" /></Link>
        <div><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-orange-600">Gestão financeira</p><h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{t("finance.form.title")}</h1><p className="mt-1 text-xs text-slate-500">{t("finance.form.subtitle")}</p></div>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <SectionTitle icon={WalletCards} title="Tipo do lançamento" description={t("finance.form.typeHint")} />
          <fieldset className="mt-4 grid gap-3 sm:grid-cols-2">
            <legend className="sr-only">{t("finance.filters.type")}</legend>
            {(["INCOME", "EXPENSE"] as FinancialEntryType[]).map((type) => {
              const selected = entryType === type;
              const Icon = type === "INCOME" ? ArrowUpRight : ArrowDownRight;
              return <label key={type} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${selected ? type === "INCOME" ? "border-green-300 bg-green-50" : "border-red-300 bg-red-50" : "border-slate-200 hover:bg-slate-50"}`}><input type="radio" name="type" value={type} checked={selected} onChange={() => { setEntryType(type); setError(""); }} className="sr-only" /><div className={`flex size-9 items-center justify-center rounded-xl ${selected ? type === "INCOME" ? "bg-green-600 text-white" : "bg-red-600 text-white" : "bg-slate-100 text-slate-500"}`}><Icon className="size-4" /></div><div><p className="text-xs font-bold text-slate-800">{financialTypeLabels[type]}</p><p className="mt-0.5 text-[9px] text-slate-400">{type === "INCOME" ? t("finance.entryTypes.saleIncome") : t("finance.entryTypes.expense")}</p></div></label>;
            })}
          </fieldset>
        </div>

        <div className="grid items-start gap-4 lg:grid-cols-[1fr_0.7fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <SectionTitle icon={FileText} title={t("finance.details.main")} description={t("finance.details.mainHint")} />
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label={t("finance.form.fields.description")} id="description" className="sm:col-span-2"><input id="description" name="description" type="text" required minLength={3} placeholder={entryType === "INCOME" ? "Ex.: Venda de produtos" : "Ex.: Pagamento de fornecedor"} className={inputClassName} /></Field>
              <Field label={t("finance.form.fields.category")} id="category"><select key={entryType} id="category" name="category" required defaultValue="" className={inputClassName}><option value="" disabled>Selecione</option>{categories.map((category) => <option key={category} value={category}>{category}</option>)}</select></Field>
              <Field label={t("finance.form.fields.amount")} id="amount"><div className="relative"><span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">R$</span><input id="amount" name="amount" type="number" required min="0.01" step="0.01" placeholder={t("finance.form.fields.amountPlaceholder")} className={`${inputClassName} pl-10`} /></div></Field>
              <Field label={t("finance.form.fields.contact")} id="contact" className="sm:col-span-2"><input id="contact" name="contact" type="text" placeholder={entryType === "INCOME" ? "Cliente ou pagador" : "Fornecedor ou favorecido"} className={inputClassName} /></Field>
              <Field label={t("finance.details.reference")} id="document"><input id="document" name="document" type="text" placeholder={t("finance.details.referencePlaceholder")} className={inputClassName} /></Field>
              <Field label={t("finance.form.fields.costCenterOptional")} id="costCenter"><select id="costCenter" name="costCenter" defaultValue="" className={inputClassName}><option value="">Não informado</option><option value="Operação">Operação</option><option value="Comercial">Comercial</option><option value="Administrativo">Administrativo</option><option value="Marketing">Marketing</option></select></Field>
              <Field label={t("finance.form.fields.costCenter")} id="costCenterId"><select id="costCenterId" name="costCenterId" defaultValue="" className={inputClassName}><option value="">Não informado</option>{(costCenters ?? []).filter((item) => item.active).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field>
              <Field label={t("finance.form.fields.accounting")} id="accountCategoryId"><select id="accountCategoryId" name="accountCategoryId" defaultValue="" className={inputClassName}><option value="">Não informada</option>{(accountCategories ?? []).filter((item) => item.active).map((item) => <option key={item.id} value={item.id}>{item.code} — {item.name}</option>)}</select></Field>
            </div>
          </div>

          <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:sticky lg:top-20">
            <SectionTitle icon={WalletCards} title={t("finance.form.fields.paymentMethod")} description={t("finance.details.datesHint")} />
            <div className="mt-4 space-y-4">
              <Field label={t("finance.form.fields.dueDate")} id="dueDate"><input id="dueDate" name="dueDate" type="date" required className={inputClassName} /></Field>
              <Field label="Status" id="status"><select id="status" name="status" value={entryStatus} onChange={(event) => setEntryStatus(event.target.value as StoredFinancialEntryStatus)} className={inputClassName}><option value="PENDING">Pendente</option><option value="PAID">Pago</option></select></Field>
              {entryStatus === "PAID" && <Field label="Data do pagamento" id="paymentDate"><input id="paymentDate" name="paymentDate" type="date" required className={inputClassName} /></Field>}
              <Field label={t("finance.form.fields.competence")} id="competenceDate"><input id="competenceDate" name="competenceDate" type="date" className={inputClassName} /></Field>
              <Field label={t("finance.form.fields.recurrence")} id="recurrence"><select id="recurrence" name="recurrence" defaultValue="NONE" className={inputClassName}>{(Object.keys(recurrenceLabels) as Recurrence[]).map((rule) => <option key={rule} value={rule}>{recurrenceLabels[rule]}</option>)}</select></Field>
              <Field label={t("finance.form.fields.dueDay")} id="recurrenceDay"><input id="recurrenceDay" name="recurrenceDay" type="number" min={1} max={31} placeholder={t("finance.form.fields.dueDayPlaceholder")} className={inputClassName} /></Field>
              <Field label={t("finance.form.fields.recurrenceEnd")} id="recurrenceEndDate"><input id="recurrenceEndDate" name="recurrenceEndDate" type="date" className={inputClassName} /></Field>
              <Field label={t("finance.form.fields.account")} id="account"><select id="account" name="account" required defaultValue="Conta principal" className={inputClassName}><option value="Conta principal">Conta principal</option><option value="Caixa">Caixa</option><option value="Conta secundária">Conta secundária</option></select></Field>
              <Field label={t("finance.form.fields.paymentMethod")} id="paymentMethod"><select id="paymentMethod" name="paymentMethod" defaultValue="" className={inputClassName}><option value="">Não informada</option><option value="PIX">PIX</option><option value="Boleto">Boleto</option><option value="Cartão">Cartão</option><option value="Transferência">Transferência</option><option value="Dinheiro">Dinheiro</option></select></Field>
            </div>
          </aside>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><Field label={t("finance.form.fields.notes")} id="notes"><textarea id="notes" name="notes" rows={3} placeholder={t("finance.form.fields.notesPlaceholder")} className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100" /></Field></div>

        {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">{error}</div>}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Link href="/financeiro" className="flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-600 hover:bg-slate-50">{t("finance.actions.cancel")}</Link><button type="submit" disabled={loading} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 px-5 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0">{loading ? <><LoaderCircle className="size-4 animate-spin" />{t("finance.actions.saving")}</> : <><Save className="size-4" />{t("finance.actions.save")}</>}</button></div>
      </form>
    </section>
  );
}

const inputClassName = "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100";
function SectionTitle({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) { return <div className="flex items-center gap-3 border-b border-slate-100 pb-4"><div className="flex size-9 items-center justify-center rounded-xl bg-orange-50 text-orange-600"><Icon className="size-4" /></div><div><h2 className="text-sm font-bold text-slate-950">{title}</h2><p className="mt-0.5 text-[10px] text-slate-400">{description}</p></div></div>; }
function Field({ label, id, children, className = "" }: { label: string; id: string; children: ReactNode; className?: string }) { return <div className={className}><label htmlFor={id} className="mb-1.5 block text-xs font-bold text-slate-700">{label}</label>{children}</div>; }
