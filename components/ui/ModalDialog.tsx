"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { useT } from "@/i18n/provider";

/** Native top-layer dialog owns focus trapping, inert background and Escape. */
export default function ModalDialog({ title, children, onClose, busy = false }: { title: string; children: ReactNode; onClose: () => void; busy?: boolean }) {
  const t = useT();
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    const dialog = ref.current;
    document.body.style.overflow = "hidden";
    dialog?.showModal();
    return () => { dialog?.close(); document.body.style.overflow = overflow; previous?.focus(); };
  }, []);
  return <dialog ref={ref} aria-labelledby={titleId} aria-busy={busy} onKeyDown={event => {
    if (event.key !== "Tab") return;
    const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]')).filter(element => element.tabIndex >= 0 && element.getClientRects().length > 0);
    const first = controls[0];
    const last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }} onCancel={event => { event.preventDefault(); if (!busy) onClose(); }} className="fixed m-auto max-h-[92dvh] w-[calc(100%_-_2rem)] max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-0 text-slate-950 shadow-2xl backdrop:bg-slate-950/60 backdrop:backdrop-blur-sm">
    <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white p-5">
      <h2 id={titleId} className="text-lg font-black">{title}</h2>
      <button type="button" autoFocus disabled={busy} onClick={onClose} aria-label={t("common.actions.close")} className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-xl hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-orange-600 disabled:cursor-wait disabled:opacity-50"><X className="size-5" /></button>
    </header>
    <div className="space-y-4 p-5">{children}</div>
  </dialog>;
}
