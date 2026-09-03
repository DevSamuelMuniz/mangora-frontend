import type { Metadata } from "next";
import UnitsOverview from "@/components/units/UnitsOverview";

export const metadata: Metadata = {
  title: "Lojas",
  description: "Gerencie as unidades e acompanhe os resultados consolidados.",
};

export default function UnitsPage() {
  return <UnitsOverview />;
}
