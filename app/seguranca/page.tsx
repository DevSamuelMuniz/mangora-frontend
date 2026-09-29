import type { Metadata } from "next";
import PublicInfoPage from "@/components/public/PublicInfoPage";
<<<<<<< HEAD
export const metadata: Metadata = { title: "Segurança | Mangora" };
export default function SecurityPage() { return <PublicInfoPage eyebrow="Confiança" title="Segurança em todas as etapas" description="Aplicamos controles técnicos e operacionais para proteger contas, informações empresariais e a disponibilidade da plataforma." sections={[{ title: "Proteção da conta", paragraphs: ["O acesso é individual e deve utilizar credenciais fortes e exclusivas."], items: ["Controle de acesso por perfil.", "Monitoramento de atividades suspeitas.", "Práticas seguras de autenticação."] }, { title: "Proteção dos dados", paragraphs: ["Adotamos medidas proporcionais ao risco e revisamos continuamente nossa arquitetura."], items: ["Comunicação protegida em trânsito.", "Separação lógica das informações.", "Rotinas de continuidade e recuperação."] }, { title: "Reporte uma vulnerabilidade", paragraphs: ["Envie detalhes de forma responsável para seguranca@mangora.com.br. Não explore nem exponha dados de terceiros."], items: ["Descreva o impacto potencial.", "Inclua passos mínimos de reprodução.", "Aguarde nossa análise antes de divulgar."] }]} />; }
=======
import { getTranslator } from "@/i18n/server";
import { alternateLanguages, localePath } from "@/i18n/urls";
import { translatedItems } from "@/i18n/items";

export async function generateMetadata(): Promise<Metadata> {
  const { t, locale } = await getTranslator();
  return {
    title: t("publicPages.security.metaTitle"),
    description: t("publicPages.security.metaDescription"),
    alternates: { canonical: localePath("/seguranca", locale), languages: alternateLanguages("/seguranca") },
  };
}

export default async function SecurityPage() {
  const { t, messages } = await getTranslator();
  return (
    <PublicInfoPage
      eyebrow={t("publicPages.security.eyebrow")}
      title={t("publicPages.security.title")}
      description={t("publicPages.security.description")}
      backHomeLabel={t("publicPages.support.backHome")}
      updatedLabel={t("publicPages.support.updatedLabel")}
      createAccountLabel={t("publicPages.common.createAccount")}
      loginLabel={t("publicPages.common.login")}
      sections={[
        {
          title: t("publicPages.security.accountTitle"),
          paragraphs: [t("publicPages.security.accountBody")],
          items: translatedItems(messages, "publicPages.security.accountItems"),
        },
        {
          title: t("publicPages.security.dataTitle"),
          paragraphs: [t("publicPages.security.dataBody")],
          items: translatedItems(messages, "publicPages.security.dataItems"),
        },
        {
          title: t("publicPages.security.reportTitle"),
          paragraphs: [t("publicPages.security.reportBody")],
          items: translatedItems(messages, "publicPages.security.reportItems"),
        },
      ]}
    />
  );
}
>>>>>>> 0e59a660a5acf0b652a188ddf2e8ccc96de79e4d
