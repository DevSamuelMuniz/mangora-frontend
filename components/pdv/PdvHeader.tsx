"use client";

import { ArrowLeft, Maximize, Minimize } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import BrandLogo from "@/components/brand/BrandLogo";
import { useCashRegister } from "@/features/cash-registers/hooks/useCashRegister";
import { useCompanySettings } from "@/features/settings/hooks/useSettings";
import type { AuthSession } from "@/lib/auth/types";

/**
 * Cabeçalho do terminal: marca + empresa atual, relógio, status do caixa
 * e alternância de tela cheia (kiosk).
 */
export default function PdvHeader({ session }: { session: AuthSession }) {
    const { data: company } = useCompanySettings();
    const { data: registerOverview } = useCashRegister();
    const register = registerOverview?.register ?? null;
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
        document.addEventListener("fullscreenchange", onChange);
        return () => document.removeEventListener("fullscreenchange", onChange);
    }, []);

    function toggleFullscreen() {
        if (document.fullscreenElement) {
            void document.exitFullscreen();
        } else {
            void document.documentElement.requestFullscreen().catch(() => undefined);
        }
    }

    const clock = new Date();
    const dateLabel = clock.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
    const timeLabel = clock.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    return (
        <header className="flex items-center justify-between gap-4 border-b border-white/10 bg-[#0a2418] px-5 py-3">
            <div className="flex min-w-0 items-center gap-4">
                <Link href="/" aria-label="Mangora — página inicial" className="shrink-0">
                    <BrandLogo className="h-8" />
                </Link>
                <div className="min-w-0">
                    <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-orange-400">
                        {company?.tradeName ?? session.company.tradeName}
                        {company?.city && company.state && (
                            <span className="text-white/70">· {company.city} - {company.state}</span>
                        )}
                    </p>
                    <h1 className="truncate font-[family-name:var(--font-bricolage)] text-lg font-black tracking-tight text-white">
                        Terminal de vendas
                    </h1>
                </div>
            </div>

            <div className="flex items-center gap-2.5">
                <div className="hidden rounded-xl bg-white/5 px-4 py-2 text-right md:block">
                    <p className="font-mono text-[10px] text-white/80">{dateLabel}</p>
                    <p className="font-[family-name:var(--font-bricolage)] text-lg font-black leading-none text-white">{timeLabel}</p>
                </div>
                <div className={`hidden rounded-xl px-4 py-2 text-right sm:block ${register?.status === "OPEN" ? "bg-green-500/15 text-green-300" : "bg-amber-500/15 text-amber-300"}`}>
                    <p className="font-mono text-[10px] text-white/80">Caixa</p>
                    <p className="text-sm font-black">{register?.status === "OPEN" ? `Aberto · ${register.openedByName}` : "Fechado"}</p>
                </div>
                <Link
                    href="/dashboard"
                    className="flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-bold text-white transition hover:border-orange-400/50 hover:text-white"
                >
                    <ArrowLeft className="size-4" /> Voltar ao sistema
                </Link>
                <button
                    type="button"
                    onClick={toggleFullscreen}
                    aria-label={isFullscreen ? "Sair da tela cheia" : "Entrar em tela cheia"}
                    className="flex size-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:border-[#ffb21a]/50 hover:text-white"
                >
                    {isFullscreen ? <Minimize className="size-4" /> : <Maximize className="size-4" />}
                </button>
            </div>
        </header>
    );
}
