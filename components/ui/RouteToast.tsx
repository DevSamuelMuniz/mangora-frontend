"use client";

import { useEffect } from "react";
import { CheckCircle2, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function RouteToast() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get("toast");

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => {
      const next = new URLSearchParams(searchParams.toString());
      next.delete("toast");
      router.replace(next.size ? `${pathname}?${next}` : pathname, { scroll: false });
    }, 4200);
    return () => window.clearTimeout(timer);
  }, [message, pathname, router, searchParams]);

  function dismiss() {
    const next = new URLSearchParams(searchParams.toString());
    next.delete("toast");
    router.replace(next.size ? `${pathname}?${next}` : pathname, { scroll: false });
  }

  if (!message) return null;
  return (
    <div role="status" aria-live="polite" className="fixed bottom-5 right-5 z-[100] flex max-w-sm items-center gap-3 rounded-2xl border border-green-200 bg-white px-4 py-3 text-sm font-bold text-[#123d2b] shadow-[0_18px_55px_rgba(18,61,43,0.22)]">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-green-50 text-[#147a45]"><CheckCircle2 className="size-4" /></span>
      <span className="flex-1">{message}</span>
      <button type="button" onClick={dismiss} aria-label="Fechar aviso" className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"><X className="size-3.5" /></button>
    </div>
  );
}
