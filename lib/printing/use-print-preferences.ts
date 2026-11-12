"use client";
import { useCallback, useMemo, useSyncExternalStore } from "react";
import { DEFAULT_PRINT_PREFERENCES, readPrintPreferences, type PrintPreferences } from "./preferences";
import { usePrintScope } from "./scope";

const subscribe = (callback: () => void) => {
  window.addEventListener("storage", callback);
  window.addEventListener("mangora-print-preferences", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("mangora-print-preferences", callback);
  };
};
const serverSnapshot = () => JSON.stringify(DEFAULT_PRINT_PREFERENCES);
export function usePrintPreferences() {
  const scope = usePrintScope();
  const snapshot = useCallback(() => JSON.stringify(readPrintPreferences(scope)), [scope]);
  const value = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  return useMemo(() => JSON.parse(value) as PrintPreferences, [value]);
}
