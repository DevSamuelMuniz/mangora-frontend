"use client";

import { useSyncExternalStore } from "react";
import { preferredCountry, savePreferredCountry } from "@/lib/international";

const changeEvent = "mangora-country-change";
function subscribe(listener: () => void) {
  window.addEventListener(changeEvent, listener);
  window.addEventListener("focus", listener);
  return () => {
    window.removeEventListener(changeEvent, listener);
    window.removeEventListener("focus", listener);
  };
}
const serverCountry = () => "BR";

export function usePreferredCountry() {
  const country = useSyncExternalStore(subscribe, preferredCountry, serverCountry);
  return [country, savePreferredCountry] as const;
}
