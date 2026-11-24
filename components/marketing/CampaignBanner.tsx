import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import type { LandingConfig } from "@/lib/marketing";

export default function CampaignBanner({ config, compact = false, offer, period, cta }: {
  config: LandingConfig; compact?: boolean; offer: string; period: string; cta: string;
}) {
  return <aside className={`campaign-banner ${compact ? "campaign-banner--compact" : ""}`} aria-label={offer}>
    <div className="campaign-banner__label"><Sparkles aria-hidden="true" className="size-5" />{config.theme === "black-friday" ? "BLACK FRIDAY / MANGORA" : "MANGORA"}</div>
    <p><strong>{config.discountPercent}% OFF</strong><span>{offer}<br />{period}</span></p>
    <Link href="#planos">{cta}<ArrowUpRight aria-hidden="true" className="size-5" /></Link>
  </aside>;
}
