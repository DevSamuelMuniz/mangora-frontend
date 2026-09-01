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
        description: "O essencial para organizar seu negócio, com 7 dias de experiência Start.",
        features: [
            "Tudo do Start por 7 dias",
            "1 dono e 1 funcionário",
            "1 loja",
            "Clientes, produtos e serviços",
            "Vendas, pedidos e estoque básico",
            "Financeiro e relatórios essenciais",
        ],
    },
    {
        id: "start",
        name: "Start",
        price: 60,
        description: "O essencial para organizar seu pequeno negócio.",
        features: [
            "Tudo do plano Free",
            "Página online",
            "1 dono e 2 funcionários",
            "1 loja",
            "Suporte padrão",
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
            "2 donos e 5 funcionários",
            "Até 3 lojas",
            "1ª loja incluída; adicionais por R$ 129/mês cada",
            "PDV e controle de caixa",
            "Contas a pagar e a receber",
            "Estoque avançado e relatórios completos",
        ],
    },
    {
        id: "premium",
        name: "Premium",
        price: 249,
        description: "Automação e escala para operações maiores.",
        features: [
            "Tudo do plano Business",
            "3 donos e 10 funcionários",
            "Até 5 lojas",
            "1ª loja incluída; adicionais por R$ 249/mês cada",
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
            "Tudo do plano Business",
            "Donos, funcionários e lojas a combinar",
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
