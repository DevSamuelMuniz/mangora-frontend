import type { EmployeeRole } from "@/types/employee";

export const roleLabels: Record<EmployeeRole, string> = {
  OWNER: "Proprietário",
  ADMIN: "Administrador",
  MANAGER: "Gerente",
  CASHIER: "Operador de caixa",
  SELLER: "Vendedor",
  EMPLOYEE: "Funcionário",
};

export const rolePermissions: Record<EmployeeRole, string[]> = {
  OWNER: ["Acesso completo", "Gerenciar assinatura", "Gerenciar funcionários", "Visualizar financeiro", "Cancelar vendas", "Alterar estoque", "Consultar relatórios"],
  ADMIN: ["Gerenciar funcionários", "Visualizar financeiro", "Criar e cancelar vendas", "Alterar estoque", "Consultar relatórios", "Configurar empresa"],
  MANAGER: ["Visualizar financeiro", "Criar e cancelar vendas", "Aplicar descontos", "Alterar estoque", "Consultar relatórios"],
  CASHIER: ["Visualizar e criar vendas", "Abrir e fechar caixa", "Aplicar descontos autorizados", "Consultar produtos"],
  SELLER: ["Visualizar e criar vendas", "Cadastrar clientes", "Consultar produtos e estoque"],
  EMPLOYEE: ["Visualizar vendas", "Consultar produtos", "Consultar clientes"],
};
