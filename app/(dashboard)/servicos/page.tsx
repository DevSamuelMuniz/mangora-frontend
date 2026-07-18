import type { Metadata } from "next";
import { redirect } from "next/navigation";
import ServiceCatalog from "@/components/services/ServiceCatalog";
import { getCurrentSession } from "@/lib/auth/server";
export const metadata: Metadata = { title: "Serviços | Gestão+", description: "Gerencie os serviços oferecidos pela empresa." };
export default async function ServicesPage() { const session = await getCurrentSession(); if (!session || !["OWNER", "ADMIN", "MANAGER"].includes(session.membership.role)) redirect("/dashboard"); return <ServiceCatalog />; }
