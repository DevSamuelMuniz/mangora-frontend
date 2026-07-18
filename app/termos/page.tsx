import type { Metadata } from "next";
import PublicInfoPage from "@/components/public/PublicInfoPage";

export const metadata: Metadata = { title: "Termos de uso | Gestão+" };

export default function TermsPage() {
  return (
    <PublicInfoPage
      eyebrow="Legal"
      title="Termos de uso"
      description="Estas condições explicam as regras básicas para usar a plataforma Gestão+ de forma segura e responsável."
      updatedAt="17 de julho de 2026"
      sections={[
        { title: "1. Uso da plataforma", paragraphs: ["Ao criar uma conta, você declara que as informações fornecidas são verdadeiras e que possui autorização para administrar os dados da empresa cadastrada."], items: ["Mantenha suas credenciais protegidas.", "Use a plataforma somente para finalidades legais.", "Revise os dados antes de confirmar operações."] },
        { title: "2. Disponibilidade e dados", paragraphs: ["Buscamos manter o serviço disponível e confiável. Recursos demonstrativos podem não persistir informações enquanto a integração com a API não estiver ativa."], items: ["Manutenções podem ocorrer quando necessárias.", "A empresa é responsável pela qualidade dos dados inseridos.", "Integrações externas podem possuir regras próprias."] },
        { title: "3. Responsabilidades", paragraphs: ["O Gestão+ auxilia a operação empresarial, mas não substitui orientação contábil, fiscal, jurídica ou financeira especializada."], items: ["A conta não deve ser compartilhada sem controle.", "Atividades indevidas podem resultar em suspensão.", "Dúvidas podem ser encaminhadas pelo canal de suporte."] },
      ]}
    />
  );
}
