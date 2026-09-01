export type PublicStore = {
  company: {
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
