"use client";

import ErrorFallback from "@/components/errors/ErrorFallback";

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0 }}>
        <ErrorFallback error={error} />
      </body>
    </html>
  );
}
