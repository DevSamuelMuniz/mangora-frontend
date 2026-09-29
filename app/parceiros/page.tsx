import type { Metadata } from "next";
import PublicInfoPage from "@/components/public/PublicInfoPage";
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
