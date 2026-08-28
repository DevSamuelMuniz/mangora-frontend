import type { Metadata } from "next";

import SettingsPanel from "@/components/settings/SettingsPanel";
import type { SettingsTab } from "@/types/settings";

export const metadata: Metadata = {
  title: "Configurações | Mangora",
  description: "Configure a empresa e as preferências da plataforma.",
};

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ secao?: string }> }) {
  const { secao } = await searchParams;
  const tabs: SettingsTab[] = ["company", "preferences", "sales", "notifications", "online", "security"];
  const initialTab = tabs.includes(secao as SettingsTab) ? secao as SettingsTab : "company";
  return <SettingsPanel key={initialTab} initialTab={initialTab} />;
}
