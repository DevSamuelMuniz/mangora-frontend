import { useMutation } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api/client";

/**
 * Domínio da loja pública — hook de estado de servidor.
 * Fase 5: criação de pedido público (sem autenticação) com reserva de estoque.
 */

export type PublicOrderConfirmation = {
    code: string;
    total: number;
    scheduledAt: string;
};

export function useCreatePublicOrder() {
    return useMutation<PublicOrderConfirmation, Error, { slug: string; payload: Record<string, unknown> }>({
        mutationFn: ({ slug, payload }) =>
            apiRequest<PublicOrderConfirmation>(`/public/stores/${slug}/orders`, {
                method: "POST",
                body: JSON.stringify(payload),
            }),
    });
}
