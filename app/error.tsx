"use client";

import ErrorFallback from "@/components/errors/ErrorFallback";

export default function ErrorPage({ error }: { error: Error & { digest?: string } }) {
  return <ErrorFallback error={error} />;
}
