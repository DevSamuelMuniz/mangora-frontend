import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PurchaseCatalog from "@/components/purchases/PurchaseCatalog";
import { getCurrentSession } from "@/lib/auth/server";
export const metadata: Metadata = { title: "Compras | Gestão+", description: "Acompanhe pedidos de compra e recebimentos." };
export default async function PurchasesPage() { const session = await getCurrentSession(); if (!session || !["OWNER", "ADMIN", "MANAGER"].includes(session.membership.role)) redirect("/dashboard"); return <PurchaseCatalog />; }
