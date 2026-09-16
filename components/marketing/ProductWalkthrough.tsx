"use client";

import { useState } from "react";
import { useT } from "@/i18n/provider";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { track } from "@/lib/analytics";

function buildExamples(t: (key: string) => string) { return [
  { name: t("publicUi.walkthrough.rotinas.sales"), question: t("publicUi.walkthrough.rotinas.salesQuestion"), description: t("publicUi.walkthrough.rotinas.salesDescription"), columns: ["Venda", "Pagamento", "Valor"], rows: [["Pedido #1024", "Pix", "R$ 189,90"], ["Pedido #1025", t("publicUi.walkthrough.status.card"), "R$ 75,00"], ["Pedido #1026", t("publicUi.walkthrough.status.cash"), "R$ 42,00"]], benefit: t("publicUi.walkthrough.rotinas.salesHint") },
  { name: t("publicUi.walkthrough.rotinas.stock"), question: t("publicUi.walkthrough.rotinas.stockQuestion"), description: t("publicUi.walkthrough.rotinas.stockDescription"), columns: ["Produto", "Saldo", "Situação"], rows: [["Camiseta básica", "3 unidades", "Estoque baixo"], ["Calça jeans", "18 unidades", "Disponível"], ["Boné", "12 unidades", "Disponível"]], benefit: t("publicUi.walkthrough.rotinas.stockHint") },
  { name: t("publicUi.walkthrough.rotinas.finance"), question: t("publicUi.walkthrough.rotinas.financeQuestion"), description: t("publicUi.walkthrough.rotinas.financeDescription"), columns: ["Lançamento", "Situação", "Valor"], rows: [["Venda #1024", "Recebido", "R$ 189,90"], ["Venda #1027", "Pendente", "R$ 320,00"], ["Venda #1028", "Pendente", "R$ 150,00"]], benefit: t("publicUi.walkthrough.rotinas.financeHint") },
]; }


export default function ProductWalkthrough() {
  const t = useT();
  const [selected, setSelected] = useState(0);
  const example = buildExamples(t)[selected];
  return <section id="por-dentro" className="bg-[#fff8ea] px-5 py-16 text-[#123d2b] sm:px-8 sm:py-24 lg:px-10">
    <div className="mx-auto max-w-[1200px]">
      <p className="text-xs font-black uppercase tracking-widest text-[#147a45]">{t("publicUi.walkthrough.title")}</p>
      <h2 className="mt-4 max-w-3xl font-[family-name:var(--font-bricolage)] text-4xl font-extrabold tracking-tight sm:text-5xl">As respostas que seu negócio precisa, sem procurar em várias planilhas.</h2>
      <p className="mt-5 text-[#315847]">{t("publicUi.walkthrough.subtitle")}</p>
      <div className="mt-8 flex flex-wrap gap-3" aria-label={t("publicUi.walkthrough.rotations")}>
        {buildExamples(t).map((item, index) => <button key={item.name} type="button" aria-pressed={selected === index} aria-controls="product-example" onClick={() => { setSelected(index); track("product_demo_viewed", { module: item.name }); }} className={`min-h-12 rounded-xl border-2 border-[#123d2b] px-6 font-bold focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#ff6b1a] ${selected === index ? "bg-[#123d2b] text-white" : "bg-white text-[#123d2b] hover:bg-[#ffb21a]/20"}`}>{item.name}</button>)}
      </div>
      <div id="product-example" className="mt-6 grid overflow-hidden rounded-3xl border-2 border-[#123d2b] bg-white lg:grid-cols-[0.8fr_1.2fr]">
        <div className="bg-[#123d2b] p-6 text-white sm:p-9" aria-live="polite">
          <h3 className="font-[family-name:var(--font-bricolage)] text-3xl font-bold">{example.question}</h3>
          <p className="mt-4 leading-7 text-white/90">{example.description}</p>
          <p className="mt-8 flex gap-3 text-sm leading-6 text-[#ffd56a]"><Check className="mt-1 size-5 shrink-0" />{example.benefit}</p>
          <Link href="/cadastro" className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#ffb21a] px-5 font-bold text-[#123d2b] focus-visible:outline-4 focus-visible:outline-white">{t("publicUi.walkthrough.withMyData")} <ArrowRight className="size-4" /></Link>
        </div>
        <div className="min-w-0 p-5 sm:p-9">
          <p className="mb-6 text-xs font-semibold text-[#597064]">{t("publicUi.walkthrough.disclaimer")}</p>
          <div className="overflow-x-auto"><table className="w-full text-left text-sm"><caption className="sr-only">Exemplo de {example.name}</caption><thead><tr>{example.columns.map(column => <th key={column} scope="col" className="border-b border-[#123d2b]/20 pb-4 pr-4">{column}</th>)}</tr></thead><tbody>{example.rows.map(row => <tr key={row[0]}>{row.map((cell, index) => <td key={index} className="border-b border-[#123d2b]/10 py-5 pr-4 text-[#315847]">{cell}</td>)}</tr>)}</tbody></table></div>
          <p className="mt-6 text-xs leading-5 text-[#597064]">A apresentação foi simplificada para esta demonstração. A disponibilidade dos recursos varia por plano.</p>
        </div>
      </div>
    </div>
  </section>;
}
