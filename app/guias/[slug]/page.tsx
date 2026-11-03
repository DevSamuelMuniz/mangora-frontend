import Link from "next/link";
import { notFound } from "next/navigation";
import GuideShell from "@/components/public/GuideShell";
import { findGuide, guides } from "@/lib/guides";
import { absoluteUrl, guideMetadata } from "@/lib/seo";
export function generateStaticParams() { return guides.map(guide => ({ slug: guide.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const guide = findGuide((await params).slug);
  return guide ? guideMetadata(`/guias/${guide.slug}`, guide.title, guide.description) : { title: "Guia não encontrado", robots: { index: false } };
}
export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const guide = findGuide((await params).slug);
  if (!guide) notFound();
  const url = absoluteUrl(`/guias/${guide.slug}`);
  const schema = { "@context": "https://schema.org", "@graph": [
    { "@type": "Article", "@id": `${url}#article`, headline: guide.title, description: guide.description, inLanguage: "pt-BR", mainEntityOfPage: url, author: { "@type": "Organization", name: "Mangora", url: absoluteUrl("/") }, publisher: { "@id": `${absoluteUrl("/")}#organization` } },
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Início", item: absoluteUrl("/") }, { "@type": "ListItem", position: 2, name: "Guias", item: absoluteUrl("/guias") }, { "@type": "ListItem", position: 3, name: guide.title, item: url }] },
    { "@type": "FAQPage", "@id": `${url}#perguntas`, mainEntity: guide.faq.map(item => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) },
  ] };
  return <GuideShell><main id="conteudo" className="mx-auto max-w-6xl px-5 py-10 sm:py-16">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    <nav aria-label="Caminho da página" className="flex flex-wrap gap-2 text-sm"><Link href="/">Início</Link><span aria-hidden="true">/</span><Link href="/guias">Guias</Link><span aria-hidden="true">/</span><span aria-current="page">{guide.category}</span></nav>
    <header className="mt-9 max-w-4xl"><p className="text-sm font-bold uppercase tracking-widest text-[#9c3d09]">{guide.category} · Guia prático</p><h1 className="mt-4 font-[family-name:var(--font-bricolage)] text-4xl font-extrabold tracking-tight sm:text-5xl">{guide.title}</h1><p className="mt-6 text-lg leading-8 text-[#315847]">{guide.description}</p><p className="mt-4 text-sm text-[#315847]">Por Mangora · Conteúdo em português do Brasil</p></header>
    <div className="mt-12 grid items-start gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
      <nav aria-label="Neste guia" className="border-l-4 border-[#ff6b1a] pl-5"><h2 className="font-bold">Neste guia</h2><ul className="mt-4 space-y-3 text-sm leading-6">{guide.sections.map((section, i) => <li key={section.title}><a className="underline-offset-4 hover:underline" href={`#secao-${i}`}>{section.title}</a></li>)}<li><a href="#perguntas" className="underline-offset-4 hover:underline">Perguntas frequentes</a></li></ul></nav>
      <article className="min-w-0 max-w-3xl">{guide.sections.map((section, i) => <section id={`secao-${i}`} key={section.title} className="mb-10 scroll-mt-6"><h2 className="text-2xl font-bold tracking-tight">{section.title}</h2>{section.paragraphs.map(text => <p key={text} className="mt-4 leading-8 text-[#315847]">{text}</p>)}{section.steps && <ol className="mt-5 list-decimal space-y-4 pl-6 leading-8 text-[#315847]">{section.steps.map(step => <li key={step} className="pl-2">{step}</li>)}</ol>}</section>)}
        <section id="perguntas" className="scroll-mt-6"><h2 className="text-2xl font-bold">Perguntas frequentes</h2><div className="mt-5 divide-y divide-[#123d2b]/20">{guide.faq.map(item => <div key={item.question} className="py-5"><h3 className="text-lg font-bold">{item.question}</h3><p className="mt-3 leading-8 text-[#315847]">{item.answer}</p></div>)}</div></section>
        {guide.source && <section className="mt-8 border-t border-[#123d2b]/20 pt-6"><h2 className="font-bold">Para aprofundar</h2><a href={guide.source.url} className="mt-3 inline-block break-words py-2 underline underline-offset-4">{guide.source.title} ↗</a></section>}
        <aside className="mt-10 rounded-2xl bg-[#dff4e7] p-6"><h2 className="text-xl font-bold">Leve a organização para o dia a dia</h2><p className="mt-3 leading-7">Conheça as rotinas de gestão da Mangora ou converse com a equipe para tirar dúvidas sobre o sistema.</p><div className="mt-4 flex flex-wrap gap-5 font-bold"><Link href="/cadastro" className="py-2 underline underline-offset-4">Conhecer a Mangora</Link><Link href="/suporte" className="py-2 underline underline-offset-4">Falar com a equipe</Link></div></aside>
      </article>
    </div>
    <section className="mt-14 border-t border-[#123d2b]/20 pt-8"><h2 className="text-2xl font-bold">Continue a leitura</h2><ul className="mt-5 grid gap-5 sm:grid-cols-3">{guides.filter(item => item.slug !== guide.slug).map(item => <li key={item.slug}><Link href={`/guias/${item.slug}`} className="block py-3 font-bold leading-7 underline underline-offset-4">{item.title} →</Link></li>)}</ul></section>
  </main></GuideShell>;
}
