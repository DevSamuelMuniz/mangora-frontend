type DemoFinancialEntry = { id: string; description: string; type: string; category: string; amount: number; dueDate: string; status: string; account: string; contact: string };

export const initialFinancialEntries: DemoFinancialEntry[] = [
  { id: "FIN-2048", description: "Venda #1024", type: "Receita", category: "Vendas", amount: 189.9, dueDate: "2026-07-17", status: "Pago", account: "Conta principal", contact: "Maria Santos" },
  { id: "FIN-2047", description: "Venda #1022", type: "Receita", category: "Vendas", amount: 312, dueDate: "2026-07-17", status: "Pago", account: "Conta principal", contact: "Ana Oliveira" },
  { id: "FIN-2046", description: "Fornecedor de mercadorias", type: "Despesa", category: "Fornecedores", amount: 1850, dueDate: "2026-07-18", status: "Pendente", account: "Conta principal", contact: "Distribuidora Nordeste" },
  { id: "FIN-2045", description: "Aluguel da unidade", type: "Despesa", category: "Despesas fixas", amount: 2400, dueDate: "2026-07-10", status: "Pago", account: "Conta principal", contact: "Imobiliária Centro" },
  { id: "FIN-2044", description: "Venda corporativa #1019", type: "Receita", category: "Vendas", amount: 480, dueDate: "2026-07-20", status: "Pendente", account: "Conta principal", contact: "Mercado Boa Compra Ltda." },
  { id: "FIN-2043", description: "Energia elétrica", type: "Despesa", category: "Utilidades", amount: 684.7, dueDate: "2026-07-15", status: "Vencido", account: "Conta principal", contact: "Companhia de Energia" },
  { id: "FIN-2042", description: "Venda #1018", type: "Receita", category: "Vendas", amount: 269.8, dueDate: "2026-07-16", status: "Pago", account: "Caixa", contact: "Fernanda Costa" },
  { id: "FIN-2041", description: "Internet empresarial", type: "Despesa", category: "Utilidades", amount: 189.9, dueDate: "2026-07-22", status: "Pendente", account: "Conta principal", contact: "Conecta Telecom" },
  { id: "FIN-2040", description: "Serviço de manutenção", type: "Despesa", category: "Manutenção", amount: 350, dueDate: "2026-07-12", status: "Pago", account: "Caixa", contact: "Oficina Rota Norte" },
  { id: "FIN-2039", description: "Venda #1017", type: "Receita", category: "Vendas", amount: 399.8, dueDate: "2026-07-15", status: "Pago", account: "Conta principal", contact: "Studio Bella" },
  { id: "FIN-2038", description: "Impostos mensais", type: "Despesa", category: "Impostos", amount: 980, dueDate: "2026-07-25", status: "Pendente", account: "Conta principal", contact: "Receita Federal" },
  { id: "FIN-2037", description: "Venda #1016", type: "Receita", category: "Vendas", amount: 99.9, dueDate: "2026-07-15", status: "Pago", account: "Caixa", contact: "Rafael Souza" },
  { id: "FIN-2036", description: "Material de escritório", type: "Despesa", category: "Administrativo", amount: 245.5, dueDate: "2026-07-14", status: "Vencido", account: "Conta principal", contact: "Papelaria Central" },
  { id: "FIN-2035", description: "Venda corporativa #1013", type: "Receita", category: "Serviços", amount: 600, dueDate: "2026-07-13", status: "Pago", account: "Conta principal", contact: "Academia Movimento" },
];

export const cashFlowData = [
  { month: "Fev", income: 58, expense: 42 },
  { month: "Mar", income: 72, expense: 48 },
  { month: "Abr", income: 64, expense: 45 },
  { month: "Mai", income: 82, expense: 55 },
  { month: "Jun", income: 76, expense: 52 },
  { month: "Jul", income: 92, expense: 61 },
];

export const incomeCategories = ["Vendas", "Serviços", "Recebimentos", "Comissões", "Outras receitas"];
export const expenseCategories = ["Fornecedores", "Despesas fixas", "Utilidades", "Manutenção", "Impostos", "Administrativo", "Outras despesas"];
