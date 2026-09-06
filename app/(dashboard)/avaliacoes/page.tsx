import type { Metadata } from "next";
import { redirect } from "next/navigation";
import ReviewsPanel from "@/components/reviews/ReviewsPanel";
import { getCurrentSession } from "@/lib/auth/server";

export const metadata: Metadata = { title: "Avaliações", description: "Acompanhe a reputação da sua página online." };
export default async function ReviewsPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login?retorno=/avaliacoes");
  if (!["OWNER", "ADMIN", "MANAGER"].includes(session.membership.role)) redirect("/dashboard");
  return <ReviewsPanel />;
}
