import { getTranslator } from "@/i18n/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PurchaseCatalog from "@/components/purchases/PurchaseCatalog";
import NewPurchaseForm from "@/components/purchases/NewPurchaseForm";
import WorkspaceModal from "@/components/ui/WorkspaceModal";
import { getCurrentSession } from "@/lib/auth/server";
<<<<<<< HEAD
export const metadata: Metadata = { title: "Compras | Mangora", description: "Acompanhe pedidos de compra e recebimentos." };
export default async function PurchasesPage() { const session = await getCurrentSession(); if (!session || !["OWNER", "ADMIN", "MANAGER"].includes(session.membership.role)) redirect("/dashboard"); return <PurchaseCatalog />; }
=======

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return {
    title: t("pageMeta.compras.title"),
    description: t("pageMeta.compras.description"),
  };
}

export default async function PurchasesPage({ searchParams }: { searchParams: Promise<{ acao?: string }> }) {
  const { t } = await getTranslator();
  const session = await getCurrentSession(); if (!session || !["OWNER", "ADMIN", "MANAGER"].includes(session.membership.role)) redirect("/dashboard"); const { acao } = await searchParams; return <><PurchaseCatalog />{acao === "novo" && <WorkspaceModal closeHref="/compras" label={t("workspace.modal.newPurchase")} size="wide"><NewPurchaseForm /></WorkspaceModal>}</>; }
>>>>>>> 0e59a660a5acf0b652a188ddf2e8ccc96de79e4d
