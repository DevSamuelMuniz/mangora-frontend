"use client";

import Link from "next/link";

export default function ErrorFallback({ error }: { error: Error & { digest?: string } }) {
  const reference = error.digest || "Não disponível";

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#fff8ea", color: "#123d2b", fontFamily: "Arial, sans-serif" }}>
      <section style={{ width: "100%", maxWidth: 480, padding: 32, border: "2px solid #123d2b", borderRadius: 24, background: "white", boxShadow: "7px 8px 0 #ffb21a" }}>
        <p style={{ margin: 0, color: "#c9460b", fontSize: 12, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase" }}>Mangora</p>
        <h1 style={{ margin: "12px 0", fontSize: 26 }}>Não foi possível carregar esta página</h1>
        <p style={{ color: "#597064", lineHeight: 1.6 }}>Tente carregar novamente. Se o problema continuar, envie este código ao suporte para localizarmos o erro:</p>
        <p role="status" style={{ overflowWrap: "anywhere", padding: 12, borderRadius: 10, background: "#f1f5f2", fontFamily: "monospace", fontSize: 14 }}>{reference}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 20 }}>
          <button type="button" onClick={() => window.location.reload()} style={{ border: 0, borderRadius: 10, padding: "12px 18px", background: "#ff6b1a", color: "white", fontWeight: 700, cursor: "pointer" }}>Tentar novamente</button>
          <Link href="/" style={{ alignSelf: "center", color: "#147a45", fontWeight: 700 }}>Voltar ao início</Link>
        </div>
      </section>
    </main>
  );
}
