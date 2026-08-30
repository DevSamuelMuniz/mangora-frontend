import "server-only";

import { cookies } from "next/headers";
import type { AuthSession } from "./types";
import { API_BASE_URL, assertApiUrlConfigured } from "@/lib/api/config";

export async function getCurrentSession(): Promise<AuthSession | null> {
  assertApiUrlConfigured();
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("gestao_access_token");
  if (!accessToken) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5_000),
      headers: {
        cookie: `${accessToken.name}=${accessToken.value}`,
      },
    });

    if (!response.ok) return null;
    return (await response.json()) as AuthSession;
  } catch {
    return null;
  }
}
