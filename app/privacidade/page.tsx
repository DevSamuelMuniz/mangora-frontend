import type { Metadata } from "next";
import PublicInfoPage from "@/components/public/PublicInfoPage";

export const metadata: Metadata = { title: "Privacidade | Gestão+" };

export default function PrivacyPage() {
  return (
    <PublicInfoPage
      eyebrow="Privacidade"
      title="Política de privacidade"
      description="Saiba quais dados utilizamos, por que eles são necessários e quais controles estão disponíveis para sua empresa."
      updatedAt="17 de julho de 2026"
      sections={[
        { title: "Dados coletados", paragraphs: ["Coletamos os dados informados no cadastro e os registros necessários para oferecer os recursos contratados."], items: ["Dados de identificação e contato.", "Informações da empresa e dos usuários autorizados.", "Registros técnicos de acesso e segurança."] },
        { title: "Como utilizamos", paragraphs: ["Os dados são utilizados para autenticar usuários, entregar funcionalidades, prestar suporte, melhorar a experiência e proteger a plataforma."], items: ["Não comercializamos dados pessoais.", "O acesso interno segue critérios de necessidade.", "Fornecedores devem cumprir requisitos de proteção."] },
        { title: "Seus direitos", paragraphs: ["Você pode solicitar informações, correção, portabilidade ou exclusão de dados, observados os prazos legais e obrigações de retenção aplicáveis."], items: ["Confirmação e acesso aos dados.", "Correção de informações incompletas.", "Revogação de consentimento quando aplicável."] },
      ]}
    />
  );
}
