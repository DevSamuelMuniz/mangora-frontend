import { getTranslator } from "@/i18n/server";
import type { Metadata } from "next";

import SubscriptionManagement from "@/components/subscription/SubscriptionManagement";

<<<<<<< HEAD
export const metadata: Metadata = {
  title: "Assinatura e planos | Mangora",
  description: "Gerencie o plano e acompanhe as cobranças da empresa.",
};
=======
export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return {
    title: t("pageMeta.assinatura.title"),
    description: t("pageMeta.assinatura.description"),
  };
}
>>>>>>> 0e59a660a5acf0b652a188ddf2e8ccc96de79e4d

export default function SubscriptionPage() {
  return <SubscriptionManagement />;
}
