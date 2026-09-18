import { NextResponse } from "next/server";

import { getGeoLocation } from "@/i18n/server";
import { localeLabels, type Locale } from "@/i18n/config";

/**
 * Sugestão regional derivada do IP (sem API externa, sem permissão do navegador).
 *
 * Uso: pré-preencher país, moeda e fuso em Configurações → Preferências regionais
 * e mostrar "Detectamos que você está em Portugal" sem nunca sobrescrever a escolha
 * já salva pelo usuário. `country: null` significa "não foi possível detectar".
 */
export async function GET() {
  const geo = await getGeoLocation();
  return NextResponse.json(
    {
      country: geo.country,
      region: geo.region,
      timezone: geo.timezone,
      currency: geo.currency,
      locale: geo.locale,
      localeLabel: geo.locale ? localeLabels[geo.locale as Locale]?.label ?? null : null,
      detected: geo.country !== null,
    },
    {
      headers: {
        // A resposta depende apenas do IP do solicitante: não cachear em CDN.
        "cache-control": "private, no-store",
        vary: "x-vercel-ip-country, cf-ipcountry",
      },
    },
  );
}
