import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PurchaseCatalog from "@/components/purchases/PurchaseCatalog";
import NewPurchaseForm from "@/components/purchases/NewPurchaseForm";
import WorkspaceModal from "@/components/ui/WorkspaceModal";
import { getCurrentSession } from "@/lib/auth/server";
export const metadata: Metadata = { title: "Compras | Mangora", description: "Acompanhe pedidos de compra e recebimentos." };
export default async function PurchasesPage({ searchParams }: { searchParams: Promise<{ acao?: string }> }) { const session = await getCurrentSession(); if (!session || !["OWNER", "ADMIN", "MANAGER"].includes(session.membership.role)) redirect("/dashboard"); const { acao } = await searchParams; return <><PurchaseCatalog />{acao === "novo" && <WorkspaceModal closeHref="/compras" label="Nova compra" size="wide"><NewPurchaseForm /></WorkspaceModal>}</>; }
