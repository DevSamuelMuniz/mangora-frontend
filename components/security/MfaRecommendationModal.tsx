"use client";

import Link from "next/link";
import { ShieldCheck, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { AuthSession } from "@/lib/auth/types";

const REMIND_AFTER_MS = 7 * 24 * 60 * 60 * 1000;

export default function MfaRecommendationModal({ session }: { session: AuthSession }) {
  const [open, setOpen] = useState(false);
  const storageKey = `mangora:mfa-reminder:${session.user.id}`;

  useEffect(() => {
    if (session.security.mfaEnabled) return;
    const timer = window.setTimeout(() => {
      const dismissedAt = Number(window.localStorage.getItem(storageKey) ?? 0);
      if (!dismissedAt || Date.now() - dismissedAt >= REMIND_AFTER_MS) setOpen(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [session.security.mfaEnabled, storageKey]);

  function dismiss() {
    window.localStorage.setItem(storageKey, String(Date.now()));
    setOpen(false);
  }

  if (!open) return null;
  return <div className="fixed inset-0 z-[100] grid place-items-center bg-[#123d2b]/55 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) dismiss(); }}><section role="dialog" aria-modal="true" aria-labelledby="mfa-recommendation-title" className="w-full max-w-md rounded-[1.75rem] border-2 border-[#123d2b] bg-white p-6 shadow-[7px_8px_0_#ffb21a] sm:p-8"><div className="flex items-start justify-between gap-4"><span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#dff4e7] text-[#147a45]"><ShieldCheck className="size-6" /></span><button type="button" onClick={dismiss} aria-label="Fechar recomendação" className="grid size-10 place-items-center rounded-xl text-slate-500 hover:bg-slate-100"><X className="size-5" /></button></div><p className="mt-5 text-[11px] font-black uppercase tracking-[.16em] text-[#ff6b1a]">Recomendação de segurança</p><h2 id="mfa-recommendation-title" className="mt-2 text-2xl font-black text-[#123d2b]">Proteja sua conta com A2F</h2><p className="mt-3 text-sm leading-6 text-[#597064]">A autenticação em duas etapas é opcional, mas ajuda a impedir acessos indevidos mesmo que sua senha seja descoberta.</p><div className="mt-6 grid gap-3 sm:grid-cols-2"><button type="button" onClick={dismiss} className="h-11 rounded-xl border-2 border-[#123d2b]/15 text-xs font-black text-[#315847]">Agora não</button><Link href="/configuracoes?secao=security" onClick={dismiss} className="flex h-11 items-center justify-center rounded-xl bg-[#ff6b1a] text-xs font-black text-white shadow-[0_4px_0_#c9460b]">Configurar A2F</Link></div><p className="mt-4 text-center text-[10px] text-slate-400">Se dispensar, lembraremos novamente em 7 dias.</p></section></div>;
}
