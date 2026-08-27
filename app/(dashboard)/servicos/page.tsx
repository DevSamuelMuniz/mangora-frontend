import type { Metadata } from "next";
import { redirect } from "next/navigation";
import ServiceCatalog from "@/components/services/ServiceCatalog";
import ServiceForm from "@/components/services/ServiceForm";
import WorkspaceModal from "@/components/ui/WorkspaceModal";
import { getCurrentSession } from "@/lib/auth/server";
export const metadata: Metadata = { title: "Serviços | Mangora", description: "Gerencie os serviços oferecidos pela empresa." };
export default async function ServicesPage({ searchParams }: { searchParams: Promise<{ acao?: string; id?: string }> }) { const session = await getCurrentSession(); if (!session || !["OWNER", "ADMIN", "MANAGER"].includes(session.membership.role)) redirect("/dashboard"); const { acao, id } = await searchParams; const editing = acao === "editar" && Boolean(id); return <><ServiceCatalog />{(acao === "novo" || editing) && <WorkspaceModal closeHref="/servicos" label={editing ? "Editar serviço" : "Novo serviço"}><ServiceForm serviceId={editing ? id : undefined} /></WorkspaceModal>}</>; }
