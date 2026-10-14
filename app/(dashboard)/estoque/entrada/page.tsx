import type { Metadata } from "next";
import { getTranslator } from "@/i18n/server";
import StockIntakeForm from "@/components/stock/StockIntakeForm";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("stock.intake.title"), description: t("stock.intake.subtitle") };
}

export default function StockIntakePage() {
  return <StockIntakeForm />;
}
