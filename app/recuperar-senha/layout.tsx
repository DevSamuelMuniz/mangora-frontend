import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recuperar senha | Mangora",
  description: "Solicite um link para recuperar o acesso à sua conta Mangora.",
};

export default function PasswordRecoveryLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
