import type { Metadata } from "next";
import PublicInfoPage from "@/components/public/PublicInfoPage";
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
