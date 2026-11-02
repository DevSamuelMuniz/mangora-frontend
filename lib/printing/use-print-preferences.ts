"use client";
import { useMemo, useSyncExternalStore } from "react";
import { DEFAULT_PRINT_PREFERENCES, readPrintPreferences, type PrintPreferences } from "./preferences";

const subscribe = (callback: () => void) => {
  window.addEventListener("storage", callback);
  window.addEventListener("mangora-print-preferences", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("mangora-print-preferences", callback);
  };
};
const snapshot = () => JSON.stringify(readPrintPreferences());
const serverSnapshot = () => JSON.stringify(DEFAULT_PRINT_PREFERENCES);
export function usePrintPreferences() {
  const value = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  return useMemo(() => JSON.parse(value) as PrintPreferences, [value]);
}
