import { redirect } from "next/navigation";
import ServiceForm from "@/components/services/ServiceForm";
import { getCurrentSession } from "@/lib/auth/server";
export default async function NewServicePage() { const session = await getCurrentSession(); if (!session || !["OWNER", "ADMIN", "MANAGER"].includes(session.membership.role)) redirect("/dashboard"); return <ServiceForm />; }
