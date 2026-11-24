export const landingLayouts = ["standard", "showcase", "editorial", "black-friday"] as const;
export type LandingLayout = typeof landingLayouts[number];
export type LandingLayoutDraft = { theme: LandingLayout; headline: string; description: string; ctaLabel: string };

export type LandingConfig = {
  theme: LandingLayout;
  layoutDrafts?: LandingLayoutDraft[];
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

export function layoutDraft(config: LandingConfig): LandingLayoutDraft {
  return { theme: config.theme, headline: config.headline, description: config.description, ctaLabel: config.ctaLabel };
}

export function switchLandingLayout(config: LandingConfig, theme: LandingLayout, preset: LandingLayoutDraft): LandingConfig {
  if (config.theme === theme) return config;
  const drafts = new Map((config.layoutDrafts ?? []).map(draft => [draft.theme, draft]));
  drafts.set(config.theme, layoutDraft(config));
  const next = drafts.get(theme) ?? preset;
  return { ...config, ...next, theme, layoutDrafts: Array.from(drafts.values()) };
}

export const blackFridayPreset: LandingConfig = {
  theme: "black-friday", promotionEnabled: true,
  headline: "Sua loja no próximo nível. Pela metade do preço.",
  description: "PDV, estoque e financeiro juntos. Aproveite a Black Friday Mangora e organize sua loja com mais economia.",
  ctaLabel: "Quero aproveitar", discountPercent: 50, discountMonths: 3,
  startsAt: null, endsAt: null,
};
