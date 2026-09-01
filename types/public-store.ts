export type PublicStore = {  company: {
    tradeName: string;
    slug: string;
    description: string | null;
    whatsapp: string | null;
    phone: string | null;
    city: string | null;
    state: string | null;
    pickupEnabled: boolean;
    deliveryEnabled: boolean;
    brandColor: string;
    logoUrl: string | null;
    coverUrl: string | null;
    announcement: string | null;
    hours: string | null;
    footerNote: string | null;
    tagline: string | null;
    instagram: string | null;
    theme: "light" | "dark";
    orderNote: string | null;
    titleColor: string | null;
    textColor: string | null;
    backgroundColor: string | null;
    panelColor: string | null;
    font: string;
    coverEnabled: boolean;
  };
  products: {
    id: string;
    name: string;
    sku: string;
    category: string;
    description: string | null;
    price: number;
    imageUrl: string | null;
    available: number | null;
  }[];
};

/** Presets de fonte da página pública (sem carregar fontes novas — usa as da marca ou system). */
export const STORE_FONTS: Record<string, { label: string; display: string; body: string }> = {
    moderno: { label: "Moderno", display: "var(--font-bricolage), sans-serif", body: "var(--font-manrope), sans-serif" },
    classico: { label: "Clássico", display: "'Georgia', 'Times New Roman', serif", body: "'Georgia', serif" },
    mono: { label: "Tecnológico", display: "var(--font-geist-mono), monospace", body: "var(--font-geist-mono), monospace" },
};
