export type LandingConfig = {
  theme: "standard" | "black-friday";
  promotionEnabled: boolean;
  promotionActive?: boolean;
  headline: string;
  description: string;
  ctaLabel: string;
  discountPercent: number;
  discountMonths: number;
  startsAt: string | null;
  endsAt: string | null;
};

export const blackFridayPreset: LandingConfig = {
  theme: "black-friday", promotionEnabled: true,
  headline: "Sua loja no próximo nível. Pela metade do preço.",
  description: "PDV, estoque e financeiro juntos. Aproveite a Black Friday Mangora e organize sua loja com mais economia.",
  ctaLabel: "Quero aproveitar", discountPercent: 50, discountMonths: 3,
  startsAt: null, endsAt: null,
};
