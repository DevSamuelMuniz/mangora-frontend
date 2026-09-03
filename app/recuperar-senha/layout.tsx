import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recuperar senha",
  description: "Solicite um link para recuperar o acesso à sua conta Mangora.",
  robots: { index: false, follow: false },
};

export default function PasswordRecoveryLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
