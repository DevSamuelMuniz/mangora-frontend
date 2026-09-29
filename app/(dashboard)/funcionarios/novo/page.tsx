<<<<<<< HEAD
import type { Metadata } from "next";

import NewEmployeeForm from "@/components/employees/NewEmployeeForm";

export const metadata: Metadata = {
  title: "Novo funcionário | Mangora",
  description: "Prepare o cadastro de um novo funcionário.",
};

export default function NewEmployeePage() {
  return <NewEmployeeForm />;
}
=======
import { redirect } from "next/navigation";
export default function NewEmployeePage() { redirect("/funcionarios?acao=novo"); }
>>>>>>> 0e59a660a5acf0b652a188ddf2e8ccc96de79e4d
