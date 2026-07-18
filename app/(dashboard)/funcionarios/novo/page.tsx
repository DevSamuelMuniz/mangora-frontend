import type { Metadata } from "next";

import NewEmployeeForm from "@/components/employees/NewEmployeeForm";

export const metadata: Metadata = {
  title: "Novo funcionário | Gestão+",
  description: "Prepare o cadastro de um novo funcionário.",
};

export default function NewEmployeePage() {
  return <NewEmployeeForm />;
}
