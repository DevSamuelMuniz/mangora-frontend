import type { Metadata } from "next";
import PublicInfoPage from "@/components/public/PublicInfoPage";
<<<<<<< HEAD
export const metadata: Metadata = { title: "LGPD | Mangora" };
export default function LgpdPage() { return <PublicInfoPage eyebrow="Proteção de dados" title="Compromisso com a LGPD" description="Tratamos dados pessoais com transparência, finalidade definida e medidas compatíveis com a Lei Geral de Proteção de Dados." sections={[{ title: "Papéis e finalidades", paragraphs: ["Dependendo do tratamento, o Mangora pode atuar como controlador ou operador. As responsabilidades são definidas conforme a relação com o cliente."], items: ["Finalidades informadas e legítimas.", "Coleta limitada ao necessário.", "Retenção conforme obrigações aplicáveis."] }, { title: "Atendimento aos titulares", paragraphs: ["Solicitações relacionadas a dados pessoais podem ser encaminhadas para privacidade@mangora.com.br."], items: ["Identificamos e validamos o solicitante.", "Avaliamos obrigações legais de retenção.", "Respondemos dentro dos prazos aplicáveis."] }, { title: "Governança", paragraphs: ["Mantemos processos para avaliar riscos, fornecedores, incidentes e mudanças relevantes no tratamento de dados."], items: ["Revisão periódica de controles.", "Registro de decisões e operações.", "Treinamento e conscientização."] }]} />; }
=======
import { getTranslator } from "@/i18n/server";
import { alternateLanguages, localePath } from "@/i18n/urls";
import { translatedItems } from "@/i18n/items";

export async function generateMetadata(): Promise<Metadata> {
  const { t, locale } = await getTranslator();
  return {
    title: t("publicPages.lgpd.metaTitle"),
    description: t("publicPages.lgpd.metaDescription"),
    alternates: { canonical: localePath("/lgpd", locale), languages: alternateLanguages("/lgpd") },
  };
}

export default async function LgpdPage() {
  const { t, messages } = await getTranslator();
  return (
    <PublicInfoPage
      eyebrow={t("publicPages.lgpd.eyebrow")}
      title={t("publicPages.lgpd.title")}
      description={t("publicPages.lgpd.description")}
      backHomeLabel={t("publicPages.support.backHome")}
      updatedLabel={t("publicPages.support.updatedLabel")}
      createAccountLabel={t("publicPages.common.createAccount")}
      loginLabel={t("publicPages.common.login")}
      sections={[
        {
          title: t("publicPages.lgpd.rolesTitle"),
          paragraphs: [t("publicPages.lgpd.rolesBody")],
          items: translatedItems(messages, "publicPages.lgpd.rolesItems"),
        },
        {
          title: t("publicPages.lgpd.holdersTitle"),
          paragraphs: [t("publicPages.lgpd.holdersBody")],
          items: translatedItems(messages, "publicPages.lgpd.holdersItems"),
        },
        {
          title: t("publicPages.lgpd.governanceTitle"),
          paragraphs: [t("publicPages.lgpd.governanceBody")],
          items: translatedItems(messages, "publicPages.lgpd.governanceItems"),
        },
      ]}
    />
  );
}
>>>>>>> 0e59a660a5acf0b652a188ddf2e8ccc96de79e4d
