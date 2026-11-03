import type { Metadata } from "next";
import PublicInfoPage from "@/components/public/PublicInfoPage";
import { getTranslator } from "@/i18n/server";
import { publicMetadata } from "@/lib/seo";
import { translatedItems } from "@/i18n/items";

export async function generateMetadata(): Promise<Metadata> {
  const { t, locale } = await getTranslator();
  return publicMetadata("/lgpd", locale, t("publicPages.lgpd.metaTitle"), t("publicPages.lgpd.metaDescription"));
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
