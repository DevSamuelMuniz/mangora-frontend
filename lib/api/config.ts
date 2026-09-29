/** URL da API hospedada no Render, usada somente no servidor/proxy. */
export const API_BASE_URL = (
    process.env.API_URL?.trim() || process.env.NEXT_PUBLIC_API_URL?.trim() || ""
).replace(/\/$/, "");

export function isApiUrlConfigured(): boolean {
    try {
        const url = new URL(API_BASE_URL);
        return url.protocol === "https:" && !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    } catch {
        return false;
    }
}

export function assertApiUrlConfigured(): void {
    if (!isApiUrlConfigured()) {
        throw new Error("API_URL não configurada: defina a URL HTTPS do backend no Render (ex.: https://api.mangora.com.br/api).");
    }
}
