import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    localPatterns: [
      { pathname: "/**", search: "" },
      { pathname: "/mascots/**", search: "?v=transparent-20260906" },
    ],
  },
  async headers() {
    const isDevelopment = process.env.NODE_ENV !== "production";
    // Vercel Toolbar resources: https://vercel.com/docs/vercel-toolbar/managing-toolbar#using-a-content-security-policy
    const contentSecurityPolicy = [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://vercel.live${isDevelopment ? " 'unsafe-eval'" : ""}`,
      "style-src 'self' 'unsafe-inline' https://vercel.live",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https://vercel.live https://assets.vercel.com",
      "connect-src 'self' https://api.mangora.com.br https://www.google-analytics.com https://region1.google-analytics.com https://vercel.live wss://ws-us3.pusher.com",
      "frame-src 'self' https://vercel.live",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join("; ");

    return [{
      source: "/:path*",
      headers: [
        { key: "Content-Security-Policy", value: contentSecurityPolicy },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
        { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
        ...(isDevelopment ? [] : [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" }]),
      ],
    }];
  },
};

export default nextConfig;
