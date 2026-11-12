import { redirect } from "next/navigation";

import PdvScreen from "@/components/pdv/PdvScreen";
import { getCurrentSession } from "@/lib/auth/server";
import { PrintScopeProvider } from "@/lib/printing/scope";

export const metadata = {
    title: "PDV",
    robots: { index: false, follow: false },
};

export default async function PdvPage() {
    const session = await getCurrentSession();
    if (!session) redirect("/login");
    if (session.company.accessBlocked) redirect("/assinatura/cobrancas");

    return <PrintScopeProvider key={session.company.id} companyId={session.company.id}><PdvScreen session={session} /></PrintScopeProvider>;
}
