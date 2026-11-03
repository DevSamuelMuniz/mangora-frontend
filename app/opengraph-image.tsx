import { ImageResponse } from "next/og";

export const alt = "Mangora — gestão de vendas, estoque e financeiro";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "#fff8ea", color: "#123d2b", borderBottom: "24px solid #ff6b1a" }}><div style={{ display: "flex", fontSize: 112, fontWeight: 800, letterSpacing: -5 }}>Mangora<span style={{ color: "#ff6b1a" }}>.</span></div><div style={{ display: "flex", marginTop: 28, fontSize: 44 }}>Vendas · Estoque · Financeiro</div><div style={{ display: "flex", marginTop: 48, fontSize: 28, color: "#147a45" }}>www.mangora.com.br</div></div>, size);
}
