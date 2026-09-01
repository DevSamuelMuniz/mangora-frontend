// Browser requests stay on the frontend origin. The server-side proxy forwards
// them to the API and makes the HttpOnly session cookie visible to Next.js.
const API_URL = "/api/backend";

type ApiErrorPayload = {
  message?: string | string[];
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });
  } catch {
    throw new ApiError("Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.", 0);
  }

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as ApiErrorPayload;
    const raw = Array.isArray(payload.message) ? payload.message.join(" ") : payload.message;
    throw new ApiError(describeError(response.status, raw), response.status);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

/** Converte status HTTP + mensagem crua em uma mensagem amigável e acionável. */
function describeError(status: number, raw?: string): string {
  if (raw) return raw;
  switch (status) {
    case 400:
      return "Os dados enviados são inválidos. Confira os campos e tente novamente.";
    case 401:
      return "Sua sessão expirou ou você não tem permissão. Faça login novamente.";
    case 402:
      return "Seu período gratuito terminou. Assine um plano para continuar usando a Mangora.";
    case 403:
      return "Você não tem permissão para realizar esta ação.";
    case 404:
      return "O recurso solicitado não foi encontrado.";
    case 409:
      return "Esta operação conflita com o estado atual dos dados.";
    case 422:
      return "Não foi possível processar os dados enviados.";
    case 429:
      return "Muitas tentativas. Aguarde alguns instantes e tente novamente.";
    default:
      return status >= 500
        ? "Erro interno do servidor. Tente novamente em instantes."
        : `Não foi possível concluir a operação (HTTP ${status}).`;
  }
}
