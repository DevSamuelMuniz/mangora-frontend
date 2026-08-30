import "server-only";

import { cookies } from "next/headers";
import { API_BASE_URL, assertApiUrlConfigured } from "./config";

export async function serverApiRequest<T>(path: string): Promise<T> {
  assertApiUrlConfigured();
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("gestao_access_token");
  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store",
    headers: accessToken ? { cookie: `${accessToken.name}=${accessToken.value}` } : {},
  });
  if (!response.ok) throw new Error("Não foi possível carregar os indicadores.");
  return response.json() as Promise<T>;
}
