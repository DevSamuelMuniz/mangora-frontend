import type { Metadata } from "next";

import SettingsPanel from "@/components/settings/SettingsPanel";

export const metadata: Metadata = {
  title: "Configurações | Mangora",
  description: "Configure a empresa e as preferências da plataforma.",
};

export default function SettingsPage() {
  return <SettingsPanel />;
}
