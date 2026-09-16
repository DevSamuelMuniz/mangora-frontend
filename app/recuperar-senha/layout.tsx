import type { Metadata } from "next";
import { getTranslator } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return {
    title: t("publicPages.recoverPassword.metaTitle"),
    description: t("publicPages.recoverPassword.metaDescription"),
    robots: { index: false, follow: false },
  };
}

export default function PasswordRecoveryLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
