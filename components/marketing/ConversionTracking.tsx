"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

export default function ConversionTracking() {
  useEffect(() => {
    function clicked(event: MouseEvent) {
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest<HTMLAnchorElement>('a[href="/cadastro"]');
      if (link) track("signup_cta_clicked", { placement: link.closest("section")?.id || (link.closest("header") ? "header" : "landing"), page: "/" });
    }
    document.addEventListener("click", clicked);
    return () => document.removeEventListener("click", clicked);
  }, []);
  return null;
}
