import { getTranslator } from "@/i18n/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import CategoryManager from "@/components/categories/CategoryManager";
import { getCurrentSession } from "@/lib/auth/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return {
    title: t("pageMeta.categorias.title"),
    description: t("pageMeta.categorias.description"),
  };
}

export default async function CategoriesPage() { const session = await getCurrentSession(); if (!session || !["OWNER", "ADMIN", "MANAGER"].includes(session.membership.role)) redirect("/dashboard"); return <CategoryManager />; }
