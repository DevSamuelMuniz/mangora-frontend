import type { Metadata } from "next";
import { redirect } from "next/navigation";
import CategoryManager from "@/components/categories/CategoryManager";
import { getCurrentSession } from "@/lib/auth/server";

export const metadata: Metadata = { title: "Categorias | Gestão+", description: "Gerencie categorias de produtos e serviços." };
export default async function CategoriesPage() { const session = await getCurrentSession(); if (!session || !["OWNER", "ADMIN", "MANAGER"].includes(session.membership.role)) redirect("/dashboard"); return <CategoryManager />; }
