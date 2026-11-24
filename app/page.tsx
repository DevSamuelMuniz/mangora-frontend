import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  BarChart3,
  Boxes,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  PackageCheck,
  ReceiptText,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Users,
  Utensils,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { getTranslator } from "@/i18n/server";
import { localePath } from "@/i18n/urls";
import { publicMetadata, landingFaq } from "@/lib/seo";
import BrandLogo from "@/components/brand/BrandLogo";
import MascotPose from "@/components/brand/MascotPose";
import { marketingPlans } from "@/lib/plans";
import { brazilDateKey } from "@/lib/timezone";
import { buildBrandGraph } from "@/lib/brand";
import ConversionTracking from "@/components/marketing/ConversionTracking";
import ProductWalkthrough from "@/components/marketing/ProductWalkthrough";
import MarketSelector from "@/components/marketing/MarketSelector";
import { API_BASE_URL } from "@/lib/api/config";
import type { LandingConfig } from "@/lib/marketing";
import CampaignBanner from "@/components/marketing/CampaignBanner";
import RegionalPlanPrice from "@/components/marketing/RegionalPlanPrice";

export async function generateMetadata(): Promise<Metadata> {
  const { t, locale } = await getTranslator();
  const title = t("landing.meta.title");
  const description = t("landing.meta.description");
  return publicMetadata("/", locale, title, description);
}

function buildResources(t: (key: string) => string) {
  return [
  {
    icon: ShoppingBag,
    label: t("landing.features.items.sales.label"),
    title: t("landing.features.items.sales.title"),
    description:
      t("landing.features.items.sales.copy"),
  },
  {
    icon: Boxes,
    label: t("landing.features.items.stock.label"),
    title: t("landing.features.items.stock.title"),
    description:
      t("landing.features.items.stock.copy"),
  },
  {
    icon: CircleDollarSign,
    label: t("landing.features.items.finance.label"),
    title: t("landing.features.items.finance.title"),
    description:
      t("landing.features.items.finance.copy"),
  },
  {
    icon: Users,
    label: t("landing.features.items.relationship.label"),
    title: t("landing.features.items.relationship.title"),
    description:
      t("landing.features.items.relationship.copy"),
  },
];
}

function buildSegments(t: (key: string) => string) {
  return [
    [Store, t("landing.segments.stores")],
    [Utensils, t("landing.segments.restaurants")],
    [Sparkles, t("landing.segments.salons")],
    [Wrench, t("landing.segments.technical")],
    [Building2, t("landing.segments.services")],
  ] as const;
}

