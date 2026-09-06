"use client";

import Link from "next/link";
import { CalendarClock, LoaderCircle, ShieldCheck, ShieldX } from "lucide-react";

import { useFiscalCertificate } from "@/features/fiscal/hooks/useFiscal";
import { formatDate } from "@/lib/format";
import type { FiscalCertificate } from "@/types/fiscal";

const style: Record<FiscalCertificate["status"], { chip: string; icon: typeof ShieldCheck; ring: string }> = {
  OK: { chip: "bg-green-100 text-green-800", icon: ShieldCheck, ring: "border-green-200" },
  SOON: { chip: "bg-amber-100 text-amber-800", icon: CalendarClock, ring: "border-amber-300" },
  EXPIRED: { chip: "bg-red-100 text-red-800", icon: ShieldX, ring: "border-red-300" },
  NONE: { chip: "bg-slate-100 text-slate-600", icon: ShieldX, ring: "border-slate-200" },
};

const statusLabel: Record<FiscalCertificate["status"], string> = {
  OK: "Vigente",
  SOON: "Vence em breve",
  EXPIRED: "Vencido",
  NONE: "Não cadastrado",
};

export default function CertificateBanner() {
  const { data, isLoading } = useFiscalCertificate();
  if (isLoading) return null;
  if (!data?.configured) return null;
  const { chip, icon: Icon, ring } = style[data.status];
  const urgent = data.status === "EXPIRED" || data.status === "SOON";
  return (
    <div className={`mt-4 rounded-2xl border bg-white p-4 shadow-sm ${ring}`}>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <span className={`flex size-10 items-center justify-center rounded-xl ${chip}`}><Icon className="size-4" /></span>
          <div>
            <p className="flex items-center gap-2 text-xs font-black text-slate-900">Certificado digital <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${chip}`}>{statusLabel[data.status]}</span></p>
            <p className="mt-0.5 text-[11px] text-slate-500">{data.label ?? "Certificado"} · {data.expiresAt ? `vence em ${formatDate(data.expiresAt)}${data.daysLeft != null ? ` (${data.daysLeft} dia(s))` : ""}` : "sem validade registrada"} · {data.environment === "HOMOLOGATION" ? "homologação" : "produção"}</p>
            <p className="mt-1 text-[10px] text-slate-500">{data.guidance}</p>
          </div>
        </div>
        {urgent && <Link href="/configuracoes-fiscais" className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-xl bg-amber-500 px-3 text-[11px] font-bold text-white hover:bg-amber-600">Atualizar validade</Link>}
      </div>
    </div>
  );
}

export function CertificateLoadingFallback() {
  return <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-400"><LoaderCircle className="mr-2 inline size-4 animate-spin text-orange-600" />Consultando certificado...</div>;
}
