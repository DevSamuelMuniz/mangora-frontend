"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

type WorkspaceModalProps = {
  children: ReactNode;
  closeHref: string;
  label: string;
  size?: "medium" | "large" | "wide";
};

const sizes = {
  medium: "max-w-3xl",
  large: "max-w-5xl",
  wide: "max-w-7xl",
};

export default function WorkspaceModal({ children, closeHref, label, size = "large" }: WorkspaceModalProps) {
  const router = useRouter();

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") router.replace(closeHref, { scroll: false });
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [closeHref, router]);

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-[#123d2b]/45 p-0 backdrop-blur-sm sm:items-center sm:p-5">
      <button type="button" aria-label={`Fechar ${label}`} onClick={() => router.replace(closeHref, { scroll: false })} className="absolute inset-0 cursor-default" />
      <div role="dialog" aria-modal="true" aria-label={label} className={`relative max-h-[96vh] w-full overflow-y-auto rounded-t-[1.75rem] border border-[#123d2b]/20 bg-[#e9dfd2] p-4 shadow-[0_28px_90px_rgba(18,61,43,0.32)] sm:max-h-[92vh] sm:rounded-[1.75rem] sm:p-6 ${sizes[size]}`}>
        <div className="sticky top-0 z-20 -mx-1 mb-4 flex justify-end bg-gradient-to-b from-[#e9dfd2] via-[#e9dfd2] to-transparent px-1 pb-3">
          <button type="button" onClick={() => router.replace(closeHref, { scroll: false })} className="flex size-10 items-center justify-center rounded-xl border border-[#123d2b]/10 bg-white text-[#597064] shadow-sm transition hover:border-orange-200 hover:text-orange-700" aria-label={`Fechar ${label}`}>
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
