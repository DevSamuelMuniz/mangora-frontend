import type { PublicStore } from "@/types/public-store";

/** Elementos da página que aceitam cor própria (override individual sobre a cor global). */
export type ElementDef = { id: string; label: string; fallback: (c: PublicStore["company"]) => string };

export const ELEMENTS: ElementDef[] = [
  { id: "cta", label: "Botão Ver cardápio", fallback: (c) => c.buttonColor || "#ff6b1a" },
  { id: "whatsappHeader", label: "Botão WhatsApp do topo", fallback: (c) => c.buttonColor || "#ff6b1a" },
  { id: "addButton", label: "Botão Adicionar", fallback: (c) => c.buttonColor || "#ff6b1a" },
  { id: "submitButton", label: "Botão Enviar pedido", fallback: (c) => c.buttonColor || "#ff6b1a" },
  { id: "footerWhatsapp", label: "Botão Pedir pelo WhatsApp", fallback: (c) => c.buttonColor || "#ff6b1a" },
  { id: "heroTitle", label: "Título do topo", fallback: (c) => c.titleColor || "#ffffff" },
  { id: "headerName", label: "Nome da loja no topo", fallback: (c) => c.titleColor || c.textColor || "#123d2b" },
  { id: "footerName", label: "Nome da loja no rodapé", fallback: (c) => c.titleColor || c.textColor || "#123d2b" },
  { id: "tagline", label: "Lema", fallback: (c) => c.textColor || "#123d2b" },
  { id: "description", label: "Descrição", fallback: (c) => c.textColor || "#123d2b" },
  { id: "hours", label: "Horário", fallback: (c) => c.textColor || "#123d2b" },
  { id: "category", label: "Categoria dos produtos", fallback: (c) => c.brandColor || "#ff6b1a" },
  { id: "productName", label: "Nome dos produtos", fallback: (c) => c.textColor || "#123d2b" },
  { id: "productDesc", label: "Descrição dos produtos", fallback: (c) => c.textColor || "#123d2b" },
  { id: "price", label: "Preços", fallback: (c) => c.priceColor || c.brandColor || "#ff6b1a" },
  { id: "orderTitle", label: "Título do pedido", fallback: (c) => c.textColor || "#123d2b" },
];

export const elementLabel = (id: string): string => ELEMENTS.find((item) => item.id === id)?.label ?? id;

/** Cor efetiva do elemento: override individual ou fallback global. */
export const elementColor = (company: PublicStore["company"], id: string): string =>
    company.elementColors?.[id] || ELEMENTS.find((item) => item.id === id)?.fallback(company) || "";
