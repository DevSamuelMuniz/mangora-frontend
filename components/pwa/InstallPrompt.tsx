"use client";

import { useEffect, useRef, useState } from "react";
import { Download, X } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/** Registra o service worker e mostra o convite de instalação PWA (após o login). */
export default function InstallPrompt() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [installing, setInstalling] = useState(false);
  const dismissedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Já rodando como app instalado — não mostra o convite.
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if (sessionStorage.getItem("mangora-pwa-dismissed")) return;

    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }

    function onBeforeInstall(event: Event) {
      event.preventDefault();
      const pwaEvent = event as BeforeInstallPromptEvent;
      setPromptEvent(pwaEvent);
      setVisible(!dismissedRef.current);
    }
    function onInstalled() {
      setPromptEvent(null);
      setVisible(false);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function install() {
    if (!promptEvent) return;
    setInstalling(true);
    try {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice.outcome === "accepted") {
        setVisible(false);
      } else {
        dismiss();
      }
    } catch {
      dismiss();
    } finally {
      setInstalling(false);
    }
  }

  function dismiss() {
    dismissedRef.current = true;
    try {
      sessionStorage.setItem("mangora-pwa-dismissed", "1");
    } catch {
      // armazenamento indisponível
    }
    setVisible(false);
  }

  if (!visible || !promptEvent) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[90] w-[22rem] max-w-[calc(100vw-2rem)]">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/icon-192.png" alt="Mangora" className="size-11 rounded-xl" />
            <div>
              <p className="text-sm font-black text-slate-950">Instale o Mangora</p>
              <p className="text-[10px] text-slate-500">Acesse mais rápido, direto do seu aparelho.</p>
            </div>
          </div>
          <button type="button" onClick={dismiss} aria-label="Agora não" className="flex size-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"><X className="size-4" /></button>
        </div>
        <div className="mt-3 flex gap-2">
          <button type="button" onClick={dismiss} className="h-10 flex-1 rounded-xl border border-slate-200 text-xs font-bold text-slate-500 transition hover:bg-slate-50">Agora não</button>
          <button type="button" onClick={() => void install()} disabled={installing} className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#123d2b] text-xs font-black text-white transition hover:bg-[#147a45] disabled:opacity-60">
            <Download className="size-3.5" />{installing ? "Instalando..." : "Instalar"}
          </button>
        </div>
      </div>
    </div>
  );
}
