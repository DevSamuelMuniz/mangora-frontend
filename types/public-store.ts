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
