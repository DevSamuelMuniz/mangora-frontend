"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { CheckCircle2, Info, XCircle } from "lucide-react";

type ToastTone = "success" | "error" | "info";

type Toast = {
    id: number;
    tone: ToastTone;
    message: string;
};

type ToastApi = {
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
    const api = useContext(ToastContext);
    if (!api) throw new Error("useToast deve ser usado dentro de <ToastProvider>.");
    return api;
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const nextId = useRef(1);

    const dismiss = useCallback((id: number) => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
    }, []);

    const push = useCallback(
        (tone: ToastTone, message: string) => {
            const id = nextId.current++;
            setToasts((current) => [...current.slice(-3), { id, tone, message }]);
            setTimeout(() => dismiss(id), 4500);
        },
        [dismiss],
    );

    const api: ToastApi = {
        success: (message) => push("success", message),
        error: (message) => push("error", message),
        info: (message) => push("info", message),
    };

    return (
        <ToastContext.Provider value={api}>
            {children}
            <div aria-live="polite" className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        role={toast.tone === "error" ? "alert" : "status"}
                        className={`pointer-events-auto flex items-start gap-2.5 rounded-xl border px-4 py-3 text-xs font-semibold shadow-2xl backdrop-blur ${
                            toast.tone === "success"
                                ? "border-green-200 bg-green-50/95 text-green-800"
                                : toast.tone === "error"
                                  ? "border-red-200 bg-red-50/95 text-red-800"
                                  : "border-slate-200 bg-white/95 text-slate-700"
                        }`}
                    >
                        {toast.tone === "success" ? (
                            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                        ) : toast.tone === "error" ? (
                            <XCircle className="mt-0.5 size-4 shrink-0" />
                        ) : (
                            <Info className="mt-0.5 size-4 shrink-0" />
                        )}
                        <span className="leading-5">{toast.message}</span>
                        <button
                            type="button"
                            aria-label="Fechar"
                            onClick={() => dismiss(toast.id)}
                            className="ml-auto -mr-1 rounded-md p-1 text-current opacity-50 hover:opacity-100"
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}
