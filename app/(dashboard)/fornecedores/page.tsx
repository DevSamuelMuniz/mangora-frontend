import { getTranslator } from "@/i18n/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import SupplierCatalog from "@/components/suppliers/SupplierCatalog";
import SupplierForm from "@/components/suppliers/SupplierForm";
import WorkspaceModal from "@/components/ui/WorkspaceModal";
import { getCurrentSession } from "@/lib/auth/server";
export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("pageMeta.fornecedores.title"), description: t("pageMeta.fornecedores.description") };
}
export default async function SuppliersPage({ searchParams }: { searchParams: Promise<{ acao?: string; id?: string }> }) { const { t } = await getTranslator(); const session = await getCurrentSession(); if (!session || !["OWNER", "ADMIN", "MANAGER"].includes(session.membership.role)) redirect("/dashboard"); const { acao, id } = await searchParams; const editing = acao === "editar" && Boolean(id); return <><SupplierCatalog />{(acao === "novo" || editing) && <WorkspaceModal closeHref="/fornecedores" label={editing ? t("workspace.modal.editSupplier") : t("workspace.modal.newSupplier")}><SupplierForm supplierId={editing ? id : undefined} /></WorkspaceModal>}</>; }
