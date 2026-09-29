import type { Metadata } from "next";
import PublicInfoPage from "@/components/public/PublicInfoPage";
import { getTranslator } from "@/i18n/server";
import { alternateLanguages, localePath } from "@/i18n/urls";

<<<<<<< HEAD
export const metadata: Metadata = { title: "Termos de uso | Mangora" };
=======
export async function generateMetadata(): Promise<Metadata> {
  const { t, locale } = await getTranslator();
  return {
    title: t("publicPages.terms.metaTitle"),
    description: t("publicPages.terms.metaDescription"),
    alternates: { canonical: localePath("/termos", locale), languages: alternateLanguages("/termos") },
  };
}
>>>>>>> 0e59a660a5acf0b652a188ddf2e8ccc96de79e4d

export default async function TermsPage() {
  const { t } = await getTranslator();
  return (
    <PublicInfoPage
<<<<<<< HEAD
      eyebrow="Legal"
      title="Termos de uso"
      description="Estas condições explicam as regras básicas para usar a plataforma Mangora de forma segura e responsável."
      updatedAt="17 de julho de 2026"
      sections={[
        { title: "1. Uso da plataforma", paragraphs: ["Ao criar uma conta, você declara que as informações fornecidas são verdadeiras e que possui autorização para administrar os dados da empresa cadastrada."], items: ["Mantenha suas credenciais protegidas.", "Use a plataforma somente para finalidades legais.", "Revise os dados antes de confirmar operações."] },
        { title: "2. Disponibilidade e dados", paragraphs: ["Buscamos manter o serviço disponível e confiável. Recursos demonstrativos podem não persistir informações enquanto a integração com a API não estiver ativa."], items: ["Manutenções podem ocorrer quando necessárias.", "A empresa é responsável pela qualidade dos dados inseridos.", "Integrações externas podem possuir regras próprias."] },
        { title: "3. Responsabilidades", paragraphs: ["O Mangora auxilia a operação empresarial, mas não substitui orientação contábil, fiscal, jurídica ou financeira especializada."], items: ["A conta não deve ser compartilhada sem controle.", "Atividades indevidas podem resultar em suspensão.", "Dúvidas podem ser encaminhadas pelo canal de suporte."] },
=======
      eyebrow={t("publicPages.terms.eyebrow")}
      title={t("publicPages.terms.title")}
      description={t("publicPages.terms.description")}
      updatedAt={t("publicPages.terms.updatedAt")}
      backHomeLabel={t("publicPages.support.backHome")}
      updatedLabel={t("publicPages.support.updatedLabel")}
      createAccountLabel={t("publicPages.common.createAccount")}
      loginLabel={t("publicPages.common.login")}
      sections={[
        {
          title: t("publicPages.terms.sections.useTitle"),
          paragraphs: [t("publicPages.terms.sections.useBody")],
        },
        {
          title: t("publicPages.terms.sections.availabilityTitle"),
          paragraphs: [t("publicPages.terms.sections.availabilityBody")],
        },
        {
          title: t("publicPages.terms.sections.responsibilitiesTitle"),
          paragraphs: [t("publicPages.terms.sections.responsibilitiesBody")],
        },
>>>>>>> 0e59a660a5acf0b652a188ddf2e8ccc96de79e4d
      ]}
    />
  );
}
