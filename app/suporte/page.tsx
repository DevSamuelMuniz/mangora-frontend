import type { Metadata } from "next";
import PublicInfoPage from "@/components/public/PublicInfoPage";
<<<<<<< HEAD
export const metadata: Metadata = { title: "Suporte | Mangora" };
export default function SupportPage() { return <PublicInfoPage eyebrow="Ajuda" title="Como podemos ajudar?" description="Encontre os canais e informações essenciais para resolver dúvidas sobre o Mangora." sections={[{ title: "Atendimento", paragraphs: ["Nosso atendimento está disponível de segunda a sexta-feira, das 8h às 18h, no horário de Brasília."], items: ["WhatsApp: (81) 98463-9299.", "E-mail: suporte@mangora.com.br.", "Tenha o nome da empresa e uma descrição do problema em mãos."] }, { title: "Antes de solicitar ajuda", paragraphs: ["Verifique sua conexão, atualize a página e confirme se os dados obrigatórios foram preenchidos."], items: ["Não envie senhas ou códigos de acesso.", "Inclua uma captura de tela quando possível.", "Informe os passos para reproduzir o problema."] }]} />; }
=======
import { getTranslator } from "@/i18n/server";
import { alternateLanguages, localePath } from "@/i18n/urls";

export async function generateMetadata(): Promise<Metadata> {
  const { t, locale } = await getTranslator();
  return {
    title: t("publicPages.support.metaTitle"),
    description: t("publicPages.support.metaDescription"),
    alternates: { canonical: localePath("/suporte", locale), languages: alternateLanguages("/suporte") },
  };
}

export default async function SupportPage() {
  const { t } = await getTranslator();
  return (
    <PublicInfoPage
      eyebrow={t("publicPages.support.eyebrow")}
      title={t("publicPages.support.title")}
      description={t("publicPages.support.description")}
      backHomeLabel={t("publicPages.support.backHome")}
      updatedLabel={t("publicPages.support.updatedLabel")}
      createAccountLabel={t("publicPages.common.createAccount")}
      loginLabel={t("publicPages.common.login")}
      sections={[
        {
          title: t("publicPages.support.channelsTitle"),
          paragraphs: [t("publicPages.support.channelsHours")],
          items: [t("publicPages.support.channelsItems.0"), t("publicPages.support.channelsItems.1"), t("publicPages.support.channelsItems.2")],
        },
        {
          title: t("publicPages.support.beforeTitle"),
          paragraphs: [t("publicPages.support.beforeCopy")],
          items: [t("publicPages.support.beforeItems.0"), t("publicPages.support.beforeItems.1"), t("publicPages.support.beforeItems.2")],
        },
      ]}
    />
  );
}
>>>>>>> 0e59a660a5acf0b652a188ddf2e8ccc96de79e4d
