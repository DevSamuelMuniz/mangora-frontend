"use client";

import { CloudOff, RefreshCw, Wifi } from "lucide-react";

import { useConnectivity } from "@/lib/offline/useConnectivity";

/** Aviso de status offline + sincronização pendente (aparece no sistema). */
export default function OfflineBanner() {
  const { online, pending, syncing, syncNow } = useConnectivity();
  const show = !online || pending > 0;
  if (!show) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-[80]">
      <div className={`flex flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 py-2 text-center text-xs font-bold text-white ${!online ? "bg-amber-600" : "bg-emerald-600"}`}>
        {!online ? (
          <>
            <span className="flex items-center gap-1.5"><CloudOff className="size-4" />Você está offline</span>
            <span className="font-normal opacity-90">Você pode continuar vendo os dados salvos; as alterações ficam na fila e sincronizam sozinhas.</span>
          </>
        ) : (
          <>
            <span className="flex items-center gap-1.5"><Wifi className="size-4" />Conexão restabelecida</span>
            {pending > 0 ? <span className="font-normal opacity-90">{pending} alteração(ões) aguardando sincronização.</span> : <span className="font-normal opacity-90">Tudo sincronizado.</span>}
          </>
        )}
        {pending > 0 && !syncing && (
          <button type="button" onClick={() => void syncNow()} className="flex items-center gap-1.5 rounded-lg bg-white/20 px-3 py-1 text-[11px] font-black transition hover:bg-white/30">
            <RefreshCw className="size-3.5" />Sincronizar agora
          </button>
        )}
        {syncing && <span className="flex items-center gap-1.5 font-normal opacity-90"><RefreshCw className="size-3.5 animate-spin" />Sincronizando...</span>}
      </div>
    </div>
  );
}
