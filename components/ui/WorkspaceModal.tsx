"use client";

import { FormEvent, useEffect, useState, type ReactNode } from "react";
import { KeyRound, LoaderCircle, LockKeyhole, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiRequest, rememberOperationPassword } from "@/lib/api/client";
import { useCompanySettings } from "@/features/settings/hooks/useSettings";

type WorkspaceModalProps = {
  children: ReactNode;
  closeHref: string;
  label: string;
  size?: "medium" | "large" | "wide";
};

const sizes = {
  medium: "max-w-3xl",
  large: "max-w-5xl",
  wide: "max-w-7xl",
};

export default function WorkspaceModal({ children, closeHref, label, size = "large" }: WorkspaceModalProps) {
  const router = useRouter();
  const { data: settings, isLoading } = useCompanySettings();
  const policy = ["/produtos", "/clientes", "/fornecedores", "/servicos", "/funcionarios"].includes(closeHref) ? "records" : closeHref === "/estoque" ? "stock" : null;
  const passwordRequired = policy === "records" ? settings?.requirePasswordForRecords : policy === "stock" ? settings?.requirePasswordForStock : false;
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);

  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setVerifying(true); setError("");
      await apiRequest<{ verified: boolean }>("/auth/operation-password/verify", { method: "POST", body: JSON.stringify({ password }) });
      rememberOperationPassword(password);
      setPassword(""); setUnlocked(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível confirmar sua senha.");
    } finally { setVerifying(false); }
  }

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") router.replace(closeHref, { scroll: false });
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [closeHref, router]);

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-[#123d2b]/45 p-0 backdrop-blur-sm sm:items-center sm:p-5">
      <button type="button" aria-label={`Fechar ${label}`} onClick={() => router.replace(closeHref, { scroll: false })} className="absolute inset-0 cursor-default" />
      <div role="dialog" aria-modal="true" aria-label={label} className={`relative max-h-[96vh] w-full overflow-y-auto rounded-t-[1.75rem] border border-[#123d2b]/20 bg-[#e9dfd2] p-4 shadow-[0_28px_90px_rgba(18,61,43,0.32)] sm:max-h-[92vh] sm:rounded-[1.75rem] sm:p-6 ${sizes[size]}`}>
        <div className="sticky top-0 z-20 -mx-1 mb-4 flex justify-end bg-gradient-to-b from-[#e9dfd2] via-[#e9dfd2] to-transparent px-1 pb-3">
          <button type="button" onClick={() => router.replace(closeHref, { scroll: false })} className="flex size-10 items-center justify-center rounded-xl border border-[#123d2b]/10 bg-white text-[#597064] shadow-sm transition hover:border-orange-200 hover:text-orange-700" aria-label={`Fechar ${label}`}>
            <X className="size-4" />
          </button>
        </div>
        {isLoading && policy ? <div className="flex min-h-64 items-center justify-center gap-2 text-sm font-bold text-[#597064]"><LoaderCircle className="size-4 animate-spin" />Verificando proteção da operação...</div> : passwordRequired && !unlocked ? <form onSubmit={(event) => void verify(event)} className="mx-auto flex min-h-[340px] max-w-md flex-col items-center justify-center text-center"><span className="grid size-16 place-items-center rounded-2xl bg-orange-100 text-orange-700"><LockKeyhole className="size-7" /></span><p className="mt-5 text-[10px] font-black uppercase tracking-[0.18em] text-orange-700">Operação protegida</p><h2 className="mt-2 text-2xl font-black text-[#173d2b]">Confirme sua senha</h2><p className="mt-2 max-w-sm text-xs leading-5 text-[#597064]">Informe a senha da sua conta para {label.toLowerCase()}. Esta regra também se aplica ao dono.</p><label className="mt-6 w-full text-left text-xs font-bold text-[#173d2b]">Senha<div className="relative mt-1.5"><KeyRound className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-orange-600" /><input autoFocus type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="h-12 w-full rounded-xl border border-[#173d2b]/20 bg-white pl-10 pr-4 text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100" /></div></label>{error && <p role="alert" className="mt-3 w-full rounded-xl border border-red-200 bg-red-50 p-3 text-left text-xs font-bold text-red-700">{error}</p>}<button disabled={verifying || !password} className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 text-sm font-black text-white shadow-md shadow-orange-200 disabled:opacity-50">{verifying ? <LoaderCircle className="size-4 animate-spin" /> : <LockKeyhole className="size-4" />}{verifying ? "Confirmando..." : "Confirmar e continuar"}</button></form> : children}
      </div>
    </div>
  );
}
