"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowRight, CalendarClock, Gift, ShieldCheck, X } from "lucide-react";
import type { AuthSession } from "@/lib/auth/types";

export default function TrialAccessGate({ session }: { session: AuthSession }) {
  const pathname = usePathname();
  const [showTrialEnded, setShowTrialEnded] = useState(false);
  const { company, membership } = session;
  const canResolveBilling = membership.role === "OWNER";
  const billingRoute = pathname === "/assinatura";
  useEffect(() => {
    if (!company.trialExpired || billingRoute) return;
    const key = `mangora:trial-ended:${company.id}:${company.trialEndsAt ?? "expired"}`;
    const timer = window.setTimeout(() => {
      setShowTrialEnded(window.localStorage.getItem(key) !== "dismissed");
    }, 0);
    return () => window.clearTimeout(timer);
  }, [billingRoute, company.id, company.trialEndsAt, company.trialExpired]);

  function continueOnFree() {
    const key = `mangora:trial-ended:${company.id}:${company.trialEndsAt ?? "expired"}`;
    window.localStorage.setItem(key, "dismissed");
    setShowTrialEnded(false);
  }

  if (showTrialEnded) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#123d2b]/80 p-4 backdrop-blur-md" role="dialog" aria-modal="true" aria-labelledby="trial-ended-title">
        <div className="relative w-full max-w-xl overflow-hidden rounded-[2rem] border-2 border-[#123d2b] bg-white p-6 shadow-[10px_10px_0_#ffb21a] sm:p-9">
          <button type="button" onClick={continueOnFree} aria-label="Fechar aviso" className="absolute right-5 top-5 flex size-9 items-center justify-center rounded-full border border-[#123d2b]/10 text-[#315847] transition hover:bg-[#fff8ea]"><X className="size-4" /></button>
          <div className="absolute -right-12 -top-12 flex size-40 items-end justify-start rounded-full bg-[#fff0dd] pl-7 pb-5 font-[family-name:var(--font-bricolage)] text-7xl font-black text-[#ff6b1a]" aria-hidden="true">0</div>
          <span className="flex size-12 items-center justify-center rounded-2xl bg-[#dff4e7] text-[#147a45]"><Gift className="size-6" /></span>
          <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-[#ce4a0a]">Fim do período gratuito</p>
          <h2 id="trial-ended-title" className="mt-2 max-w-md font-[family-name:var(--font-bricolage)] text-3xl font-black leading-tight text-[#123d2b] sm:text-4xl">Seus 7 dias completos terminaram.</h2>
          <p className="mt-4 max-w-lg text-sm font-semibold leading-6 text-[#597064]">Sua conta continua ativa no plano Free, sem cobrança. Seus dados e os recursos essenciais permanecem disponíveis. {canResolveBilling ? "Quando quiser mais capacidade, escolha um plano pago." : "O proprietário pode ampliar o plano quando a empresa precisar."}</p>
          <div className="mt-7 grid gap-3 sm:grid-cols-[1fr_auto]">{canResolveBilling && <Link href="/assinatura" className="group flex h-12 items-center justify-center gap-2 rounded-xl bg-[#ff6b1a] px-5 text-sm font-extrabold text-white shadow-[0_4px_0_#c9460b] transition hover:-translate-y-0.5">Comparar planos<ArrowRight className="size-4 transition group-hover:translate-x-1" /></Link>}<button type="button" onClick={continueOnFree} className="flex h-12 items-center justify-center rounded-xl border-2 border-[#123d2b]/15 px-5 text-xs font-extrabold text-[#315847] hover:bg-[#fff8ea]">Continuar no Free</button></div>
          <div className="mt-6 flex items-center gap-2 border-t border-[#123d2b]/10 pt-5 text-xs font-semibold text-[#597064]"><ShieldCheck className="size-4 text-[#147a45]" />Nenhum cadastro ou histórico foi apagado.</div>
        </div>
      </div>
    );
  }

  if (company.subscriptionStatus === "TRIAL" && company.trialDaysRemaining > 0) {
    return (
      <div className="border-b border-[#ffb21a]/30 bg-[#fff0dd] px-4 py-2.5 text-[#123d2b] sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-2 text-xs">
          <p className="flex items-center gap-2 font-bold"><CalendarClock className="size-4 text-[#ce4a0a]" /><strong>{company.trialDaysRemaining} {company.trialDaysRemaining === 1 ? "dia grátis restante" : "dias grátis restantes"}.</strong><span className="hidden font-medium text-[#597064] sm:inline">Explore tudo e escolha seu plano quando estiver pronto.</span></p>
          {canResolveBilling && <Link href="/assinatura" className="font-black text-[#a93a05] underline decoration-2 underline-offset-4">Conhecer os planos</Link>}
        </div>
      </div>
    );
  }

  if (company.subscriptionPlan === "FREE" && !billingRoute) {
    return (
      <div className="border-b border-[#147a45]/20 bg-[#edf8f1] px-4 py-2.5 text-[#123d2b] sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-2 text-xs"><p className="flex items-center gap-2 font-bold"><Gift className="size-4 text-[#147a45]" /><strong>Plano Free ativo.</strong><span className="hidden font-medium text-[#597064] sm:inline">Continue no essencial sem cobrança.</span></p>{canResolveBilling && <Link href="/assinatura" className="font-black text-[#147a45] underline decoration-2 underline-offset-4">Conhecer recursos pagos</Link>}</div>
      </div>
    );
  }

  return null;
}
