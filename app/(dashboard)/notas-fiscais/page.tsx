import type { Metadata } from "next";
import FiscalCenter from "@/components/fiscal/FiscalCenter";

export const metadata: Metadata = { title: "Notas fiscais", description: "Prepare e acompanhe documentos NF-e e NFC-e." };
export default function FiscalDocumentsPage() { return <FiscalCenter />; }
