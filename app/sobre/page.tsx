import type { Metadata } from "next";
import PublicInfoPage from "@/components/public/PublicInfoPage";
<<<<<<< HEAD
export const metadata: Metadata = { title: "Sobre nós | Mangora" };
export default function AboutPage() { return <PublicInfoPage eyebrow="Empresa" title="Gestão simples para negócios reais" description="O Mangora nasceu para reunir as rotinas essenciais de pequenas e médias empresas em uma experiência clara, rápida e acessível." sections={[{ title: "Nossa missão", paragraphs: ["Reduzir a complexidade da gestão para que empreendedores dediquem mais tempo aos clientes e ao crescimento do negócio."], items: ["Informação centralizada.", "Decisões apoiadas por indicadores.", "Operação simples em qualquer dispositivo."] }, { title: "Como trabalhamos", paragraphs: ["Construímos a plataforma a partir de fluxos cotidianos de vendas, estoque, clientes e financeiro."], items: ["Evolução contínua do produto.", "Segurança desde a concepção.", "Suporte próximo ao cliente."] }]} />; }
=======
import { getTranslator } from "@/i18n/server";
import { alternateLanguages, localePath } from "@/i18n/urls";
import { translatedItems } from "@/i18n/items";

export async function generateMetadata(): Promise<Metadata> {
  const { t, locale } = await getTranslator();
  return {
    title: t("publicPages.about.metaTitle"),
    description: t("publicPages.about.metaDescription"),
    alternates: { canonical: localePath("/sobre", locale), languages: alternateLanguages("/sobre") },
  };
}

export default async function AboutPage() {
  const { t, messages } = await getTranslator();
  return (
    <PublicInfoPage
      eyebrow={t("publicPages.about.eyebrow")}
      title={t("publicPages.about.title")}
      description={t("publicPages.about.description")}
      backHomeLabel={t("publicPages.support.backHome")}
      updatedLabel={t("publicPages.support.updatedLabel")}
      createAccountLabel={t("publicPages.common.createAccount")}
      loginLabel={t("publicPages.common.login")}
      sections={[
        {
          title: t("publicPages.about.missionTitle"),
          paragraphs: [t("publicPages.about.missionBody")],
          items: translatedItems(messages, "publicPages.about.missionItems"),
        },
        {
          title: t("publicPages.about.howTitle"),
          paragraphs: [t("publicPages.about.howBody")],
          items: translatedItems(messages, "publicPages.about.howItems"),
        },
      ]}
    />
  );
}
>>>>>>> 0e59a660a5acf0b652a188ddf2e8ccc96de79e4d
