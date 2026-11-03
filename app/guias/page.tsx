import Link from "next/link";
import GuideShell from "@/components/public/GuideShell";
import { guides } from "@/lib/guides";
import { guideMetadata } from "@/lib/seo";
export const metadata = guideMetadata("/guias", "Guias de gestão para lojas: vendas, estoque e impressão", "Respostas práticas para organizar vendas, estoque, fluxo de caixa e etiquetas. Guias gratuitos da Mangora para o dia a dia do varejo.");
export default function GuidesPage() {
  return <GuideShell><main id="conteudo" className="mx-auto max-w-6xl px-5 py-12 sm:py-20">
    <p className="text-sm font-bold uppercase tracking-widest text-[#9c3d09]">Caderno de gestão da loja</p>
    <h1 className="mt-5 max-w-4xl font-[family-name:var(--font-bricolage)] text-4xl font-extrabold tracking-tight sm:text-6xl">Do balcão ao estoque, uma dúvida de cada vez.</h1>
    <p className="mt-6 max-w-2xl text-lg leading-8 text-[#315847]">Guias para quem cuida da loja todos os dias. Encontre passos, exemplos e respostas para organizar a operação e usar melhor seus registros.</p>
    <div className="mt-12 divide-y divide-[#123d2b]/20 border-y border-[#123d2b]/20">{guides.map(guide => <article key={guide.slug} className="grid gap-4 py-8 sm:grid-cols-[140px_1fr]">
      <p className="text-sm font-bold text-[#9c3d09]">{guide.category}</p><div><h2 className="text-2xl font-bold"><Link className="underline-offset-4 hover:underline" href={`/guias/${guide.slug}`}>{guide.title}</Link></h2><p className="mt-3 max-w-3xl leading-7 text-[#315847]">{guide.description}</p><Link href={`/guias/${guide.slug}`} className="mt-4 inline-block py-2 font-bold underline underline-offset-4" aria-label={`Ler guia: ${guide.title}`}>Ler guia →</Link></div>
    </article>)}</div>
    <aside className="mt-12 rounded-2xl bg-[#dff4e7] p-7"><h2 className="text-2xl font-bold">Quer conhecer o sistema?</h2><p className="mt-3 max-w-2xl leading-7">A Mangora reúne vendas, estoque, clientes e financeiro. Conheça a plataforma e veja como ela se encaixa na rotina da sua loja.</p><Link href="/" className="mt-4 inline-block py-2 font-bold underline underline-offset-4">Ver como a Mangora funciona →</Link></aside>
  </main></GuideShell>;
}
