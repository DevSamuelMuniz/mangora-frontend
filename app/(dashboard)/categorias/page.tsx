import { getTranslator } from "@/i18n/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import CategoryManager from "@/components/categories/CategoryManager";
import { getCurrentSession } from "@/lib/auth/server";

<<<<<<< HEAD
export const metadata: Metadata = { title: "Categorias | Mangora", description: "Gerencie categorias de produtos e serviços." };
=======
export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return {
    title: t("pageMeta.categorias.title"),
    description: t("pageMeta.categorias.description"),
  };
}

>>>>>>> 0e59a660a5acf0b652a188ddf2e8ccc96de79e4d
export default async function CategoriesPage() { const session = await getCurrentSession(); if (!session || !["OWNER", "ADMIN", "MANAGER"].includes(session.membership.role)) redirect("/dashboard"); return <CategoryManager />; }
