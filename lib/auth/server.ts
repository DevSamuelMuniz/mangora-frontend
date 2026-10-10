import "server-only";

import { cookies } from "next/headers";
import type { AuthSession } from "./types";
import { API_BASE_URL, assertApiUrlConfigured } from "@/lib/api/config";

export async function getCurrentSession(): Promise<AuthSession | null> {
  let stage = "api_configuration";
  try {
    assertApiUrlConfigured();
    stage = "read_cookie";
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("gestao_access_token");
    if (!accessToken) return null;

    stage = "request_session";
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5_000),
      headers: {
        cookie: `${accessToken.name}=${accessToken.value}`,
      },
    });

    if (response.status === 401 || response.status === 403) return null;
    if (!response.ok) {
      console.error(JSON.stringify({ event: "auth_session_lookup_failed", stage, status: response.status }));
      return null;
    }

    stage = "parse_session";
    const payload: unknown = await response.json();
    if (!isAuthSessionPayload(payload)) {
      console.error(JSON.stringify({ event: "auth_session_invalid_payload", stage }));
      return null;
    }
    return payload;
  } catch (error) {
    console.error(JSON.stringify({
      event: "auth_session_lookup_failed",
      stage,
      errorName: error instanceof Error ? error.name : "UnknownError",
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    }));
    return null;
  }
}

function isAuthSessionPayload(value: unknown): value is AuthSession {
  if (!value || typeof value !== "object") return false;
  const session = value as Partial<AuthSession>;
  return !!session.user && typeof session.user === "object"
    && typeof session.user.id === "string"
    && !!session.membership && typeof session.membership === "object"
    && typeof session.membership.role === "string"
    && !!session.company && typeof session.company === "object"
    && !!session.security && typeof session.security === "object"
    && typeof session.security.nextStep !== "undefined";
}
