type DemoSale = {
  id: string;
  customer: string;
  date: string;
  time: string;
  total: number;
  paymentMethod: string;
  status: string;
  items: { productName: string; quantity: number; unitPrice: number }[];
};

export const initialSales: DemoSale[] = [
  { id: "#1024", customer: "Maria Santos", date: "2026-07-17", time: "10:32", total: 189.9, paymentMethod: "PIX", status: "Concluída", items: [{ productName: "Camiseta básica preta", quantity: 1, unitPrice: 59.9 }, { productName: "Fone Bluetooth", quantity: 1, unitPrice: 130 }] },
  { id: "#1023", customer: "João Silva", date: "2026-07-17", time: "10:08", total: 74.5, paymentMethod: "Dinheiro", status: "Pendente", items: [{ productName: "Boné clássico", quantity: 1, unitPrice: 44.9 }, { productName: "Camiseta básica preta", quantity: 1, unitPrice: 29.6 }] },
  { id: "#1022", customer: "Ana Oliveira", date: "2026-07-17", time: "09:45", total: 312, paymentMethod: "Cartão de crédito", status: "Concluída", items: [{ productName: "Tênis esportivo branco", quantity: 1, unitPrice: 219.9 }, { productName: "Sandália casual", quantity: 1, unitPrice: 92.1 }] },
  { id: "#1021", customer: "Carlos Lima", date: "2026-07-17", time: "09:12", total: 48, paymentMethod: "PIX", status: "Cancelada", items: [{ productName: "Boné clássico", quantity: 1, unitPrice: 48 }] },
  { id: "#1020", customer: "Consumidor final", date: "2026-07-16", time: "17:40", total: 129.9, paymentMethod: "Cartão de débito", status: "Concluída", items: [{ productName: "Fone Bluetooth", quantity: 1, unitPrice: 129.9 }] },
  { id: "#1019", customer: "Mercado Boa Compra Ltda.", date: "2026-07-16", time: "16:18", total: 480, paymentMethod: "Boleto", status: "Pendente", items: [{ productName: "Configuração de equipamento", quantity: 4, unitPrice: 120 }] },
  { id: "#1018", customer: "Fernanda Costa", date: "2026-07-16", time: "14:55", total: 269.8, paymentMethod: "PIX", status: "Concluída", items: [{ productName: "Calça jeans masculina", quantity: 1, unitPrice: 149.9 }, { productName: "Camisa social azul", quantity: 1, unitPrice: 119.9 }] },
  { id: "#1017", customer: "Studio Bella", date: "2026-07-15", time: "11:24", total: 399.8, paymentMethod: "Cartão de crédito", status: "Concluída", items: [{ productName: "Jaqueta corta-vento", quantity: 2, unitPrice: 199.9 }] },
  { id: "#1016", customer: "Rafael Souza", date: "2026-07-15", time: "10:02", total: 99.9, paymentMethod: "Dinheiro", status: "Concluída", items: [{ productName: "Relógio digital", quantity: 1, unitPrice: 99.9 }] },
  { id: "#1015", customer: "Oficina Rota Norte", date: "2026-07-14", time: "15:36", total: 359.8, paymentMethod: "Boleto", status: "Pendente", items: [{ productName: "Mochila urbana", quantity: 2, unitPrice: 179.9 }] },
  { id: "#1014", customer: "Beatriz Almeida", date: "2026-07-14", time: "13:20", total: 219.9, paymentMethod: "Cartão de débito", status: "Concluída", items: [{ productName: "Tênis esportivo branco", quantity: 1, unitPrice: 219.9 }] },
  { id: "#1013", customer: "Academia Movimento", date: "2026-07-13", time: "09:48", total: 600, paymentMethod: "PIX", status: "Concluída", items: [{ productName: "Configuração de equipamento", quantity: 5, unitPrice: 120 }] },
];
