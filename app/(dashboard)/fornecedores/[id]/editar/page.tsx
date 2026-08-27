import { redirect } from "next/navigation";
export default async function EditSupplierPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; redirect(`/fornecedores?acao=editar&id=${encodeURIComponent(id)}`); }
