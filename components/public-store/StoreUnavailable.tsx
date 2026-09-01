import Link from "next/link";
import { ArrowLeft, Store } from "lucide-react";

import BrandLogo from "@/components/brand/BrandLogo";

/** Página pública exibida quando a loja está desativada ou sem canais de pedido. */
export default function StoreUnavailable() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#fff8ea] px-6 text-center font-[family-name:var(--font-manrope)] text-[#123d2b]">
      <Link href="/" aria-label="Mangora — página inicial"><BrandLogo className="h-10" /></Link>
      <div className="mt-8 flex size-16 items-center justify-center rounded-3xl border-2 border-[#123d2b] bg-white shadow-[5px_6px_0_#ffb21a]">
        <Store className="size-7 text-[#ff6b1a]" />
      </div>
      <h1 className="mt-6 font-[family-name:var(--font-bricolage)] text-3xl font-extrabold tracking-tight sm:text-4xl">Página indisponível</h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-[#597064]">
        Esta loja ainda não ativou o catálogo online ou está preparando os pedidos. Volte em instantes.
      </p>
      <Link href="/" className="mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-[#123d2b] px-6 text-sm font-extrabold text-white shadow-[0_5px_0_#0b281c] transition hover:bg-[#147a45]">
        <ArrowLeft className="size-4" /> Voltar para a Mangora
      </Link>
    </main>
  );
}
