import { getTranslator } from "@/i18n/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import ServiceCatalog from "@/components/services/ServiceCatalog";
import ServiceForm from "@/components/services/ServiceForm";
import WorkspaceModal from "@/components/ui/WorkspaceModal";
import { getCurrentSession } from "@/lib/auth/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return {
    title: t("pageMeta.servicos.title"),
    description: t("pageMeta.servicos.description"),
  };
}

export default async function ServicesPage({ searchParams }: { searchParams: Promise<{ acao?: string; id?: string }> }) {
  const { t } = await getTranslator();
  const session = await getCurrentSession(); if (!session || !["OWNER", "ADMIN", "MANAGER"].includes(session.membership.role)) redirect("/dashboard"); const { acao, id } = await searchParams; const editing = acao === "editar" && Boolean(id); return <><ServiceCatalog />{(acao === "novo" || editing) && <WorkspaceModal closeHref="/servicos" label={editing ? t("workspace.modal.editService") : t("workspace.modal.newService")}><ServiceForm serviceId={editing ? id : undefined} /></WorkspaceModal>}</>; }
