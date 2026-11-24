"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api/client";
import type { RegionalPrice } from "@/lib/international";
import { useT } from "@/i18n/provider";

export default function RegionalPlanPrice({ planCode, fallback, promotion }: { planCode: string; fallback: string; promotion?: { percent: number; months: number } | null }) {
  const t = useT();
  const [price, setPrice] = useState<RegionalPrice | null>(null);
  useEffect(() => {
    let active = true;
    apiRequest<RegionalPrice>(`/pricing?plan=${encodeURIComponent(planCode)}`).then((result) => { if (active) setPrice(result); }).catch(() => undefined);
    return () => { active = false; };
  }, [planCode]);
  if (!promotion || planCode === "FREE") return <>{price?.formatted ?? fallback}</>;
  if (!price) return <span className="block text-base leading-6">{t("landing.campaign.unavailable")}</span>;
  const activeOffer = price.promotion;
  if (!activeOffer) return <>{price.formatted}</>;
  const discounted = new Intl.NumberFormat(price.locale, { style: "currency", currency: price.currency }).format(Math.round(price.amount * (100 - activeOffer.percent) / 100) / 100);
  return <span className="campaign-price"><del>{price.formatted}</del><span>{discounted}</span><small>{activeOffer.percent}% OFF · {t("landing.campaign.pricePeriod", { months: activeOffer.months })}</small><small>{t("landing.campaign.regular", { price: price.formatted })}</small></span>;
}
