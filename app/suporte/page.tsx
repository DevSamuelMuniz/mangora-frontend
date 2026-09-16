import type { Metadata } from "next";
import PublicInfoPage from "@/components/public/PublicInfoPage";
import { getTranslator } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return {
    title: t("publicPages.support.metaTitle"),
    description: t("publicPages.support.metaDescription"),
    alternates: { canonical: "/suporte" },
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
