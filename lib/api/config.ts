/**
 * Fonte única da URL da API (lado servidor).
 *
 * Fase 6: antes resolvida em 4 arquivos diferentes com fallback `localhost`.
 * Aqui a variável é lida uma única vez; o fallback localhost serve apenas
 * para desenvolvimento local.
 *
 * Fase 7 (fail-fast): em produção, se a URL não estiver configurada, as
 * chamadas falham com erro claro em vez de proxy silencioso para localhost.
 */
export const API_BASE_URL = (
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:3001/api"
).replace(/\/$/, "");

export function isApiUrlConfigured(): boolean {
    // Durante `next build`/prerender (NEXT_PHASE definido) o layout roda
    // getCurrentSession sem cookie e redireciona — nenhuma chamada real à API
    // acontece, então o fail-fast não se aplica (apenas em runtime).
    if (process.env.NEXT_PHASE) return true;
    return !(process.env.NODE_ENV === "production" && API_BASE_URL.startsWith("http://localhost"));
}

/** Lança erro descritivo quando o backend não está configurado em produção. */
export function assertApiUrlConfigured(): void {
    if (!isApiUrlConfigured()) {
        throw new Error(
            "API_URL não configurada: em produção, defina API_URL (ou NEXT_PUBLIC_API_URL) apontando para o backend (ex.: https://mangorabackend.onrender.com/api).",
        );
    }
}
