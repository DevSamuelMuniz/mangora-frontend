"use client";

import { useEffect, useState } from "react";
import { Globe2 } from "lucide-react";
import { marketCountries, preferredCountry, savePreferredCountry } from "@/lib/international";

export default function MarketSelector({ compact = false }: { compact?: boolean }) {
  const [country, setCountry] = useState("BR");
  useEffect(() => setCountry(preferredCountry()), []);
  const selected = marketCountries.find((item) => item.country === country) ?? marketCountries[0];
  return (
    <label className="relative inline-flex h-11 items-center gap-2 rounded-xl border border-[#123d2b]/15 bg-white px-3 text-[#315847]">
      <Globe2 className="size-4 shrink-0" />
      <span className="sr-only">País ou região de preços</span>
      <select
        value={country}
        onChange={(event) => { savePreferredCountry(event.target.value); setCountry(event.target.value); window.location.reload(); }}
        className="max-w-32 appearance-none bg-transparent pr-3 text-xs font-extrabold outline-none"
        aria-label="País ou região de preços"
      >
        {marketCountries.map((item) => <option key={item.country} value={item.country}>{compact ? `${item.country} · ${item.currency}` : `${item.label} — ${item.currency}`}</option>)}
      </select>
      {!compact && <span className="hidden text-[9px] font-bold text-[#789083] xl:inline">{selected.currency}</span>}
    </label>
  );
}
