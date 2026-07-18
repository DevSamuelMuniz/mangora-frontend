import type { Metadata } from "next";
import { redirect } from "next/navigation";
import SupplierCatalog from "@/components/suppliers/SupplierCatalog";
import { getCurrentSession } from "@/lib/auth/server";
export const metadata: Metadata = { title: "Fornecedores | Gestão+", description: "Gerencie os fornecedores da empresa." };
export default async function SuppliersPage() { const session = await getCurrentSession(); if (!session || !["OWNER", "ADMIN", "MANAGER"].includes(session.membership.role)) redirect("/dashboard"); return <SupplierCatalog />; }
