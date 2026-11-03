import Link from "next/link";
import BrandLogo from "@/components/brand/BrandLogo";

export default function GuideShell({ children }: { children: React.ReactNode }) {
  return <div className="mangora-public min-h-screen bg-[#fff8ea] text-[#123d2b] [&_a]:focus-visible:outline-2 [&_a]:focus-visible:outline-offset-4 [&_a]:focus-visible:outline-[#147a45]">
    <a href="#conteudo" className="sr-only focus:not-sr-only focus:block focus:p-4">Pular para o conteúdo</a>
    <header className="border-b border-[#123d2b]/15"><nav aria-label="Navegação principal" className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5">
      <Link href="/" aria-label="Mangora — início"><BrandLogo className="h-9" /></Link>
      <div className="flex flex-wrap items-center gap-5 text-sm font-bold"><Link href="/guias" className="underline-offset-4 hover:underline">Guias para sua loja</Link><Link href="/suporte" className="underline-offset-4 hover:underline">Suporte</Link><Link href="/cadastro" className="rounded-xl bg-[#123d2b] px-4 py-3 text-white hover:bg-[#24543e]">Conhecer a Mangora</Link></div>
    </nav></header>
    {children}
    <footer className="mt-16 border-t border-[#123d2b]/15"><div className="mx-auto flex max-w-6xl flex-wrap gap-6 px-5 py-8 text-sm"><Link href="/sobre">Sobre a Mangora</Link><Link href="/guias">Todos os guias</Link><Link href="/privacidade">Privacidade</Link><Link href="/suporte">Fale com a equipe</Link></div></footer>
  </div>;
}
