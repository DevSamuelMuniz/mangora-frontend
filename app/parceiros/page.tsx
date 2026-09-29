import type { Metadata } from "next";
import PublicInfoPage from "@/components/public/PublicInfoPage";
<<<<<<< HEAD
export const metadata: Metadata = { title: "Parceiros | Mangora" };
export default function PartnersPage() { return <PublicInfoPage eyebrow="Ecossistema" title="Cresça junto com o Mangora" description="Criamos parcerias com profissionais e empresas que ajudam negócios a vender, organizar e crescer." sections={[{ title: "Quem pode participar", paragraphs: ["Contadores, consultores, integradores, agências e fornecedores de tecnologia podem fazer parte do ecossistema."], items: ["Indicação de novos clientes.", "Implantação e treinamento.", "Integrações e soluções complementares."] }, { title: "Próximos passos", paragraphs: ["Envie uma apresentação para parceiros@mangora.com.br com sua região, experiência e modelo de parceria desejado."], items: ["Analisamos aderência e cobertura.", "Definimos responsabilidades e benefícios.", "Acompanhamos os resultados da parceria."] }]} />; }
=======
import { getTranslator } from "@/i18n/server";
import { alternateLanguages, localePath } from "@/i18n/urls";
import { translatedItems } from "@/i18n/items";

export async function generateMetadata(): Promise<Metadata> {
  const { t, locale } = await getTranslator();
  return {
    title: t("publicPages.partners.metaTitle"),
    description: t("publicPages.partners.metaDescription"),
    alternates: { canonical: localePath("/parceiros", locale), languages: alternateLanguages("/parceiros") },
  };
}

export default async function PartnersPage() {
  const { t, messages } = await getTranslator();
  return (
    <PublicInfoPage
      eyebrow={t("publicPages.partners.eyebrow")}
      title={t("publicPages.partners.title")}
      description={t("publicPages.partners.description")}
      backHomeLabel={t("publicPages.support.backHome")}
      updatedLabel={t("publicPages.support.updatedLabel")}
      createAccountLabel={t("publicPages.common.createAccount")}
      loginLabel={t("publicPages.common.login")}
      sections={[
        {
          title: t("publicPages.partners.whoTitle"),
          paragraphs: [t("publicPages.partners.whoBody")],
          items: translatedItems(messages, "publicPages.partners.whoItems"),
        },
        {
          title: t("publicPages.partners.nextTitle"),
          paragraphs: [t("publicPages.partners.nextBody")],
          items: translatedItems(messages, "publicPages.partners.nextItems"),
        },
      ]}
    />
  );
}
>>>>>>> 0e59a660a5acf0b652a188ddf2e8ccc96de79e4d
