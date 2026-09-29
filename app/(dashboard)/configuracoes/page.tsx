import { getTranslator } from "@/i18n/server";
import type { Metadata } from "next";

import SettingsPanel from "@/components/settings/SettingsPanel";
import type { SettingsTab } from "@/types/settings";

<<<<<<< HEAD
export const metadata: Metadata = {
  title: "Configurações | Mangora",
  description: "Configure a empresa e as preferências da plataforma.",
};
=======
export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return {
    title: t("pageMeta.configuracoes.title"),
    description: t("pageMeta.configuracoes.description"),
  };
}
>>>>>>> 0e59a660a5acf0b652a188ddf2e8ccc96de79e4d

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ secao?: string }> }) {
  const { secao } = await searchParams;
  const tabs: SettingsTab[] = ["company", "preferences", "sales", "notifications", "security"];
  const initialTab = tabs.includes(secao as SettingsTab) ? secao as SettingsTab : "company";
  return <SettingsPanel key={initialTab} initialTab={initialTab} />;
}
