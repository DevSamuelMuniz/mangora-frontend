export const productCategories = [
  "Acessórios",
  "Calçados",
  "Eletrônicos",
  "Roupas",
  "Serviços",
] as const;

export type DemoProduct = {
  id: number;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  minimumStock: number;
  status: "Ativo" | "Inativo";
};

// Mantido temporariamente para Vendas e Estoque até esses módulos serem ligados à API.
export const initialProducts: DemoProduct[] = [
  { id: 1, name: "Camiseta básica preta", sku: "CAM-001", category: "Roupas", price: 59.9, stock: 3, minimumStock: 10, status: "Ativo" },
  { id: 2, name: "Calça jeans masculina", sku: "CAL-012", category: "Roupas", price: 149.9, stock: 18, minimumStock: 8, status: "Ativo" },
  { id: 3, name: "Tênis esportivo branco", sku: "TEN-021", category: "Calçados", price: 219.9, stock: 5, minimumStock: 12, status: "Ativo" },
  { id: 4, name: "Boné clássico", sku: "BON-004", category: "Acessórios", price: 44.9, stock: 1, minimumStock: 6, status: "Ativo" },
  { id: 5, name: "Mochila urbana", sku: "MOC-008", category: "Acessórios", price: 179.9, stock: 14, minimumStock: 5, status: "Ativo" },
  { id: 6, name: "Fone Bluetooth", sku: "FON-032", category: "Eletrônicos", price: 129.9, stock: 0, minimumStock: 4, status: "Inativo" },
  { id: 7, name: "Jaqueta corta-vento", sku: "JAQ-017", category: "Roupas", price: 199.9, stock: 9, minimumStock: 5, status: "Ativo" },
  { id: 8, name: "Relógio digital", sku: "REL-014", category: "Acessórios", price: 99.9, stock: 11, minimumStock: 4, status: "Ativo" },
  { id: 9, name: "Sandália casual", sku: "SAN-009", category: "Calçados", price: 89.9, stock: 0, minimumStock: 6, status: "Inativo" },
  { id: 10, name: "Configuração de equipamento", sku: "SER-003", category: "Serviços", price: 120, stock: 0, minimumStock: 0, status: "Ativo" },
  { id: 11, name: "Camisa social azul", sku: "CAM-026", category: "Roupas", price: 119.9, stock: 22, minimumStock: 8, status: "Ativo" },
  { id: 12, name: "Carregador USB-C", sku: "CAR-041", category: "Eletrônicos", price: 69.9, stock: 7, minimumStock: 5, status: "Ativo" },
];
