import { redirect } from "next/navigation";
import ServiceForm from "@/components/services/ServiceForm";
import { getCurrentSession } from "@/lib/auth/server";
export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) { const session = await getCurrentSession(); if (!session || !["OWNER", "ADMIN", "MANAGER"].includes(session.membership.role)) redirect("/dashboard"); const { id } = await params; return <ServiceForm serviceId={id} />; }
