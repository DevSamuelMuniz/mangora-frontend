import type { Metadata } from "next";
import PublicInfoPage from "@/components/public/PublicInfoPage";
import { getTranslator } from "@/i18n/server";
import { publicMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { t, locale } = await getTranslator();
  return publicMetadata("/termos", locale, t("publicPages.terms.metaTitle"), t("publicPages.terms.metaDescription"));
}

export default async function TermsPage() {
  const { t } = await getTranslator();
  return (
    <PublicInfoPage
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
      ]}
    />
  );
}
