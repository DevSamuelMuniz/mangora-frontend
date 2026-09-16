import type { Metadata } from "next";
import PublicInfoPage from "@/components/public/PublicInfoPage";
import { getTranslator } from "@/i18n/server";
import { translatedItems } from "@/i18n/items";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return {
    title: t("publicPages.about.metaTitle"),
    description: t("publicPages.about.metaDescription"),
    alternates: { canonical: "/sobre" },
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
