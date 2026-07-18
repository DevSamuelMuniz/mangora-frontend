import type { Metadata } from "next";

import SubscriptionManagement from "@/components/subscription/SubscriptionManagement";

export const metadata: Metadata = {
  title: "Assinatura e planos | Gestão+",
  description: "Gerencie o plano e acompanhe as cobranças da empresa.",
};

export default function SubscriptionPage() {
  return <SubscriptionManagement />;
}
