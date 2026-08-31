"use client";

import { ScanLine, X } from "lucide-react";
import { forwardRef } from "react";

type ScanBarProps = {
    value: string;
    onChange: (value: string) => void;
    onEnter: () => void;
    onClear: () => void;
};

/** Campo de leitura de código de barras / busca — sempre em destaque no topo. */
const ScanBar = forwardRef<HTMLInputElement, ScanBarProps>(function ScanBar({ value, onChange, onEnter, onClear }, ref) {
    return (
        <div className="relative">
            <ScanLine className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-orange-400" />
            <input
                ref={ref}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                onKeyDown={(event) => {
                    if (event.key === "Enter") {
                        event.preventDefault();
                        onEnter();
                    }
                }}
                placeholder="Leia o código de barras ou busque por nome / SKU — Enter confirma"
                className="h-16 w-full rounded-2xl border-2 border-white/10 bg-[#0a2418] pl-14 pr-14 font-mono text-lg font-semibold tracking-wide text-white outline-none placeholder:font-sans placeholder:text-sm placeholder:font-medium placeholder:tracking-normal placeholder:text-white/70 focus:border-[#ffb21a]"
            />
            {value && (
                <button type="button" onClick={onClear} aria-label="Limpar busca" className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-white/80 transition hover:bg-white/5 hover:text-white">
                    <X className="size-4" />
                </button>
            )}
        </div>
    );
});

export default ScanBar;
