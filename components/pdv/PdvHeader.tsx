"use client";

import { ArrowLeft, Check, ChevronDown, Maximize, Minimize, Moon, Sprout, Sun } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import BrandLogo from "@/components/brand/BrandLogo";
import { useCashRegister } from "@/features/cash-registers/hooks/useCashRegister";
import { useCompanySettings } from "@/features/settings/hooks/useSettings";
import type { AuthSession } from "@/lib/auth/types";

export type PdvTheme = "dark" | "verde" | "light";

const THEMES: { id: PdvTheme; label: string; icon: typeof Moon }[] = [
    { id: "dark", label: "Escuro", icon: Moon },
    { id: "verde", label: "Verde", icon: Sprout },
    { id: "light", label: "Claro", icon: Sun },
];

/**
 * Cabeçalho do terminal: marca + empresa atual, relógio, status do caixa,
 * seletor de tema (verde / claro / escuro) e tela cheia (kiosk).
 */
export default function PdvHeader({ session, theme, onThemeChange }: { session: AuthSession; theme: PdvTheme; onThemeChange: (theme: PdvTheme) => void }) {
    const { data: company } = useCompanySettings();
    const { data: registerOverview } = useCashRegister();
    const register = registerOverview?.register ?? null;
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [themeOpen, setThemeOpen] = useState(false);
    const themeRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
        document.addEventListener("fullscreenchange", onChange);
        return () => document.removeEventListener("fullscreenchange", onChange);
    }, []);

    useEffect(() => {
        function onClickOutside(event: MouseEvent) {
            if (themeRef.current && !themeRef.current.contains(event.target as Node)) setThemeOpen(false);
        }
        document.addEventListener("mousedown", onClickOutside);
        return () => document.removeEventListener("mousedown", onClickOutside);
    }, []);

    function toggleFullscreen() {
        if (document.fullscreenElement) {
            void document.exitFullscreen();
        } else {
            void document.documentElement.requestFullscreen().catch(() => undefined);
        }
    }

    const currentTheme = THEMES.find((item) => item.id === theme) ?? THEMES[0];
    const CurrentIcon = currentTheme.icon;

    const clock = new Date();
    const dateLabel = clock.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
    const timeLabel = clock.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    return (
        <header className="flex items-center justify-between gap-4 border-b border-pdv-line bg-pdv-panel px-5 py-3">
            <div className="flex min-w-0 items-center gap-4">
                <Link href="/" aria-label="Mangora — página inicial" className="shrink-0">
                    <BrandLogo className="h-8" />
                </Link>
                <div className="min-w-0">
                    <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-orange-400">
                        {company?.tradeName ?? session.company.tradeName}
                        {company?.city && company.state && (
                            <span className="text-pdv-fg/70">· {company.city} - {company.state}</span>
                        )}
                    </p>
                    <h1 className="truncate font-[family-name:var(--font-bricolage)] text-lg font-black tracking-tight text-pdv-fg">
                        Terminal de vendas
                    </h1>
                </div>
            </div>

            <div className="flex items-center gap-2.5">
                <div className="hidden rounded-xl bg-pdv-line px-4 py-2 text-right md:block">
                    <p className="font-mono text-[10px] text-pdv-fg/80">{dateLabel}</p>
                    <p className="font-[family-name:var(--font-bricolage)] text-lg font-black leading-none text-pdv-fg">{timeLabel}</p>
                </div>
                <div className={`hidden rounded-xl px-4 py-2 text-right sm:block ${register?.status === "OPEN" ? "bg-pdv-ok/15 text-pdv-ok" : "bg-pdv-warn/15 text-pdv-warn"}`}>
                    <p className="font-mono text-[10px] text-pdv-fg/80">Caixa</p>
                    <p className="text-sm font-black">{register?.status === "OPEN" ? `Aberto · ${register.openedByName}` : "Fechado"}</p>
                </div>

                <div className="relative" ref={themeRef}>
                    <button
                        type="button"
                        onClick={() => setThemeOpen((open) => !open)}
                        aria-label="Mudar tema"
                        aria-haspopup="menu"
                        aria-expanded={themeOpen}
                        className="flex h-11 items-center gap-2 rounded-xl border border-pdv-line bg-pdv-line px-3 text-xs font-bold text-pdv-fg transition hover:border-pdv-gold/50"
                    >
                        <CurrentIcon className="size-4 text-pdv-gold" />
                        <span className="hidden lg:inline">{currentTheme.label}</span>
                        <ChevronDown className={`size-3.5 text-pdv-fg/60 transition-transform ${themeOpen ? "rotate-180" : ""}`} />
                    </button>
                    {themeOpen && (
                        <div role="menu" aria-label="Tema do terminal" className="absolute right-0 top-12 z-50 w-44 overflow-hidden rounded-xl border border-pdv-line bg-pdv-panel shadow-2xl shadow-black/40">
                            {THEMES.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        role="menuitemradio"
                                        aria-checked={theme === item.id}
                                        onClick={() => {
                                            onThemeChange(item.id);
                                            setThemeOpen(false);
                                        }}
                                        className={`flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-xs font-bold transition hover:bg-pdv-line ${theme === item.id ? "text-pdv-gold" : "text-pdv-fg"}`}
                                    >
                                        <Icon className="size-4" /> {item.label}
                                        {theme === item.id && <Check className="ml-auto size-3.5" />}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                <Link
                    href="/dashboard"
                    className="flex h-11 items-center gap-2 rounded-xl border border-pdv-line bg-pdv-line px-3 text-xs font-bold text-pdv-fg transition hover:border-orange-400/50 hover:text-pdv-fg"
                >
                    <ArrowLeft className="size-4" /> Voltar ao sistema
                </Link>
                <button
                    type="button"
                    onClick={toggleFullscreen}
                    aria-label={isFullscreen ? "Sair da tela cheia" : "Entrar em tela cheia"}
                    className="flex size-11 items-center justify-center rounded-xl border border-pdv-line bg-pdv-line text-pdv-fg transition hover:border-pdv-gold/50 hover:text-pdv-fg"
                >
                    {isFullscreen ? <Minimize className="size-4" /> : <Maximize className="size-4" />}
                </button>
            </div>
        </header>
    );
}
