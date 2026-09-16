import type { Metadata } from "next";
import PublicInfoPage from "@/components/public/PublicInfoPage";
import { getTranslator } from "@/i18n/server";
import { alternateLanguages, localePath } from "@/i18n/urls";

export async function generateMetadata(): Promise<Metadata> {
  const { t, locale } = await getTranslator();
  return {
    title: t("publicPages.privacy.metaTitle"),
    description: t("publicPages.privacy.metaDescription"),
    alternates: { canonical: localePath("/privacidade", locale), languages: alternateLanguages("/privacidade") },
  };
}

export default async function PrivacyPage() {
  const { t } = await getTranslator();
  return (
    <PublicInfoPage
      eyebrow={t("publicPages.privacy.eyebrow")}
      title={t("publicPages.privacy.title")}
      description={t("publicPages.privacy.description")}
      updatedAt={t("publicPages.privacy.updatedAt")}
      backHomeLabel={t("publicPages.support.backHome")}
      updatedLabel={t("publicPages.support.updatedLabel")}
      createAccountLabel={t("publicPages.common.createAccount")}
      loginLabel={t("publicPages.common.login")}
      sections={[
        {
          title: t("publicPages.privacy.sections.collectedTitle"),
          paragraphs: [t("publicPages.privacy.sections.collectedBody")],
        },
        {
          title: t("publicPages.privacy.sections.usageTitle"),
          paragraphs: [t("publicPages.privacy.sections.usageBody")],
        },
        {
          title: t("publicPages.privacy.sections.rightsTitle"),
          paragraphs: [t("publicPages.privacy.sections.rightsBody")],
        },
      ]}
    />
  );
}
