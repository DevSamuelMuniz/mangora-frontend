import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { API_BASE_URL, assertApiUrlConfigured } from "./config";

export async function serverApiRequest<T>(path: string): Promise<T> {
  assertApiUrlConfigured();
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("gestao_access_token");
  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store",
    headers: accessToken ? { cookie: `${accessToken.name}=${accessToken.value}` } : {},
  });
  if (!response.ok) {
    if (response.status === 401) redirect("/login");
    const payload: unknown = await response.json().catch(() => null);
    const code = payload && typeof payload === "object" && "code" in payload && typeof payload.code === "string" ? payload.code : undefined;
    if (response.status === 403 && code === "SUBSCRIPTION_PAYMENT_REQUIRED") redirect("/assinatura");
    if (response.status === 403 && code === "ACCOUNT_SECURITY_REQUIRED") redirect("/seguranca-da-conta");
    console.error(JSON.stringify({ event: "server_api_request_failed", path: path.split("?", 1)[0], status: response.status, code }));
    throw new Error("Não foi possível carregar os indicadores.");
  }
  return response.json() as Promise<T>;
}
