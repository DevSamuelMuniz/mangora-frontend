import { getTranslator } from "@/i18n/server";
import type { Metadata } from "next";

import SubscriptionManagement from "@/components/subscription/SubscriptionManagement";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return {
    title: t("pageMeta.assinatura.title"),
    description: t("pageMeta.assinatura.description"),
  };
}

export default function SubscriptionPage() {
  return <SubscriptionManagement />;
}
