"use client";

import { useState, type FormEvent } from "react";
import { LoaderCircle, UserPlus, X } from "lucide-react";

import { useSaveCustomer } from "@/features/customers/hooks/useCustomers";
import { useToast } from "@/components/ui/toast";
import type { Customer } from "@/types/customer";

type NewCustomerModalProps = {
    onCreated: (customer: Customer) => void;
    onClose: () => void;
};

/** Cadastro rápido de cliente direto do terminal. */
export default function NewCustomerModal({ onCreated, onClose }: NewCustomerModalProps) {
    const saveCustomer = useSaveCustomer();
    const toast = useToast();
    const [name, setName] = useState("");
    const [document, setDocument] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [error, setError] = useState("");

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const digits = document.replace(/\D/g, "");
        if (name.trim().length < 3) return setError("Informe um nome com ao menos 3 letras.");
        if (!/^\d{11}$|^\d{14}$/.test(digits)) return setError("CPF/CNPJ deve ter 11 ou 14 dígitos.");
        if (!email.includes("@")) return setError("Informe um e-mail válido.");
        if (!/^\d{10,15}$/.test(phone.replace(/\D/g, ""))) return setError("Informe um telefone válido com DDD.");
        setError("");

        try {
            const customer = await saveCustomer.mutateAsync({
                id: null,
                payload: {
                    type: digits.length === 11 ? "INDIVIDUAL" : "COMPANY",
                    name: name.trim(),
                    tradeName: digits.length === 14 ? name.trim() : null,
                    document: digits,
                    email: email.trim().toLowerCase(),
                    phone: phone.replace(/\D/g, ""),
                    active: true,
                },
            });
            toast.success("Cliente cadastrado e selecionado na venda.");
            onCreated(customer);
        } catch (cause) {
            toast.error(cause instanceof Error ? cause.message : "Não foi possível cadastrar o cliente.");
        }
    }

    const inputClass = "h-12 w-full rounded-xl border border-white/10 bg-[#123d2b] px-3 text-sm font-semibold text-white outline-none placeholder:text-white/40 focus:border-[#ffb21a]";
    const labelClass = "mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white/60";

    return (
        <div onMouseDown={(event) => { if (event.target === event.currentTarget && !saveCustomer.isPending) onClose(); }} className="fixed inset-0 z-[95] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <form onSubmit={submit} role="dialog" aria-modal="true" className="w-full max-w-md rounded-2xl bg-[#0a2418] p-5 shadow-2xl">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <span className="flex size-9 items-center justify-center rounded-xl bg-orange-500/15 text-orange-400"><UserPlus className="size-4" /></span>
                        <div>
                            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-orange-400">Novo cliente</p>
                            <h2 className="font-[family-name:var(--font-bricolage)] text-lg font-black text-white">Cadastro rápido</h2>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} aria-label="Fechar" className="flex size-9 items-center justify-center rounded-xl text-white/50 hover:bg-white/5 hover:text-white"><X className="size-4" /></button>
                </div>

                <div className="mt-4 grid gap-3">
                    <label className="block"><span className={labelClass}>Nome / razão social *</span><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: Maria Silva" className={inputClass} /></label>
                    <div className="grid grid-cols-2 gap-3">
                        <label className="block"><span className={labelClass}>CPF / CNPJ *</span><input value={document} onChange={(event) => setDocument(event.target.value.replace(/\D/g, "").slice(0, 14))} inputMode="numeric" placeholder="Somente números" className={inputClass} /></label>
                        <label className="block"><span className={labelClass}>Telefone *</span><input value={phone} onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 11))} inputMode="numeric" placeholder="Com DDD" className={inputClass} /></label>
                    </div>
                    <label className="block"><span className={labelClass}>E-mail *</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="cliente@email.com" className={inputClass} /></label>
                </div>

                {error && <p role="alert" className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300">{error}</p>}

                <div className="mt-5 flex gap-2">
                    <button type="button" onClick={onClose} disabled={saveCustomer.isPending} className="h-12 flex-1 rounded-xl border border-white/15 text-sm font-bold text-white/70 hover:bg-white/5 disabled:opacity-50">Cancelar</button>
                    <button type="submit" disabled={saveCustomer.isPending} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 font-[family-name:var(--font-bricolage)] text-sm font-black text-white hover:brightness-110 disabled:opacity-60">
                        {saveCustomer.isPending ? <><LoaderCircle className="size-4 animate-spin" />Salvando...</> : <><UserPlus className="size-4" />Cadastrar</>}
                    </button>
                </div>
            </form>
        </div>
    );
}
