"use client";

import { useEffect, useState } from "react";

import { queuePendingCount } from "@/lib/offline/sync";
import { subscribeOffline } from "@/lib/offline/engine";
import { flushPending } from "@/lib/offline/sync";

/** Estado de conectividade + quantidade de alterações aguardando sync. */
export function useConnectivity() {
  const [online, setOnline] = useState(() => (typeof navigator === "undefined" ? true : navigator.onLine));
  const [pending, setPending] = useState(0);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    let alive = true;
    const refresh = () => {
      void queuePendingCount().then((count) => { if (alive) setPending(count); });
    };
    const onOnline = () => {
      setOnline(true);
      setSyncing(true);
      void flushPending().finally(() => { if (alive) { setSyncing(false); refresh(); } });
    };
    const onOffline = () => { setOnline(false); refresh(); };

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    const unsubscribe = subscribeOffline(() => refresh());
    refresh();
    const interval = window.setInterval(() => { if (!navigator.onLine) refresh(); }, 6000);

    return () => {
      alive = false;
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      unsubscribe();
      window.clearInterval(interval);
    };
  }, []);

  async function syncNow() {
    if (!navigator.onLine) return;
    setSyncing(true);
    try {
      await flushPending();
    } finally {
      setSyncing(false);
    }
  }

  return { online, pending, syncing, syncNow };
}
