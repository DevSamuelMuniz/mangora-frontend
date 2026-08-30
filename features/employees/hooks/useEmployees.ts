import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api/client";
import type { Employee, EmployeeRole } from "@/types/employee";

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
