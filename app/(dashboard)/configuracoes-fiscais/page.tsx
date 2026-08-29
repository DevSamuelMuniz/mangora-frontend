import type { Metadata } from "next";
import FiscalSettingsPanel from "@/components/fiscal/FiscalSettingsPanel";

export const metadata: Metadata = { title: "Configuração fiscal | Mangora", description: "Configure a emissão fiscal da unidade atual." };
export default function FiscalSettingsPage() { return <FiscalSettingsPanel />; }
