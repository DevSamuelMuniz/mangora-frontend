import type { Metadata } from "next";

import EmployeeManagement from "@/components/employees/EmployeeManagement";

export const metadata: Metadata = {
  title: "Funcionários | Mangora",
  description: "Gerencie a equipe e os papéis de acesso.",
};

export default function EmployeesPage() {
  return <EmployeeManagement />;
}
