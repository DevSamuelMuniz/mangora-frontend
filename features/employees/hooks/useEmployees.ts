import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api/client";
import type { Employee, EmployeeRole } from "@/types/employee";
import type { EmployeeSalesRange, EmployeeSalesReport } from "@/types/employee-sales";

/**
 * Domínio de funcionários — hooks de estado de servidor.
 * Fase 5: listar, alternar ativação e mudar papel, com invalidação automática.
 */

export const employeesQueryKey = ["employees"] as const;

export function useEmployees() {
    return useQuery<Employee[], Error>({
        queryKey: employeesQueryKey,
        queryFn: () => apiRequest<Employee[]>("/employees"),
    });
}

export function useToggleEmployeeStatus() {
    const queryClient = useQueryClient();
    return useMutation<Employee, Error, { id: string; active: boolean }>({
        mutationFn: ({ id, active }) =>
            apiRequest<Employee>(`/employees/${id}/status`, { method: "PATCH", body: JSON.stringify({ active }) }),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: employeesQueryKey });
        },
    });
}

export function useUpdateEmployeeRole() {
    const queryClient = useQueryClient();
    return useMutation<Employee, Error, { id: string; role: EmployeeRole }>({
        mutationFn: ({ id, role }) =>
            apiRequest<Employee>(`/employees/${id}/role`, { method: "PATCH", body: JSON.stringify({ role }) }),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: employeesQueryKey });
        },
    });
}

export function useCreateEmployee() {
    const queryClient = useQueryClient();
    return useMutation<Employee, Error, Record<string, unknown>>({
        mutationFn: (payload) => apiRequest<Employee>("/employees", { method: "POST", body: JSON.stringify(payload) }),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: employeesQueryKey });
        },
    });
}

export function useUpdateEmployeeProfile() {
    const queryClient = useQueryClient();
    return useMutation<Employee, Error, { id: string; payload: Record<string, unknown> }>({
        mutationFn: ({ id, payload }) => apiRequest<Employee>(`/employees/${id}/profile`, { method: "PATCH", body: JSON.stringify(payload) }),
        onSuccess: () => { void queryClient.invalidateQueries({ queryKey: employeesQueryKey }); },
    });
}

/**
 * Vendas detalhadas de um funcionário (leitura — dono, administrador e gerente).
 * Sem `from`/`to` o backend devolve o mês corrente.
 */
export function useEmployeeSales(employeeId: string | null, range: EmployeeSalesRange = {}) {
    const search = new URLSearchParams();
    if (range.from) search.set("from", range.from);
    if (range.to) search.set("to", range.to);
    if (range.page && range.page > 1) search.set("page", String(range.page));
    const query = search.toString();

    return useQuery<EmployeeSalesReport, Error>({
        queryKey: ["employee-sales", employeeId, query],
        enabled: Boolean(employeeId),
        queryFn: () => apiRequest<EmployeeSalesReport>(`/employees/${employeeId}/sales${query ? `?${query}` : ""}`),
    });
}
