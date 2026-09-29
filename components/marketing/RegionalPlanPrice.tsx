"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api/client";
import type { RegionalPrice } from "@/lib/international";

export default function RegionalPlanPrice({ planCode, fallback }: { planCode: string; fallback: string }) {
  const [price, setPrice] = useState<RegionalPrice | null>(null);
  useEffect(() => {
    let active = true;
    apiRequest<RegionalPrice>(`/pricing?plan=${encodeURIComponent(planCode)}`).then((result) => { if (active) setPrice(result); }).catch(() => undefined);
    return () => { active = false; };
  }, [planCode]);
  return <>{price?.formatted ?? fallback}</>;
}
