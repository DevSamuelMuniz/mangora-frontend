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
<<<<<<< HEAD
import BrandLogo from "@/components/brand/BrandLogo";
=======
import { getTranslator } from "@/i18n/server";
import { alternateLanguages, localePath } from "@/i18n/urls";
import BrandLogo from "@/components/brand/BrandLogo";
import MascotPose from "@/components/brand/MascotPose";
import { marketingPlans } from "@/lib/plans";
import { brazilDateKey } from "@/lib/timezone";
import { brand, brandGraph } from "@/lib/brand";
import ConversionTracking from "@/components/marketing/ConversionTracking";
import ProductWalkthrough from "@/components/marketing/ProductWalkthrough";
import MarketSelector from "@/components/marketing/MarketSelector";
import RegionalPlanPrice from "@/components/marketing/RegionalPlanPrice";
>>>>>>> 0e59a660a5acf0b652a188ddf2e8ccc96de79e4d

export async function generateMetadata(): Promise<Metadata> {
  const { t, locale } = await getTranslator();
  const title = t("landing.meta.title");
  const description = t("landing.meta.description");
  return {
    title: { absolute: title },
    description,
  alternates: { canonical: localePath("/", locale), languages: alternateLanguages("/") },
  openGraph: { url: "/", type: "website", locale: locale.replace("-", "_"), siteName: brand.name, title, description, images: [{ url: brand.image, width: 500, height: 500, alt: "Mangora — sistema de gestão online" }] },
  twitter: { card: "summary_large_image", title, description, images: [brand.image] },
  };
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
  const { t } = await getTranslator();
  return (
    <main className="mangora-landing min-h-screen overflow-hidden bg-[#fff8ea] font-[family-name:var(--font-manrope)] text-[#123d2b]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(brandGraph).replace(/</g, "\\u003c") }} />
      <Header t={t} />
      <ConversionTracking />

      <section id="inicio" className="relative isolate pt-24 sm:pt-28 lg:pt-28">
        <div className="absolute inset-x-0 top-0 -z-20 h-[780px] bg-[radial-gradient(circle_at_78%_26%,rgba(255,178,26,0.32),transparent_31%),radial-gradient(circle_at_10%_30%,rgba(255,107,26,0.13),transparent_28%)]" />
        <div className="absolute left-[7%] top-36 -z-10 size-3 rounded-full bg-[#ffb21a] sm:size-4" />
        <div className="absolute right-[8%] top-44 -z-10 size-5 rotate-12 rounded-sm bg-[#147a45]/20" />

<<<<<<< HEAD
        <div className="absolute left-[-140px] top-24 -z-10 size-[420px] rounded-full bg-orange-300/30 blur-[130px]" />
        <div className="absolute right-[-120px] top-80 -z-10 size-[400px] rounded-full bg-yellow-200/40 blur-[130px]" />

        <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 pb-24 lg:grid-cols-[1fr_0.95fr] lg:px-8 lg:pb-32">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700 shadow-sm">
              <Sparkles className="size-4 text-orange-500" />
              Gestão completa para qualquer negócio
            </div>

            <h1 className="max-w-4xl text-5xl font-black leading-[1.04] tracking-[-0.045em] text-slate-950 sm:text-6xl lg:text-7xl">
              Sua empresa inteira em um{" "}
              <span className="bg-gradient-to-r from-orange-600 via-fuchsia-500 to-yellow-500 bg-clip-text text-transparent">
                único sistema.
=======
        <div className="hero-layout mx-auto grid max-w-[1380px] items-center gap-12 px-5 pb-20 sm:px-8 lg:grid-cols-[0.88fr_1.12fr] lg:gap-8 lg:px-10 lg:pb-28">
          <div className="relative z-10 max-w-2xl">
            <p className="inline-flex -rotate-1 items-center gap-2 rounded-full border-2 border-[#123d2b]/10 bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[#147a45] shadow-[3px_3px_0_#ffb21a] sm:text-sm">
              <span className="size-2 rounded-full bg-[#ff6b1a]" />
              {t("landing.hero.eyebrow")}
            </p>

            <h1 className="mt-6 max-w-[760px] text-balance font-[family-name:var(--font-bricolage)] text-[clamp(2.5rem,4.8vw,4.5rem)] font-extrabold leading-[1.04] tracking-[-0.045em] text-[#123d2b]">
              {t("landing.hero.titleLine1")}
              <span className="relative mt-2 block w-fit text-[#ff6b1a]">
                {t("landing.hero.titleLine2")}
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
>>>>>>> 0e59a660a5acf0b652a188ddf2e8ccc96de79e4d
              </span>
            </h1>

            <p className="mt-8 max-w-xl text-lg font-medium leading-8 text-[#315847] sm:text-xl">
              {t("landing.hero.copy")}
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/cadastro"
<<<<<<< HEAD
                className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 px-7 py-4 font-bold text-white shadow-xl shadow-orange-200 transition hover:-translate-y-0.5 hover:shadow-2xl"
=======
                className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-[#ff6b1a] px-7 font-extrabold text-white shadow-[0_8px_0_#c9460b] transition hover:-translate-y-1 hover:shadow-[0_12px_0_#c9460b] focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#ffb21a]"
>>>>>>> 0e59a660a5acf0b652a188ddf2e8ccc96de79e4d
              >
                {t("landing.hero.ctaTrial")}
                <ArrowRight className="size-5 transition group-hover:translate-x-1" />
              </Link>
              <Link
<<<<<<< HEAD
                href="#recursos"
                className="inline-flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-7 py-4 font-bold text-slate-800 shadow-sm transition hover:border-orange-200 hover:bg-orange-50"
=======
                href="#por-dentro"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl px-6 font-extrabold text-[#123d2b] transition hover:bg-white"
>>>>>>> 0e59a660a5acf0b652a188ddf2e8ccc96de79e4d
              >
                {t("landing.hero.ctaDemo")}
                <ChevronRight className="size-5" />
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-[#4a695c]">
              <Benefit>{t("landing.hero.noCard")}</Benefit>
              <Benefit>{t("landing.hero.noAutoCharge")}</Benefit>
            </div>
            <p className="mt-4 max-w-lg text-sm leading-6 text-[#4a695c]">Experimente por 7 dias. Depois, sua conta continua no Free; assine um plano se precisar de mais recursos.</p>
          </div>

          <HeroCounter t={t} />
        </div>

        <div className="border-y border-[#123d2b]/10 bg-white/65">
          <div className="mx-auto flex max-w-[1380px] flex-col gap-5 px-5 py-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
            <p className="max-w-sm font-[family-name:var(--font-bricolage)] text-lg font-bold leading-tight text-[#123d2b]">
              {t("landing.features.systemLine")}
            </p>
            <div className="flex flex-wrap gap-2">
              {[t("landing.features.tabs.sales"), t("landing.features.tabs.stock"), t("landing.features.tabs.finance"), t("landing.features.tabs.customers"), t("landing.features.tabs.reports")].map(
                (item) => (
                  <span
                    key={item}
                    className="rounded-full border border-[#123d2b]/10 bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-[#315847]"
                  >
                    {item}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      <ProductWalkthrough />

      <section id="recursos" className="bg-white py-16 sm:py-24">
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
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[#ffd56a]">
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
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#123d2b]/70">
                {t("landing.segments.eyebrow")}
              </p>
              <h2 className="mt-4 max-w-xl font-[family-name:var(--font-bricolage)] text-4xl font-extrabold leading-[0.98] tracking-[-0.045em] text-[#123d2b] sm:text-6xl">
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
                    : "bg-[#fff8ea] text-[#123d2b]"
                }`}
              >
                <Icon className="size-5" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

<<<<<<< HEAD
      <section
        id="recursos"
        className="border-y border-slate-200 bg-white py-24 sm:py-32"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeader
            eyebrow="Tudo em um só lugar"
            title="Os recursos que sua empresa precisa"
            description="Uma plataforma completa para organizar a operação, reduzir tarefas manuais e acompanhar seus resultados."
          />

          <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-100/60"
                >
                  <div className="absolute -right-10 -top-10 size-32 rounded-full bg-orange-100/0 blur-3xl transition group-hover:bg-orange-100" />

                  <div className="relative flex size-13 items-center justify-center rounded-2xl border border-orange-100 bg-orange-50 text-orange-600">
                    <Icon className="size-6" />
                  </div>

                  <h3 className="relative mt-6 text-xl font-bold text-slate-950">
                    {feature.title}
                  </h3>

                  <p className="relative mt-3 leading-7 text-slate-600">
                    {feature.description}
                  </p>

                  <div className="relative mt-6 flex items-center gap-2 text-sm font-semibold text-orange-600">
                    Saiba mais
                    <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="segmentos" className="relative py-24 sm:py-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_50%,rgba(6,182,212,0.10),transparent_28%)]" />

        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeader
            eyebrow="Flexível para seu negócio"
            title="Um sistema para diferentes segmentos"
            description="A plataforma adapta seus módulos e funcionalidades ao funcionamento de cada estabelecimento."
          />

          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {segments.map((segment) => {
              const Icon = segment.icon;

              return (
                <article
                  key={segment.title}
                  className="flex gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-yellow-200 hover:shadow-lg"
                >
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-yellow-50 text-yellow-600">
                    <Icon className="size-6" />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-950">
                      {segment.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {segment.description}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white py-24 sm:py-32">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-yellow-200 bg-yellow-50 px-4 py-2 text-sm font-semibold text-yellow-700">
              <Zap className="size-4" />
              Simples para começar
            </div>

            <h2 className="mt-7 text-4xl font-black tracking-[-0.035em] text-slate-950 sm:text-5xl">
              Sua empresa organizada em poucos passos
            </h2>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Crie sua conta, configure sua empresa e comece a controlar sua
              operação sem processos complicados.
            </p>

            <div className="mt-10 space-y-5">
              <Step
                number="01"
                title="Crie sua conta"
                description="Informe seus dados e cadastre o seu estabelecimento."
              />
              <Step
                number="02"
                title="Configure seu negócio"
                description="Cadastre produtos, serviços, funcionários e formas de pagamento."
              />
              <Step
                number="03"
                title="Comece a vender"
                description="Registre vendas, acompanhe pedidos e visualize seus resultados."
=======
      <section id="planos" className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-[1380px] px-5 sm:px-8 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <SectionHeading
              tag={t("landing.plans.tag")}
              title={t("landing.plans.title")}
              copy={t("landing.plans.copy")}
              align="left"
            />
            <div className="relative hidden w-44 lg:block">
              <MascotPose
                pose="approve"
                label={t("landing.plans.imageLabel")}
>>>>>>> 0e59a660a5acf0b652a188ddf2e8ccc96de79e4d
              />
            </div>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {marketingPlans.map((plan) => (
              <article
                key={plan.name}
<<<<<<< HEAD
                className={`relative flex flex-col rounded-[2rem] border p-7 sm:p-8 ${
                  plan.highlighted
                    ? "border-orange-300 bg-gradient-to-b from-orange-50 to-white shadow-2xl shadow-orange-200/60 lg:-translate-y-4"
                    : "border-slate-200 bg-white shadow-sm"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-orange-600 to-yellow-500 px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-lg">
                    Mais escolhido
                  </div>
=======
                className={`relative flex flex-col rounded-[2rem] border-2 p-7 sm:p-8 ${
                  plan.featured
                    ? "border-[#ff6b1a] bg-[#fff8ea] shadow-[8px_8px_0_#ffb21a] lg:-translate-y-3"
                    : "border-[#123d2b]/10 bg-white"
                }`}
              >
                {plan.featured && (
                  <span className="absolute -top-4 right-6 rotate-2 rounded-full bg-[#ff6b1a] px-4 py-2 text-xs font-black uppercase tracking-wider text-white">
                    {t("landing.plans.featured")}
                  </span>
>>>>>>> 0e59a660a5acf0b652a188ddf2e8ccc96de79e4d
                )}
                <h3 className="font-[family-name:var(--font-bricolage)] text-3xl font-extrabold text-[#123d2b]">
                  {plan.name}
                </h3>
                <p className="mt-3 min-h-14 text-sm leading-6 text-[#597064]">
                  {plan.description}
                </p>
                <div className="mt-7 flex items-end gap-2 border-b border-[#123d2b]/10 pb-7">
                  <span className="pb-1 text-sm font-bold text-[#597064]">R$</span>
                  <strong className="font-[family-name:var(--font-bricolage)] text-4xl leading-none tracking-[-0.045em] text-[#123d2b] sm:text-5xl">
                    <RegionalPlanPrice planCode={plan.id.toUpperCase()} fallback={plan.price === "0" ? t("landing.plans.freePrice") : `R$ ${plan.price}`} />
                  </strong>
                  {plan.id !== "free" && <span className="pb-1 text-sm text-[#597064]">{t("landing.plans.perMonth")}</span>}
                </div>
<<<<<<< HEAD

                <Link
                  href="/cadastro"
                  className={`mt-8 inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-bold transition ${
                    plan.highlighted
                      ? "bg-orange-600 text-white shadow-lg shadow-orange-200 hover:bg-orange-700"
                      : "border border-slate-200 bg-slate-50 text-slate-900 hover:border-orange-200 hover:bg-orange-50"
                  }`}
                >
                  Escolher plano
                  <ArrowRight className="size-4" />
                </Link>

                <div className="my-8 h-px bg-slate-200" />

                <ul className="flex-1 space-y-4">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-sm text-slate-700"
                    >
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600">
                        <Check className="size-3.5" strokeWidth={3} />
=======
                <ul className="mt-7 flex-1 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-3 text-sm font-semibold text-[#315847]">
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#147a45] text-white">
                        <Check className="size-3" strokeWidth={3} />
>>>>>>> 0e59a660a5acf0b652a188ddf2e8ccc96de79e4d
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/cadastro"
                  className={`mt-8 inline-flex min-h-13 items-center justify-center gap-2 rounded-xl font-extrabold transition hover:-translate-y-0.5 ${
                    plan.featured
                      ? "bg-[#ff6b1a] text-white hover:bg-[#e85611]"
                      : "bg-[#123d2b] text-white hover:bg-[#147a45]"
                  }`}
                >
                  {plan.id === "free" ? t("landing.nav.startFree") : t("landing.nav.startTrial")}
                  <ArrowRight className="size-4" />
                </Link>
              </article>
            ))}
          </div>

          <p className="mt-8 text-center text-xs leading-5 text-[#6a7d73]">
            {t("landing.plans.billingNote")}
          </p>
        </div>
      </section>

<<<<<<< HEAD
      <section id="contato" className="px-6 pb-24 pt-8 lg:px-8 lg:pb-32">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-orange-600 via-amber-600 to-yellow-600 px-7 py-16 text-center shadow-2xl shadow-orange-200 sm:px-12 sm:py-20">
          <div className="absolute -left-20 -top-20 size-72 rounded-full bg-white/15 blur-3xl" />
          <div className="absolute -bottom-32 -right-20 size-80 rounded-full bg-yellow-200/20 blur-3xl" />

          <div className="relative mx-auto max-w-3xl">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-white/30 bg-white/15">
              <Sparkles className="size-7 text-white" />
            </div>

            <h2 className="mt-7 text-4xl font-black tracking-[-0.035em] text-white sm:text-5xl">
              Pronto para transformar a gestão da sua empresa?
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-orange-50">
              Comece agora e tenha vendas, estoque, clientes e financeiro
              trabalhando juntos em uma única plataforma.
            </p>

            <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/cadastro"
                className="inline-flex items-center justify-center gap-3 rounded-2xl bg-white px-7 py-4 font-bold text-slate-950 shadow-lg transition hover:bg-orange-50"
              >
                Criar minha conta
                <ArrowRight className="size-5" />
              </Link>

              <Link
                href="https://wa.me/5581984639299"
                target="_blank"
                className="inline-flex items-center justify-center gap-3 rounded-2xl border border-white/30 bg-white/10 px-7 py-4 font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                Falar com um especialista
              </Link>
            </div>
=======
      <section id="duvidas" className="bg-[#fff8ea] px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-[family-name:var(--font-bricolage)] text-4xl font-extrabold tracking-tight text-[#123d2b]">{t("landing.faq.title")}</h2>
          <div className="mt-8 divide-y divide-[#123d2b]/15">
            {[
              [t("landing.faq.card.question"), t("landing.faq.card.answer")],
              [t("landing.faq.afterTrial.question"), t("landing.faq.afterTrial.answer")],
              [t("landing.faq.install.question"), t("landing.faq.install.answer")],
              [t("landing.faq.firstSteps.question"), t("landing.faq.firstSteps.answer")],
              [t("landing.faq.doubt.question"), t("landing.faq.doubt.answer")],
            ].map(([question, answer]) => <details key={question} className="group py-5"><summary className="cursor-pointer rounded-lg text-lg font-bold text-[#123d2b] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#147a45]">{question}</summary><p className="mt-4 max-w-2xl leading-7 text-[#315847]">{answer}</p></details>)}
>>>>>>> 0e59a660a5acf0b652a188ddf2e8ccc96de79e4d
          </div>
        </div>
      </section>

      <section id="contato" className="bg-white px-5 py-16 sm:px-8 lg:px-10 lg:pb-28">
        <div className="relative mx-auto max-w-[1380px] overflow-hidden rounded-[2.75rem] bg-[#147a45] px-6 py-14 text-white sm:px-12 lg:min-h-[450px] lg:px-16 lg:py-20">
          <div className="absolute -left-20 -top-24 size-72 rounded-full border-[42px] border-white/5" />
          <div className="absolute bottom-0 right-0 h-1/2 w-full bg-[linear-gradient(8deg,rgba(18,61,43,0.38)_0_48%,transparent_49%)]" />

          <div className="relative z-10 max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ffd56a]">
              {t("landing.cta.eyebrow")}
            </p>
            <h2 className="mt-5 text-balance font-[family-name:var(--font-bricolage)] text-5xl font-extrabold leading-[0.95] tracking-[-0.05em] sm:text-7xl">
              {t("landing.cta.title")}
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/75">
              {t("landing.cta.copy")}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/cadastro"
                className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-[#ffb21a] px-7 font-extrabold text-[#123d2b] shadow-[0_7px_0_#a85d00] transition hover:-translate-y-1 hover:shadow-[0_10px_0_#a85d00]"
              >
                {t("landing.cta.button")}
                <ArrowRight className="size-5 transition group-hover:translate-x-1" />
              </Link>
              <Link
                href="https://wa.me/5581984639299"
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-white/25 px-7 font-extrabold transition hover:bg-white/10"
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

function Header({ t }: { t: (key: string, params?: Record<string, string | number>) => string }) {
  return (
<<<<<<< HEAD
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <BrandLogo className="h-11" priority />
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 lg:flex">
          <Link href="#recursos" className="transition hover:text-orange-600">
            Recursos
          </Link>
          <Link href="#segmentos" className="transition hover:text-orange-600">
            Segmentos
          </Link>
          <Link href="#planos" className="transition hover:text-orange-600">
            Planos
          </Link>
          <Link href="#contato" className="transition hover:text-orange-600">
            Contato
          </Link>
=======
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#123d2b]/10 bg-[#fff8ea]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1380px] items-center justify-between gap-2 px-4 sm:h-20 sm:px-8 lg:px-10">
        <Link href="/" aria-label={t("landing.nav.home")}>
          <BrandLogo className="h-8 sm:h-11" priority />
        </Link>

        <nav aria-label={t("landing.nav.label")} className="hidden items-center gap-7 text-sm font-bold text-[#315847] lg:flex">
          <Link href="#recursos" className="transition hover:text-[#ff6b1a]">{t("landing.nav.features")}</Link>
          <Link href="#como-funciona" className="transition hover:text-[#ff6b1a]">{t("landing.nav.howItWorks")}</Link>
          <Link href="#segmentos" className="transition hover:text-[#ff6b1a]">{t("landing.nav.segments")}</Link>
          <Link href="#planos" className="transition hover:text-[#ff6b1a]">{t("landing.nav.plans")}</Link>
>>>>>>> 0e59a660a5acf0b652a188ddf2e8ccc96de79e4d
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:block"><MarketSelector compact /></div>
          <Link
            href="/login"
            className="inline-flex min-h-11 items-center rounded-xl px-3 py-2 text-sm font-extrabold text-[#315847] transition hover:bg-white sm:px-5 sm:py-3"
          >
            {t("landing.nav.login")}
          </Link>
          <Link
            href="/cadastro"
<<<<<<< HEAD
            className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
=======
            className="inline-flex items-center gap-2 rounded-xl bg-[#123d2b] px-4 py-3 text-sm font-extrabold text-white transition hover:bg-[#147a45] sm:px-5"
>>>>>>> 0e59a660a5acf0b652a188ddf2e8ccc96de79e4d
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

<<<<<<< HEAD
function Benefit({ text }: { text: string }) {
  return (
    <span className="flex items-center gap-2">
      <CheckCircle2 className="size-4 text-green-500" />
      {text}
    </span>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <span className="text-sm font-black uppercase tracking-[0.22em] text-orange-600">
        {eyebrow}
      </span>

      <h2 className="mt-5 text-4xl font-black tracking-[-0.035em] text-slate-950 sm:text-5xl">
        {title}
      </h2>

      <p className="mt-6 text-lg leading-8 text-slate-600">{description}</p>
    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-sm font-black text-orange-700">
        {number}
      </span>

      <div>
        <h3 className="font-bold text-slate-950">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
=======
function HeroCounter({ t }: { t: (key: string, params?: Record<string, string | number>) => string }) {
  return (
    <div id="demonstracao" className="relative mx-auto w-full max-w-[720px] scroll-mt-28 lg:ml-auto">
      <div className="absolute -right-2 -top-16 z-20 w-24 sm:-right-4 sm:-top-20 sm:w-28 pointer-events-none">
        <MascotPose
          pose="wave"
          label={t("landing.preview.imageLabel")}
          className="mangora-float drop-shadow-[0_26px_22px_rgba(18,61,43,0.22)]"
        />
>>>>>>> 0e59a660a5acf0b652a188ddf2e8ccc96de79e4d
      </div>

<<<<<<< HEAD
function DashboardPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[620px]">
      <div className="absolute inset-0 translate-y-10 rounded-[2rem] bg-orange-300/30 blur-3xl" />

      <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-slate-300/50">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex gap-2">
            <span className="size-2.5 rounded-full bg-red-400" />
            <span className="size-2.5 rounded-full bg-amber-400" />
            <span className="size-2.5 rounded-full bg-green-400" />
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-medium text-slate-400">
            app.mangora.com.br
          </div>

          <div className="size-8 rounded-full bg-gradient-to-br from-orange-500 to-yellow-400" />
        </div>

        <div className="grid min-h-[480px] grid-cols-[72px_1fr]">
          <aside className="border-r border-slate-200 bg-slate-50 px-3 py-5">
            <div className="flex flex-col items-center gap-4">
              {[
                LayoutDashboard,
                ShoppingBag,
                Boxes,
                Users,
                ReceiptText,
                BarChart3,
              ].map((Icon, index) => (
                <div
                  key={index}
                  className={`flex size-10 items-center justify-center rounded-xl ${
                    index === 0
                      ? "bg-orange-600 text-white shadow-md"
                      : "text-slate-400"
                  }`}
                >
                  <Icon className="size-4" />
=======
      <div className="relative overflow-hidden rounded-[1.5rem] border-2 border-[#123d2b] bg-white shadow-[4px_6px_0_#123d2b] sm:rotate-1 sm:rounded-[2.5rem] sm:shadow-[10px_12px_0_#123d2b]">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#123d2b] bg-[#fff8ea] px-4 py-4 sm:px-7">
          <div>
            <p className="font-[family-name:var(--font-bricolage)] text-lg font-extrabold">{t("landing.hero.todayMovement")}</p>
            <p className="text-xs font-semibold text-[#6a7d73]">{t("landing.hero.previewTag")}</p>
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
            <div className="rounded-2xl bg-[#fff8ea] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wider text-[#6a7d73]">{t("landing.hero.weekSales")}</p>
                  <p className="mt-1 font-[family-name:var(--font-bricolage)] text-2xl font-extrabold">R$ 7.840</p>
>>>>>>> 0e59a660a5acf0b652a188ddf2e8ccc96de79e4d
                </div>
                <BarChart3 className="size-5 text-[#ff6b1a]" />
              </div>
<<<<<<< HEAD

              <div className="flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500">
                <Clock3 className="size-4" />
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <MetricCard
                icon={CircleDollarSign}
                label="Faturamento"
                value="R$ 18.450"
                detail="+12,5%"
              />
              <MetricCard
                icon={ShoppingBag}
                label="Vendas"
                value="284"
                detail="+8,2%"
              />
              <MetricCard
                icon={Users}
                label="Clientes"
                value="1.248"
                detail="+18"
              />
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-[1.45fr_0.8fr]">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="h-2.5 w-24 rounded bg-slate-300" />
                    <div className="mt-2 h-2 w-16 rounded bg-slate-200" />
                  </div>
                  <BarChart3 className="size-4 text-orange-500" />
                </div>

                <div className="mt-8 flex h-36 items-end gap-2">
                  {[36, 52, 44, 75, 59, 88, 68, 96, 82, 100, 74, 91].map(
                    (height, index) => (
                      <div
                        key={index}
                        className="flex-1 rounded-t-md bg-gradient-to-t from-orange-500 to-yellow-400"
                        style={{ height: `${height}%` }}
                      />
                    ),
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="h-2.5 w-20 rounded bg-slate-300" />

                <div className="mt-7 flex justify-center">
                  <div className="relative flex size-28 items-center justify-center rounded-full bg-[conic-gradient(#06b6d4_0deg_220deg,#8b5cf6_220deg_310deg,#e2e8f0_310deg)]">
                    <div className="flex size-20 items-center justify-center rounded-full bg-white">
                      <div className="text-center">
                        <p className="text-lg font-black text-slate-950">72%</p>
                        <p className="text-[8px] text-slate-400">
                          Meta mensal
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <div className="h-2 rounded-full bg-slate-200" />
                  <div className="h-2 w-3/4 rounded-full bg-slate-200" />
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="h-2.5 w-24 rounded bg-slate-300" />
                <div className="h-7 w-20 rounded-lg bg-orange-100" />
              </div>

              <div className="space-y-3">
                {[
                  ["Pedido #1024", "R$ 189,90", "Concluído"],
                  ["Pedido #1023", "R$ 74,50", "Em andamento"],
                  ["Pedido #1022", "R$ 312,00", "Concluído"],
                ].map(([order, value, status], index) => (
                  <div
                    key={order}
                    className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5"
                  >
                    <div>
                      <p className="text-[10px] font-semibold text-slate-700">
                        {order}
                      </p>
                      <p className="mt-1 text-[8px] text-slate-400">
                        Hoje, {10 + index}:30
                      </p>
                    </div>

                    <span className="text-[10px] font-bold text-slate-700">
                      {value}
                    </span>

                    <span
                      className={`rounded-full px-2 py-1 text-[8px] font-bold ${
                        status === "Concluído"
                          ? "bg-green-50 text-green-600"
                          : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {status}
                    </span>
=======
              <div className="mt-8 flex h-28 items-end gap-2">
                {[42, 67, 55, 84, 63, 100, 76].map((height, index) => (
                  <div key={height} className="flex h-full flex-1 items-end rounded-t-lg bg-[#ffb21a]/20">
                    <span
                      className={`w-full rounded-t-lg ${index === 5 ? "bg-[#ff6b1a]" : "bg-[#ffb21a]"}`}
                      style={{ height: `${height}%` }}
                    />
>>>>>>> 0e59a660a5acf0b652a188ddf2e8ccc96de79e4d
                  </div>
                ))}
              </div>
            </div>

<<<<<<< HEAD
      <FloatingNotification
        className="-bottom-6 -left-5"
        icon={PackageCheck}
        title="Venda concluída"
        description="Estoque atualizado automaticamente"
        iconClassName="bg-green-50 text-green-600"
      />

      <FloatingNotification
        className="-right-5 top-24"
        icon={CreditCard}
        title="Pagamento aprovado"
        description="R$ 189,90 via PIX"
        iconClassName="bg-yellow-50 text-yellow-600"
      />
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex size-8 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
          <Icon className="size-4" />
        </div>
        <span className="text-[9px] font-bold text-green-600">{detail}</span>
      </div>

      <p className="mt-4 text-[9px] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-black text-slate-950">{value}</p>
    </div>
  );
}

function FloatingNotification({
  className,
  icon: Icon,
  title,
  description,
  iconClassName,
}: {
  className: string;
  icon: LucideIcon;
  title: string;
  description: string;
  iconClassName: string;
}) {
  return (
    <div
      className={`absolute hidden items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:flex ${className}`}
    >
      <div
        className={`flex size-10 items-center justify-center rounded-xl ${iconClassName}`}
      >
        <Icon className="size-5" />
      </div>

      <div>
        <p className="text-xs font-bold text-slate-950">{title}</p>
        <p className="mt-1 text-[10px] text-slate-500">{description}</p>
      </div>
    </div>
  );
}

function OperationsPreview() {
  const items = [
    {
      icon: ShoppingBag,
      label: "Venda realizada",
      description: "Pedido #1024",
      value: "+ R$ 189,90",
    },
    {
      icon: Boxes,
      label: "Estoque atualizado",
      description: "3 produtos movimentados",
      value: "- 5 itens",
    },
    {
      icon: Users,
      label: "Novo cliente",
      description: "Cadastro concluído",
      value: "+ 1 cliente",
    },
    {
      icon: ReceiptText,
      label: "Conta recebida",
      description: "Pagamento confirmado",
      value: "+ R$ 480,00",
    },
  ];

  return (
    <div className="relative">
      <div className="absolute inset-0 rounded-full bg-yellow-200/40 blur-[100px]" />

      <div className="relative rounded-[2rem] border border-slate-200 bg-slate-50 p-5 shadow-2xl shadow-slate-200 sm:p-7">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-slate-950">
              Operação em tempo real
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Acompanhe tudo o que acontece
            </p>
          </div>

          <div className="flex size-11 items-center justify-center rounded-2xl bg-green-50 text-green-600">
            <Zap className="size-5" />
          </div>
        </div>

        <div className="mt-7 space-y-3">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                  <Icon className="size-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-950">
                    {item.label}
                  </p>
                  <p className="mt-1 truncate text-xs text-slate-500">
                    {item.description}
                  </p>
                </div>

                <span className="text-right text-xs font-bold text-yellow-600">
                  {item.value}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-gradient-to-br from-orange-100 to-orange-50 p-5">
            <ShieldCheck className="size-5 text-orange-600" />
            <p className="mt-6 text-2xl font-black text-slate-950">Seguro</p>
            <p className="mt-1 text-xs text-slate-500">
              Dados protegidos e separados
            </p>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-yellow-100 to-yellow-50 p-5">
            <Smartphone className="size-5 text-yellow-600" />
            <p className="mt-6 text-2xl font-black text-slate-950">
              Responsivo
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Computador, tablet e celular
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div className="sm:col-span-2 lg:col-span-1">
          <Link href="/" className="flex items-center gap-3">
            <BrandLogo className="h-10" />
          </Link>

          <p className="mt-5 max-w-xs text-sm leading-6 text-slate-500">
            Gestão completa e acessível para empresas de todos os segmentos.
=======
            <div className="space-y-3">
              <FlowItem icon={ShoppingBag} title={t("landing.preview.order")} detail="R$ 189,90" />
              <FlowItem icon={PackageCheck} title={t("landing.preview.stockMoved")} detail={t("landing.preview.stockItems")} />
              <FlowItem icon={ReceiptText} title={t("landing.preview.cashUpdated")} detail={t("landing.preview.received")} />
            </div>
          </div>

          <div className="relative mt-5 h-2 overflow-hidden rounded-full bg-[#dff4e7]">
            <span className="mangora-flow absolute inset-y-0 left-0 w-1/3 rounded-full bg-[#147a45]" />
          </div>
          <p className="mt-2 text-center text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#6a7d73]">
            {t("landing.features.syncTitle")}
>>>>>>> 0e59a660a5acf0b652a188ddf2e8ccc96de79e4d
          </p>
        </div>
      </div>
    </div>
  );
}

<<<<<<< HEAD
      <div className="border-t border-slate-200">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p>© {currentYear} Mangora. Todos os direitos reservados.</p>
          <p>Desenvolvido para simplificar empresas.</p>
=======
function CounterMetric({ icon: Icon, label, value, detail }: { icon: LucideIcon; label: string; value: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-[#123d2b]/10 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="flex size-9 items-center justify-center rounded-xl bg-[#fff0dd] text-[#ff6b1a]"><Icon className="size-4" /></span>
        <span className="text-[10px] font-black text-[#147a45]">{detail}</span>
      </div>
      <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-[#6a7d73]">{label}</p>
      <p className="mt-1 font-[family-name:var(--font-bricolage)] text-lg font-extrabold">{value}</p>
    </div>
  );
}

function FlowItem({ icon: Icon, title, detail }: { icon: LucideIcon; title: string; detail: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#123d2b]/10 p-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#dff4e7] text-[#147a45]"><Icon className="size-4" /></span>
      <div className="min-w-0">
        <p className="truncate text-xs font-extrabold">{title}</p>
        <p className="mt-0.5 text-[10px] font-semibold text-[#6a7d73]">{detail}</p>
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
      <h2 className="mt-5 text-balance font-[family-name:var(--font-bricolage)] text-4xl font-extrabold leading-[0.98] tracking-[-0.045em] text-[#123d2b] sm:text-6xl">{title}</h2>
      <p className={`mt-6 text-lg leading-8 text-[#597064] ${align === "center" ? "mx-auto max-w-2xl" : "max-w-2xl"}`}>{copy}</p>
    </div>
  );
}

function ResourceCard({ resource, index }: { resource: { icon: LucideIcon; label: string; title: string; description: string }; index: number }) {
  const Icon = resource.icon;
  const cardClass = index === 0
    ? "bg-[#ff6b1a] text-white lg:col-span-4"
    : index === 1
      ? "bg-[#ffb21a] text-[#123d2b] lg:col-span-4"
      : index === 2
        ? "bg-[#dff4e7] text-[#123d2b] lg:col-span-4"
        : "bg-[#fff8ea] text-[#123d2b] lg:col-span-4";
  const iconClass = index === 0 ? "bg-white/15 text-white" : "bg-white/65 text-[#147a45]";

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
    <li className="group flex gap-5 rounded-2xl border-2 border-transparent bg-white p-5 transition hover:border-[#ffb21a] sm:items-center sm:p-6">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#ff6b1a] font-[family-name:var(--font-bricolage)] text-xl font-extrabold text-white shadow-[3px_3px_0_#ffb21a]">{number}</span>
      <div>
        <h3 className="font-[family-name:var(--font-bricolage)] text-xl font-extrabold text-[#123d2b]">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-[#597064]">{copy}</p>
      </div>
      <ArrowRight className="ml-auto hidden size-5 text-[#ff6b1a] transition group-hover:translate-x-1 sm:block" />
    </li>
  );
}

function Footer({ t }: { t: (key: string, params?: Record<string, string | number>) => string }) {
  const year = brazilDateKey().slice(0, 4);
  return (
    <footer className="border-t border-[#123d2b]/10 bg-[#fff8ea]">
      <div className="mx-auto grid max-w-[1380px] gap-12 px-5 py-14 sm:grid-cols-2 sm:px-8 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-10">
        <div>
          <BrandLogo className="h-11" />
          <p className="mt-5 max-w-xs text-sm font-medium leading-6 text-[#597064]">{t("landing.hero.title")}</p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#dff4e7] px-4 py-2 text-xs font-extrabold text-[#147a45]"><ShieldCheck className="size-4" /> Seus dados protegidos</div>
        </div>
        <FooterLinks title={t("landing.footer.platform")} links={[[t("landing.nav.features"), "#recursos"], [t("landing.nav.howItWorks"), "#como-funciona"], [t("landing.nav.plans"), "#planos"], [t("landing.nav.login"), "/login"]]} />
        <FooterLinks title={t("landing.footer.company")} links={[[t("landing.footer.about"), "/sobre"], [t("landing.footer.support"), "/suporte"], [t("landing.footer.partners"), "/parceiros"], [t("landing.footer.contact"), "#contato"]]} />
        <FooterLinks title={t("landing.footer.trust")} links={[[t("landing.footer.terms"), "/termos"], [t("landing.footer.privacy"), "/privacidade"], [t("landing.footer.security"), "/seguranca"], [t("landing.footer.lgpd"), "/lgpd"]]} />
      </div>
      <div className="border-t border-[#123d2b]/10">
        <div className="mx-auto flex max-w-[1380px] flex-col gap-2 px-5 py-6 text-xs font-semibold text-[#6a7d73] sm:flex-row sm:justify-between sm:px-8 lg:px-10">
          <p>© {year} Mangora. {t("landing.footer.rights")}</p>
          <p className="flex items-center gap-2"><Clock3 className="size-3.5" /> {t("landing.footer.availability")}</p>
>>>>>>> 0e59a660a5acf0b652a188ddf2e8ccc96de79e4d
        </div>
      </div>
    </footer>
  );
}

function FooterLinks({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h3 className="font-[family-name:var(--font-bricolage)] font-extrabold text-[#123d2b]">{title}</h3>
      <ul className="mt-5 space-y-3">
<<<<<<< HEAD
        {links.map(([label, href]) => (
          <li key={label}>
            <Link
              href={href}
              className="text-sm text-slate-500 transition hover:text-orange-600"
            >
              {label}
            </Link>
          </li>
        ))}
=======
        {links.map(([label, href]) => <li key={label}><Link href={href} className="text-sm font-semibold text-[#597064] transition hover:text-[#ff6b1a]">{label}</Link></li>)}
>>>>>>> 0e59a660a5acf0b652a188ddf2e8ccc96de79e4d
      </ul>
    </div>
  );
}