export default async function Home() {
  const { t, locale } = await getTranslator();
  const campaign: LandingConfig | null = await fetch(`${API_BASE_URL}/marketing/landing`, { cache: "no-store", signal: AbortSignal.timeout(5000) })
    .then(response => response.ok ? response.json() as Promise<LandingConfig> : null).catch(() => null);
  const blackFriday = campaign?.theme === "black-friday";
  const offerActive = !!campaign?.promotionActive;
  const banner = campaign && offerActive ? <CampaignBanner config={campaign} offer={t("landing.campaign.offer")} period={t("landing.campaign.period", { months: campaign.discountMonths })} cta={t("landing.campaign.cta")} /> : null;
  const faq = landingFaq(t);
  const brandGraph = buildBrandGraph(locale, t("landing.meta.description"), faq);
  return (
    <main data-layout={campaign?.theme ?? "standard"} className={`mangora-landing landing-layout-${campaign?.theme ?? "standard"} ${blackFriday ? "landing-black-friday" : ""} min-h-screen overflow-hidden bg-[var(--lp-background)] font-[family-name:var(--font-manrope)] text-[var(--lp-ink)]`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(brandGraph).replace(/</g, "\\u003c") }} />
      <Header t={t} blackFriday={blackFriday} />
      <ConversionTracking />

      <section id="inicio" className="relative isolate pt-24 sm:pt-28 lg:pt-28">
        <div className="absolute inset-x-0 top-0 -z-20 h-[780px] bg-[radial-gradient(circle_at_78%_26%,rgba(255,178,26,0.32),transparent_31%),radial-gradient(circle_at_10%_30%,rgba(255,107,26,0.13),transparent_28%)]" />
        <div className="absolute left-[7%] top-36 -z-10 size-3 rounded-full bg-[#ffb21a] sm:size-4" />
        <div className="absolute right-[8%] top-44 -z-10 size-5 rotate-12 rounded-sm bg-[#147a45]/20" />

        <div className="hero-layout mx-auto grid max-w-[1380px] items-center gap-12 px-5 pb-20 sm:px-8 lg:grid-cols-[0.88fr_1.12fr] lg:gap-8 lg:px-10 lg:pb-28">
          <div className="relative z-10 max-w-2xl">
            <p className="inline-flex -rotate-1 items-center gap-2 rounded-full border-2 border-[var(--lp-line)] bg-[var(--lp-surface)] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--lp-eyebrow)] shadow-[3px_3px_0_#ffb21a] sm:text-sm">
              <span className="size-2 rounded-full bg-[#ff6b1a]" />
              {blackFriday ? "BLACK FRIDAY / MANGORA" : t("landing.hero.eyebrow")}
            </p>

            <h1 className="mt-6 max-w-[760px] text-balance font-[family-name:var(--font-bricolage)] text-[clamp(2.5rem,4.8vw,4.5rem)] font-extrabold leading-[1.04] tracking-[-0.045em] text-[var(--lp-ink)]">
              {campaign ? campaign.headline : t("landing.hero.titleLine1")}
              <span className="relative mt-2 block w-fit text-[#ff6b1a]">
                {campaign ? null : t("landing.hero.titleLine2")}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 460 22"
                  className="absolute -bottom-4 left-0 w-full text-[#ffb21a]"
                >
                  <path
                    d="M4 14C125 3 312 4 456 11"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="11"
                  />
                </svg>
              </span>
            </h1>

            <p className="mt-8 max-w-xl text-lg font-medium leading-8 text-[var(--lp-muted)] sm:text-xl">
              {campaign ? campaign.description : t("landing.hero.copy")}
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/cadastro"
                className="lp-orange-ink group inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-[#ff6b1a] px-7 font-extrabold text-white shadow-[0_8px_0_#c9460b] transition hover:-translate-y-1 hover:shadow-[0_12px_0_#c9460b] focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#ffb21a]"
              >
                {campaign ? campaign.ctaLabel : t("landing.hero.ctaTrial")}
                <ArrowRight className="size-5 transition group-hover:translate-x-1" />
              </Link>
              <Link
                href="#por-dentro"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl px-6 font-extrabold text-[var(--lp-ink)] transition hover:bg-[var(--lp-surface)]"
              >
                {t("landing.hero.ctaDemo")}
                <ChevronRight className="size-5" />
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-[var(--lp-muted)]">
              <Benefit>{t("landing.hero.noCard")}</Benefit>
              <Benefit>{t("landing.hero.noAutoCharge")}</Benefit>
            </div>
            <p className="mt-4 max-w-lg text-sm leading-6 text-[var(--lp-muted)]">Experimente por 7 dias. Depois, sua conta continua no Free; assine um plano se precisar de mais recursos.</p>
          </div>

          {blackFriday && offerActive && campaign ? <div className="bf-ticket">
            <div className="bf-ticket__top"><span>BLACK FRIDAY</span><span>MANGORA</span></div>
            <div className="bf-ticket__amount"><strong>{campaign.discountPercent}</strong><span>%<br />OFF</span></div>
            <p className="bf-ticket__period">{t("landing.campaign.period", { months: campaign.discountMonths })}</p>
            <p className="bf-ticket__plans">{t("landing.campaign.offer")}</p>
            <div className="bf-ticket__bottom"><span>PDV + ESTOQUE + FINANCEIRO</span><ArrowRight aria-hidden="true" /></div>
          </div> : campaign?.theme === "editorial" ? <EditorialHero t={t} /> : <HeroCounter t={t} />}
        </div>

        <div className="border-y border-[var(--lp-line)] bg-[var(--lp-surface)]/65">
          <div className="mx-auto flex max-w-[1380px] flex-col gap-5 px-5 py-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
            <p className="max-w-sm font-[family-name:var(--font-bricolage)] text-lg font-bold leading-tight text-[var(--lp-ink)]">
              {t("landing.features.systemLine")}
            </p>
            <div className="flex flex-wrap gap-2">
              {[t("landing.features.tabs.sales"), t("landing.features.tabs.stock"), t("landing.features.tabs.finance"), t("landing.features.tabs.customers"), t("landing.features.tabs.reports")].map(
                (item) => (
                  <span
                    key={item}
                    className="rounded-full border border-[var(--lp-line)] bg-[var(--lp-surface)] px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-[var(--lp-muted)]"
                  >
                    {item}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      {campaign?.theme !== "editorial" && <ProductWalkthrough />}

      {banner}
      <section id="recursos" className="bg-[var(--lp-surface)] py-16 sm:py-24">
        <div className="mx-auto max-w-[1380px] px-5 sm:px-8 lg:px-10">
          <SectionHeading
            tag={t("landing.features.tag")}
            title={t("landing.features.title")}
            copy={t("landing.features.copy")}
          />

          <div className="mt-14 grid items-stretch gap-4 lg:grid-cols-12">
            {buildResources(t).map((resource, index) => (
              <ResourceCard key={resource.title} resource={resource} index={index} />
            ))}

            <article className="relative min-h-[340px] overflow-hidden rounded-[2.25rem] bg-[#123d2b] p-7 text-white lg:col-span-5 lg:p-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_35%,rgba(255,178,26,0.18),transparent_28%)]" />
              <div className="relative z-10 max-w-md">
                <span className="inline-flex items-center gap-2 rounded-full bg-[var(--lp-surface)]/10 px-3 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[#ffd56a]">
                  <Zap className="size-4" /> {t("landing.benefits.autoUpdate")}
                </span>
                <h3 className="mt-6 font-[family-name:var(--font-bricolage)] text-4xl font-bold leading-[1.02] tracking-[-0.04em]">
                  {t("landing.benefits.title")}
                </h3>
                <p className="mt-5 leading-7 text-white/70">
                  {t("landing.benefits.copy")}
                </p>
              </div>

            </article>

            <div className="relative -mt-20 ml-auto w-[72%] max-w-72 self-end lg:col-span-3 lg:mt-0 lg:w-full lg:max-w-none lg:self-center">
              <div className="absolute inset-x-6 bottom-4 h-20 rounded-full bg-[#ffb21a]/20 blur-2xl" />
              <MascotPose
                pose="work"
                label={t("landing.features.items.sales.imageLabel")}
                className="relative drop-shadow-[0_24px_24px_rgba(18,61,43,0.2)]"
              />
            </div>
          </div>
        </div>
      </section>

      {campaign?.theme === "editorial" && <ProductWalkthrough />}
      <section id="como-funciona" className="relative py-24 sm:py-32">
        <div className="absolute inset-x-0 top-1/2 h-px bg-[#123d2b]/10" />
        <div className="relative mx-auto grid max-w-[1380px] gap-12 px-5 sm:px-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-center lg:px-10">
          <div className="relative mx-auto w-full max-w-sm lg:mx-0">
            <div className="absolute inset-10 rounded-full bg-[#ffb21a]/25 blur-3xl" />
            <MascotPose
              pose="point"
              label={t("landing.steps.imageLabel")}
              className="relative drop-shadow-[0_24px_22px_rgba(18,61,43,0.18)]"
            />
            <span className="absolute -bottom-2 right-0 rotate-3 rounded-2xl bg-[#ffb21a] px-5 py-3 font-[family-name:var(--font-bricolage)] text-lg font-extrabold text-[#123d2b] shadow-[4px_4px_0_#123d2b]">
              {t("landing.steps.badge")}
            </span>
          </div>

          <div>
            <SectionHeading
              tag={t("landing.steps.tag")}
              title={t("landing.steps.title")}
              copy={t("landing.steps.copy")}
              align="left"
            />

            <ol className="mt-12 space-y-4">
              <JourneyStep
                number="1"
                title={t("landing.steps.setup.title")}
                copy={t("landing.steps.setup.copy")}
              />
              <JourneyStep
                number="2"
                title={t("landing.steps.register.title")}
                copy={t("landing.steps.register.copy")}
              />
              <JourneyStep
                number="3"
                title={t("landing.steps.decide.title")}
                copy={t("landing.steps.decide.copy")}
              />
            </ol>
          </div>
        </div>
      </section>

      <section id="segmentos" className="bg-[#ffb21a] py-20 sm:py-24">
        <div className="mx-auto max-w-[1380px] px-5 sm:px-8 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--lp-ink)]/70">
                {t("landing.segments.eyebrow")}
              </p>
              <h2 className="mt-4 max-w-xl font-[family-name:var(--font-bricolage)] text-4xl font-extrabold leading-[0.98] tracking-[-0.045em] text-[var(--lp-ink)] sm:text-6xl">
                {t("landing.segments.title")}
              </h2>
            </div>
            <p className="max-w-xl text-lg font-semibold leading-8 text-[#31523f] lg:justify-self-end">
              {t("landing.segments.copy")}
            </p>
          </div>

          <div className="mt-12 flex flex-wrap gap-3">
            {buildSegments(t).map(([Icon, label], index) => (
              <div
                key={label}
                className={`flex items-center gap-3 rounded-2xl border-2 border-[#123d2b] px-5 py-4 font-extrabold shadow-[4px_4px_0_#123d2b] ${
                  index === 2
                    ? "bg-[#147a45] text-white"
                    : "bg-[var(--lp-background)] text-[var(--lp-ink)]"
                }`}
              >
                <Icon className="size-5" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {banner}
      <section id="planos" className="bg-[var(--lp-surface)] py-24 sm:py-32">
        <div className="mx-auto max-w-[1380px] px-5 sm:px-8 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <SectionHeading
              tag={blackFriday ? "BLACK FRIDAY / MANGORA" : t("landing.plans.tag")}
              title={offerActive && campaign ? t("landing.campaign.planTitle", { percent: campaign.discountPercent, months: campaign.discountMonths }) : t("landing.plans.title")}
              copy={t("landing.plans.copy")}
              align="left"
            />
            <div className="relative hidden w-44 lg:block">
              <MascotPose
                pose="approve"
                label={t("landing.plans.imageLabel")}
              />
            </div>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {marketingPlans.map((plan) => (
              <article
                key={plan.name}
                className={`relative flex flex-col rounded-[2rem] border-2 p-7 sm:p-8 ${
                  plan.featured
                    ? "border-[#ff6b1a] bg-[var(--lp-background)] shadow-[8px_8px_0_#ffb21a] lg:-translate-y-3"
                    : "border-[var(--lp-line)] bg-[var(--lp-surface)]"
                }`}
              >
                {plan.featured && (
                  <span className="absolute -top-4 right-6 rotate-2 rounded-full lp-orange-ink bg-[#ff6b1a] px-4 py-2 text-xs font-black uppercase tracking-wider text-white">
                    {t("landing.plans.featured")}
                  </span>
                )}
                <h3 className="font-[family-name:var(--font-bricolage)] text-3xl font-extrabold text-[var(--lp-ink)]">
                  {plan.name}
                </h3>
                <p className="mt-3 min-h-14 text-sm leading-6 text-[var(--lp-muted)]">
                  {plan.description}
                </p>
                <div className="mt-7 flex items-end gap-2 border-b border-[var(--lp-line)] pb-7">

                  <strong className="font-[family-name:var(--font-bricolage)] text-4xl leading-none tracking-[-0.045em] text-[var(--lp-ink)] sm:text-5xl">
                    <RegionalPlanPrice planCode={plan.id.toUpperCase()} fallback={plan.price === "0" ? t("landing.plans.freePrice") : `R$ ${plan.price}`} promotion={offerActive && campaign ? { percent: campaign.discountPercent, months: campaign.discountMonths } : null} />
                  </strong>
                  {plan.id !== "free" && <span className="pb-1 text-sm text-[var(--lp-muted)]">{t("landing.plans.perMonth")}</span>}
                </div>
                <ul className="mt-7 flex-1 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-3 text-sm font-semibold text-[var(--lp-muted)]">
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#147a45] text-white">
                        <Check className="size-3" strokeWidth={3} />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/cadastro"
                  className={`mt-8 inline-flex min-h-13 items-center justify-center gap-2 rounded-xl font-extrabold transition hover:-translate-y-0.5 ${
                    plan.featured
                      ? "lp-orange-ink bg-[#ff6b1a] text-white hover:bg-[#e85611]"
                      : "bg-[#123d2b] text-white hover:bg-[#147a45]"
                  }`}
                >
                  {plan.id === "free" ? t("landing.nav.startFree") : t("landing.nav.startTrial")}
                  <ArrowRight className="size-4" />
                </Link>
              </article>
            ))}
          </div>

          {offerActive && campaign && <p className="campaign-terms">{t("landing.campaign.automatic", { months: campaign.discountMonths })}</p>}
          <p className="mt-8 text-center text-xs leading-5 text-[var(--lp-muted)]">
            {t("landing.plans.billingNote")}
          </p>
        </div>
      </section>

      <section id="duvidas" className="bg-[var(--lp-background)] px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-[family-name:var(--font-bricolage)] text-4xl font-extrabold tracking-tight text-[var(--lp-ink)]">{t("landing.faq.title")}</h2>
          <div className="mt-8 divide-y divide-[#123d2b]/15">
            {faq.map(({ question, answer }) => <details key={question} className="group py-5"><summary className="cursor-pointer rounded-lg text-lg font-bold text-[var(--lp-ink)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#147a45]">{question}</summary><p className="mt-4 max-w-2xl leading-7 text-[var(--lp-muted)]">{answer}</p></details>)}
          </div>
        </div>
      </section>

      {banner}
      <section id="contato" className="bg-[var(--lp-surface)] px-5 py-16 sm:px-8 lg:px-10 lg:pb-28">
        <div className="relative mx-auto max-w-[1380px] overflow-hidden rounded-[2.75rem] bg-[#147a45] px-6 py-14 text-white sm:px-12 lg:min-h-[450px] lg:px-16 lg:py-20">
          <div className="absolute -left-20 -top-24 size-72 rounded-full border-[42px] border-white/5" />
          <div className="absolute bottom-0 right-0 h-1/2 w-full bg-[linear-gradient(8deg,rgba(18,61,43,0.38)_0_48%,transparent_49%)]" />

          <div className="relative z-10 max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ffd56a]">
              {t("landing.cta.eyebrow")}
            </p>
            <h2 className="mt-5 text-balance font-[family-name:var(--font-bricolage)] text-5xl font-extrabold leading-[0.95] tracking-[-0.05em] sm:text-7xl">
              {offerActive && campaign ? t("landing.campaign.closingTitle", { percent: campaign.discountPercent }) : t("landing.cta.title")}
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/75">
              {t("landing.cta.copy")}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/cadastro"
                className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-[#ffb21a] px-7 font-extrabold text-[#123d2b] shadow-[0_7px_0_#a85d00] transition hover:-translate-y-1 hover:shadow-[0_10px_0_#a85d00]"
              >
                {campaign ? campaign.ctaLabel : t("landing.cta.button")}
                <ArrowRight className="size-5 transition group-hover:translate-x-1" />
              </Link>
              <Link
                href="https://wa.me/5581984639299"
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-white/25 px-7 font-extrabold transition hover:bg-[var(--lp-surface)]/10"
              >
                {t("landing.cta.whatsapp")}
              </Link>
            </div>
          </div>

          <div className="absolute -bottom-20 -right-4 hidden w-[34%] min-w-80 lg:block">
            <MascotPose
              pose="wave"
              label={t("landing.cta.imageLabel")}
              className="drop-shadow-[0_30px_25px_rgba(0,0,0,0.22)]"
            />
          </div>
        </div>
      </section>

      <Footer t={t} />
    </main>
  );
}

function EditorialHero({ t }: { t: (key: string) => string }) {
  const items = [
    { icon: ShoppingBag, name: t("landing.features.tabs.sales"), detail: t("landing.features.items.sales.title") },
    { icon: Boxes, name: t("landing.features.tabs.stock"), detail: t("landing.features.items.stock.title") },
    { icon: CircleDollarSign, name: t("landing.features.tabs.finance"), detail: t("landing.features.items.finance.title") },
  ];
  return <div className="editorial-hero">
    <div className="editorial-hero__masthead"><span>MANGORA</span><ReceiptText aria-hidden="true" className="size-6" /></div>
    <p className="editorial-hero__title">{t("landing.hero.title")}</p>
    <ul>{items.map(({ icon: Icon, name, detail }) => <li key={name}><Icon aria-hidden="true" className="size-5" /><div><strong>{name}</strong><p>{detail}</p></div><Check aria-hidden="true" className="size-5" /></li>)}</ul>
    <div className="editorial-hero__footer"><span>{t("landing.hero.noCard")}</span><span>{t("landing.nav.trialChip")}</span></div>
  </div>;
}

async function Header({ t, blackFriday }: { blackFriday: boolean; t: (key: string, params?: Record<string, string | number>) => string }) {
  const { locale } = await getTranslator();
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--lp-line)] bg-[var(--lp-background)]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1380px] items-center justify-between gap-2 px-4 sm:h-20 sm:px-8 lg:px-10">
        <Link href={localePath("/", locale)} aria-label={t("landing.nav.home")}>
          <BrandLogo className="h-8 sm:h-11" surface={blackFriday ? "light" : "plain"} priority />
        </Link>

        <nav aria-label={t("landing.nav.label")} className="hidden items-center gap-7 text-sm font-bold text-[var(--lp-muted)] lg:flex">
          <Link href="#recursos" className="transition hover:text-[#ff6b1a]">{t("landing.nav.features")}</Link>
          <Link href="#como-funciona" className="transition hover:text-[#ff6b1a]">{t("landing.nav.howItWorks")}</Link>
          <Link href="#segmentos" className="transition hover:text-[#ff6b1a]">{t("landing.nav.segments")}</Link>
          <Link href="#planos" className="transition hover:text-[#ff6b1a]">{t("landing.nav.plans")}</Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:block"><MarketSelector compact /></div>
          <Link
            href="/login"
            className="inline-flex min-h-11 items-center rounded-xl px-3 py-2 text-sm font-extrabold text-[var(--lp-muted)] transition hover:bg-[var(--lp-surface)] sm:px-5 sm:py-3"
          >
            {t("landing.nav.login")}
          </Link>
          <Link
            href="/cadastro"
            className="inline-flex items-center gap-2 rounded-xl bg-[#123d2b] px-4 py-3 text-sm font-extrabold text-white transition hover:bg-[#147a45] sm:px-5"
          >
            <span className="hidden sm:inline">{t("landing.nav.trialChip")}</span>
            <span className="sm:hidden">Testar</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}

function HeroCounter({ t }: { t: (key: string, params?: Record<string, string | number>) => string }) {
  return (
    <div id="demonstracao" className="relative mx-auto w-full max-w-[720px] scroll-mt-28 lg:ml-auto">
      <div className="absolute -right-2 -top-16 z-20 w-24 sm:-right-4 sm:-top-20 sm:w-28 pointer-events-none">
        <MascotPose
          pose="wave"
          label={t("landing.preview.imageLabel")}
          className="mangora-float drop-shadow-[0_26px_22px_rgba(18,61,43,0.22)]"
        />
      </div>

      <div className="relative overflow-hidden rounded-[1.5rem] border-2 border-[#123d2b] bg-[var(--lp-surface)] shadow-[4px_6px_0_#123d2b] sm:rotate-1 sm:rounded-[2.5rem] sm:shadow-[10px_12px_0_#123d2b]">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#123d2b] bg-[var(--lp-background)] px-4 py-4 sm:px-7">
          <div>
            <p className="font-[family-name:var(--font-bricolage)] text-lg font-extrabold">{t("landing.hero.todayMovement")}</p>
            <p className="text-xs font-semibold text-[var(--lp-muted)]">{t("landing.hero.previewTag")}</p>
          </div>
          <span className="flex items-center gap-2 rounded-full bg-[#dff4e7] px-3 py-2 text-[10px] font-black uppercase tracking-wider text-[#147a45]">
            {t("landing.preview.demo")}
          </span>
        </div>

        <div className="p-5 sm:p-7">
          <div className="hero-metrics grid gap-3 sm:grid-cols-3">
            <CounterMetric icon={CircleDollarSign} label={t("landing.preview.revenue")} value="R$ 18.450" detail="+12,5%" />
            <CounterMetric icon={ShoppingBag} label={t("landing.preview.sales")} value="284" detail="+8,2%" />
            <CounterMetric icon={Users} label={t("landing.preview.customers")} value="1.248" detail="+18" />
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-[1.25fr_0.75fr]">
            <div className="rounded-2xl bg-[var(--lp-background)] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--lp-muted)]">{t("landing.hero.weekSales")}</p>
                  <p className="mt-1 font-[family-name:var(--font-bricolage)] text-2xl font-extrabold">R$ 7.840</p>
                </div>
                <BarChart3 className="size-5 text-[#ff6b1a]" />
              </div>
              <div className="mt-8 flex h-28 items-end gap-2">
                {[42, 67, 55, 84, 63, 100, 76].map((height, index) => (
                  <div key={height} className="flex h-full flex-1 items-end rounded-t-lg bg-[#ffb21a]/20">
                    <span
                      className={`w-full rounded-t-lg ${index === 5 ? "bg-[#ff6b1a]" : "bg-[#ffb21a]"}`}
                      style={{ height: `${height}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <FlowItem icon={ShoppingBag} title={t("landing.preview.order")} detail="R$ 189,90" />
              <FlowItem icon={PackageCheck} title={t("landing.preview.stockMoved")} detail={t("landing.preview.stockItems")} />
              <FlowItem icon={ReceiptText} title={t("landing.preview.cashUpdated")} detail={t("landing.preview.received")} />
            </div>
          </div>

          <div className="relative mt-5 h-2 overflow-hidden rounded-full bg-[#dff4e7]">
            <span className="mangora-flow absolute inset-y-0 left-0 w-1/3 rounded-full bg-[#147a45]" />
          </div>
          <p className="mt-2 text-center text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--lp-muted)]">
            {t("landing.features.syncTitle")}
          </p>
        </div>
      </div>
    </div>
  );
}

function CounterMetric({ icon: Icon, label, value, detail }: { icon: LucideIcon; label: string; value: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-[var(--lp-line)] bg-[var(--lp-surface)] p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="flex size-9 items-center justify-center rounded-xl bg-[#fff0dd] text-[#ff6b1a]"><Icon className="size-4" /></span>
        <span className="text-[10px] font-black text-[#147a45]">{detail}</span>
      </div>
      <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-[var(--lp-muted)]">{label}</p>
      <p className="mt-1 font-[family-name:var(--font-bricolage)] text-lg font-extrabold">{value}</p>
    </div>
  );
}

function FlowItem({ icon: Icon, title, detail }: { icon: LucideIcon; title: string; detail: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[var(--lp-line)] p-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#dff4e7] text-[#147a45]"><Icon className="size-4" /></span>
      <div className="min-w-0">
        <p className="truncate text-xs font-extrabold">{title}</p>
        <p className="mt-0.5 text-[10px] font-semibold text-[var(--lp-muted)]">{detail}</p>
      </div>
    </div>
  );
}

function Benefit({ children }: { children: React.ReactNode }) {
  return <span className="flex items-center gap-2"><CheckCircle2 className="size-4 text-[#147a45]" />{children}</span>;
}

function SectionHeading({ tag, title, copy, align = "center" }: { tag: string; title: string; copy: string; align?: "left" | "center" }) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ff6b1a]">{tag}</p>
      <h2 className="mt-5 text-balance font-[family-name:var(--font-bricolage)] text-4xl font-extrabold leading-[0.98] tracking-[-0.045em] text-[var(--lp-ink)] sm:text-6xl">{title}</h2>
      <p className={`mt-6 text-lg leading-8 text-[var(--lp-muted)] ${align === "center" ? "mx-auto max-w-2xl" : "max-w-2xl"}`}>{copy}</p>
    </div>
  );
}

function ResourceCard({ resource, index }: { resource: { icon: LucideIcon; label: string; title: string; description: string }; index: number }) {
  const Icon = resource.icon;
  const cardClass = index === 0
    ? "lp-orange-ink bg-[#ff6b1a] text-white lg:col-span-4"
    : index === 1
      ? "bg-[#ffb21a] text-[#123d2b] lg:col-span-4"
      : index === 2
        ? "bg-[#dff4e7] text-[#123d2b] lg:col-span-4"
        : "bg-[var(--lp-background)] text-[var(--lp-ink)] lg:col-span-4";
  const iconClass = index === 0 ? "bg-[var(--lp-surface)]/15 text-white" : "bg-[var(--lp-surface)]/65 text-[#147a45]";

  return (
    <article className={`group min-h-52 rounded-[2rem] p-7 transition hover:-translate-y-1 ${cardClass}`}>
      <div className="flex items-start justify-between gap-4">
        <span className={`flex size-12 items-center justify-center rounded-2xl ${iconClass}`}><Icon className="size-6" /></span>
        <span className="text-[10px] font-black uppercase tracking-[0.16em] opacity-65">{resource.label}</span>
      </div>
      <h3 className="mt-7 font-[family-name:var(--font-bricolage)] text-2xl font-extrabold leading-tight tracking-[-0.025em]">{resource.title}</h3>
      <p className="mt-3 text-sm font-medium leading-6 opacity-75">{resource.description}</p>
    </article>
  );
}

function JourneyStep({ number, title, copy }: { number: string; title: string; copy: string }) {
  return (
    <li className="group flex gap-5 rounded-2xl border-2 border-transparent bg-[var(--lp-surface)] p-5 transition hover:border-[#ffb21a] sm:items-center sm:p-6">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#ff6b1a] font-[family-name:var(--font-bricolage)] text-xl font-extrabold text-white shadow-[3px_3px_0_#ffb21a]">{number}</span>
      <div>
        <h3 className="font-[family-name:var(--font-bricolage)] text-xl font-extrabold text-[var(--lp-ink)]">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-[var(--lp-muted)]">{copy}</p>
      </div>
      <ArrowRight className="ml-auto hidden size-5 text-[#ff6b1a] transition group-hover:translate-x-1 sm:block" />
    </li>
  );
}

async function Footer({ t }: { t: (key: string, params?: Record<string, string | number>) => string }) {
  const { locale } = await getTranslator();
  const year = brazilDateKey().slice(0, 4);
  return (
    <footer className="border-t border-[var(--lp-line)] bg-[var(--lp-background)]">
      <div className="mx-auto grid max-w-[1380px] gap-12 px-5 py-14 sm:grid-cols-2 sm:px-8 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-10">
        <div>
          <BrandLogo className="h-11" />
          <p className="mt-5 max-w-xs text-sm font-medium leading-6 text-[var(--lp-muted)]">{t("landing.hero.title")}</p>
          <a
            href="https://www.instagram.com/sistemamangora"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex min-h-11 w-fit items-center gap-2 rounded-lg text-sm font-bold text-[var(--lp-ink)] transition hover:text-[#ff6b1a]"
          >
            <svg aria-hidden="true" focusable="false" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
            </svg>
            <span>Instagram · @sistemamangora</span>
          </a>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#dff4e7] px-4 py-2 text-xs font-extrabold text-[#147a45]"><ShieldCheck className="size-4" /> Seus dados protegidos</div>
        </div>
        <FooterLinks locale={locale} title={t("landing.footer.platform")} links={[[t("landing.nav.features"), "#recursos"], [t("landing.nav.howItWorks"), "#como-funciona"], [t("landing.nav.plans"), "#planos"], [t("landing.nav.login"), "/login"]]} />
        <FooterLinks locale={locale} title={t("landing.footer.company")} links={[["Guias (PT-BR)", "/guias"], [t("landing.footer.about"), "/sobre"], [t("landing.footer.support"), "/suporte"], [t("landing.footer.partners"), "/parceiros"], [t("landing.footer.contact"), "#contato"]]} />
        <FooterLinks locale={locale} title={t("landing.footer.trust")} links={[[t("landing.footer.terms"), "/termos"], [t("landing.footer.privacy"), "/privacidade"], [t("landing.footer.security"), "/seguranca"], [t("landing.footer.lgpd"), "/lgpd"]]} />
      </div>
      <div className="border-t border-[var(--lp-line)]">
        <div className="mx-auto flex max-w-[1380px] flex-col gap-2 px-5 py-6 text-xs font-semibold text-[var(--lp-muted)] sm:flex-row sm:justify-between sm:px-8 lg:px-10">
          <p>© {year} Mangora. {t("landing.footer.rights")}</p>
          <p className="flex items-center gap-2"><Clock3 className="size-3.5" /> {t("landing.footer.availability")}</p>
        </div>
      </div>
    </footer>
  );
}

function FooterLinks({ title, links, locale }: { title: string; links: [string, string][]; locale: import("@/i18n/config").Locale }) {
  return (
    <div>
      <h3 className="font-[family-name:var(--font-bricolage)] font-extrabold text-[var(--lp-ink)]">{title}</h3>
      <ul className="mt-5 space-y-3">
        {links.map(([label, href]) => <li key={label}><Link href={href === "/guias" ? href : href.startsWith("/") ? localePath(href, locale) : href} className="text-sm font-semibold text-[var(--lp-muted)] transition hover:text-[#ff6b1a]">{label}</Link></li>)}
      </ul>
    </div>
  );
}
