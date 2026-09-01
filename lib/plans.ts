import type { SubscriptionPlan } from "@/types/subscription";

/**
 * Catálogo canônico de planos (fonte única).
 *
 * Fase 6/7: antes havia duas listas duplicadas — `lib/plans.ts` (landing) e
 * `components/subscription/subscription-data.ts` (painel). Agora o catálogo
 * completo vive aqui (usado pelo painel/Asaas) e a landing usa uma visão
 * derivada (`marketingPlans`), sem duplicar nome/preço/descrição/features.
 */
export const subscriptionPlans: SubscriptionPlan[] = [
    {
        id: "free",
        name: "Free",
        price: 0,
        description: "Para começar, testar a rotina e manter o essencial organizado.",
        features: [
            "1 empresa e 1 unidade",
            "1 usuário proprietário",
            "Clientes, produtos e serviços",
            "Vendas e estoque básico",
            "Dashboard essencial",
            "Acesso contínuo, sem cartão",
        ],
    },
    {
        id: "start",
        name: "Start",
        price: 60,
        description: "O essencial para organizar seu pequeno negócio.",
        features: [
            "1 empresa e 1 unidade",
            "Até 2 usuários",
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
        description: "Mais controle para uma operação em crescimento.",
        highlighted: true,
        features: [
            "Tudo do plano Start",
            "Até 10 usuários",
            "PDV e controle de caixa",
            "Contas a pagar e a receber",
            "Estoque avançado e relatórios completos",
            "1 módulo específico + suporte prioritário",
        ],
    },
    {
        id: "premium",
        name: "Premium",
        price: 249,
        description: "Automação e escala para operações maiores.",
        features: [
            "Tudo do plano Business",
            "Usuários ilimitados e até 3 unidades",
            "Múltiplos módulos específicos",
            "WhatsApp, QR Code e fidelidade",
            "API e domínio personalizado",
            "Suporte prioritário",
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

/** Visão de marketing (landing): exclui Enterprise e expõe preço como texto de exibição. */
export type MarketingPlan = {
    id: Exclude<SubscriptionPlan["id"], "enterprise">;
    name: string;
    price: string;
    description: string;
    features: string[];
    featured?: boolean;
};

export const marketingPlans: MarketingPlan[] = subscriptionPlans
    .filter((plan) => plan.id !== "enterprise")
    .map((plan) => ({
        id: plan.id as MarketingPlan["id"],
        name: plan.name,
        price: String(plan.price),
        description: plan.description,
        features: plan.features,
        featured: plan.highlighted,
    }));
