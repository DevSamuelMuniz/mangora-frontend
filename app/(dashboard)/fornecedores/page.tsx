import type { Metadata } from "next";
import { redirect } from "next/navigation";
import SupplierCatalog from "@/components/suppliers/SupplierCatalog";
import SupplierForm from "@/components/suppliers/SupplierForm";
import WorkspaceModal from "@/components/ui/WorkspaceModal";
import { getCurrentSession } from "@/lib/auth/server";
export const metadata: Metadata = { title: "Fornecedores", description: "Gerencie os fornecedores da empresa." };
export default async function SuppliersPage({ searchParams }: { searchParams: Promise<{ acao?: string; id?: string }> }) { const session = await getCurrentSession(); if (!session || !["OWNER", "ADMIN", "MANAGER"].includes(session.membership.role)) redirect("/dashboard"); const { acao, id } = await searchParams; const editing = acao === "editar" && Boolean(id); return <><SupplierCatalog />{(acao === "novo" || editing) && <WorkspaceModal closeHref="/fornecedores" label={editing ? "Editar fornecedor" : "Novo fornecedor"}><SupplierForm supplierId={editing ? id : undefined} /></WorkspaceModal>}</>; }
