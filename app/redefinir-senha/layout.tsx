import type { Metadata } from "next";
export const metadata: Metadata = { title: "Redefinir senha", description: "Crie uma nova senha para sua conta Mangora.", robots: { index: false, follow: false } };
export default function ResetPasswordLayout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
