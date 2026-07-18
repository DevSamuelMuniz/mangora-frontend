import "server-only";

import { cookies } from "next/headers";

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

export async function serverApiRequest<T>(path: string): Promise<T> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("gestao_access_token");
  const response = await fetch(`${API_URL}${path}`, {
    cache: "no-store",
    headers: accessToken ? { cookie: `${accessToken.name}=${accessToken.value}` } : {},
  });
  if (!response.ok) throw new Error("Não foi possível carregar os indicadores.");
  return response.json() as Promise<T>;
}
