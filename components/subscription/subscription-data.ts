import type { SubscriptionPlan } from "@/types/subscription";

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "start",
    name: "Start",
    price: 60,
    description: "O essencial para começar a organizar a operação.",
    features: [
      "Uma empresa e uma unidade",
      "Até dois usuários",
      "Clientes, produtos e serviços",
      "Vendas, pedidos e estoque básico",
      "Financeiro e relatórios essenciais",
      "Página online e suporte padrão",
    ],
  },
  {
    id: "business",
    name: "Business",
    price: 129,
    description: "Mais controle para empresas em crescimento.",
    highlighted: true,
    features: [
      "Tudo do plano Start",
      "Até dez usuários",
      "PDV e controle de caixa",
      "Contas a pagar e a receber",
      "Estoque avançado e relatórios completos",
      "Um módulo específico e suporte prioritário",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 249,
    description: "Recursos avançados para operações completas.",
    features: [
      "Tudo do plano Business",
      "Usuários ilimitados e até três unidades",
      "Múltiplos módulos específicos",
      "WhatsApp, QR Code e fidelidade",
      "API e domínio personalizado",
      "Recursos avançados e suporte prioritário",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: null,
    description: "Uma solução personalizada para grandes operações.",
    features: [
      "Redes e franquias",
      "Integrações específicas",
      "Ambiente dedicado",
      "SLA personalizado",
      "Acompanhamento especializado",
    ],
  },
];
