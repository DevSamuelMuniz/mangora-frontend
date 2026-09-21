import type { Metadata } from "next";
import LabelWorkspace from "@/components/labels/LabelWorkspace";
import { getTranslator } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("labels.title"), description: t("labels.subtitle") };
}

export default function LabelsPage() {
  return <LabelWorkspace />;
}
