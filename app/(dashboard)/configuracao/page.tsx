import { redirect } from "next/navigation";

export default function ConfiguracaoAliasPage() {
  redirect("/configuracoes?secao=security");
}
