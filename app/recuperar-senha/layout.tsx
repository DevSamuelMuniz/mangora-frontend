import type { Metadata } from "next";
import { getTranslator } from "@/i18n/server";

<<<<<<< HEAD
export const metadata: Metadata = {
  title: "Recuperar senha | Mangora",
  description: "Solicite um link para recuperar o acesso à sua conta Mangora.",
};
=======
export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return {
    title: t("publicPages.recoverPassword.metaTitle"),
    description: t("publicPages.recoverPassword.metaDescription"),
    robots: { index: false, follow: false },
  };
}
>>>>>>> 0e59a660a5acf0b652a188ddf2e8ccc96de79e4d

export default function PasswordRecoveryLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
