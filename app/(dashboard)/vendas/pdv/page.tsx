import { redirect } from "next/navigation";

import PdvScreen from "@/components/pdv/PdvScreen";
import { getCurrentSession } from "@/lib/auth/server";

export const metadata = {
    title: "PDV | Mangora",
};

export default async function PdvPage() {
    const session = await getCurrentSession();
    if (!session) redirect("/login");

    return <PdvScreen session={session} />;
}
