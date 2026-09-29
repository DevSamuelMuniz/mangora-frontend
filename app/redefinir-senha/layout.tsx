import type { Metadata } from "next";
<<<<<<< HEAD
export const metadata: Metadata = { title: "Redefinir senha | Mangora", description: "Crie uma nova senha para sua conta Mangora." };
=======
export const metadata: Metadata = { title: "Redefinir senha", description: "Crie uma nova senha para sua conta Mangora.", robots: { index: false, follow: false } };
>>>>>>> 0e59a660a5acf0b652a188ddf2e8ccc96de79e4d
export default function ResetPasswordLayout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
