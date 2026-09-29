import { redirect } from "next/navigation";
export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; redirect(`/servicos?acao=editar&id=${encodeURIComponent(id)}`); }
