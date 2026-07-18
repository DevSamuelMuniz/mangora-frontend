export type DemoCustomer = {
  id: number;
  name: string;
  document: string;
  type: "Pessoa física" | "Pessoa jurídica";
  email: string;
  phone: string;
  city: string;
  lastPurchase: string;
  totalSpent: number;
  status: "Ativo" | "Inativo";
};

// Mantido temporariamente para Nova Venda até esse módulo ser conectado à API.
export const initialCustomers: DemoCustomer[] = [
  { id: 1, name: "Maria Santos", document: "123.456.789-10", type: "Pessoa física", email: "maria.santos@email.com", phone: "(81) 99911-2233", city: "Recife - PE", lastPurchase: "Hoje, 10:32", totalSpent: 1849.7, status: "Ativo" },
  { id: 2, name: "João Silva", document: "987.654.321-00", type: "Pessoa física", email: "joao.silva@email.com", phone: "(81) 98822-3344", city: "Olinda - PE", lastPurchase: "Ontem, 16:10", totalSpent: 742.5, status: "Ativo" },
  { id: 3, name: "Mercado Boa Compra Ltda.", document: "12.345.678/0001-90", type: "Pessoa jurídica", email: "compras@boacompra.com.br", phone: "(81) 3333-1212", city: "Recife - PE", lastPurchase: "15 de jul.", totalSpent: 8240, status: "Ativo" },
  { id: 4, name: "Ana Oliveira", document: "456.789.123-44", type: "Pessoa física", email: "ana.oliveira@email.com", phone: "(81) 97733-4455", city: "Jaboatão - PE", lastPurchase: "14 de jul.", totalSpent: 1312, status: "Ativo" },
  { id: 5, name: "Carlos Lima", document: "321.654.987-22", type: "Pessoa física", email: "carlos.lima@email.com", phone: "(81) 96644-5566", city: "Paulista - PE", lastPurchase: "10 de jul.", totalSpent: 480.9, status: "Inativo" },
  { id: 6, name: "Oficina Rota Norte", document: "23.456.789/0001-15", type: "Pessoa jurídica", email: "contato@rotanorte.com.br", phone: "(81) 3444-7788", city: "Olinda - PE", lastPurchase: "8 de jul.", totalSpent: 3980.4, status: "Ativo" },
];
