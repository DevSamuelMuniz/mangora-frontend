import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/server";
import StorefrontEditor from "@/components/public-store/StorefrontEditor";

export const metadata: Metadata = { title: "Editar página | Mangora", robots: { index: false, follow: false } };

export default async function EditStorePage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login?retorno=/loja/editar");
  return <StorefrontEditor />;
}
