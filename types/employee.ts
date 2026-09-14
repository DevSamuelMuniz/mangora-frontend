export type EmployeeRole = "OWNER" | "ADMIN" | "MANAGER" | "CASHIER" | "SELLER" | "EMPLOYEE";

export type Employee = {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string | null;
  role: EmployeeRole;
  active: boolean;
  jobTitle: string | null;
  employeeCode: string | null;
  startDate: string;
  birthDate: string | null;
  birthdayEmailEnabled: boolean;
  workAnniversaryEmailEnabled: boolean;
  notes: string | null;
  lastAccessAt: string | null;
  createdAt: string;
};
