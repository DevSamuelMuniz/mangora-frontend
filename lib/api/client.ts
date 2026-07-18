const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

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
    throw new ApiError("Não foi possível conectar ao servidor.", 0);
  }

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as ApiErrorPayload;
    const message = Array.isArray(payload.message)
      ? payload.message.join(" ")
      : payload.message;
    throw new ApiError(message || "Não foi possível concluir a operação.", response.status);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
