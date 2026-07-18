import "server-only";

import { cookies } from "next/headers";
import type { AuthSession } from "./types";

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

export async function getCurrentSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("gestao_access_token");
  if (!accessToken) return null;

  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      cache: "no-store",
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
