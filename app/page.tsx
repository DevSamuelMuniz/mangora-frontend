import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Boxes,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  CreditCard,
  LayoutDashboard,
  Menu,
  PackageCheck,
  ReceiptText,
  Scissors,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Store,
  Users,
  Utensils,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

const features = [
  {
    icon: ShoppingBag,
    title: "Vendas e pedidos",
    description:
      "Registre vendas, acompanhe pedidos e organize todo o atendimento em um único ambiente.",
  },
  {
    icon: Boxes,
    title: "Controle de estoque",
    description:
      "Acompanhe entradas, saídas, estoque mínimo, produtos mais vendidos e movimentações.",
  },
  {
    icon: CircleDollarSign,
    title: "Gestão financeira",
    description:
      "Controle receitas, despesas, contas a pagar, contas a receber e fluxo de caixa.",
  },
  {
    icon: Users,
    title: "Clientes e equipe",
    description:
      "Cadastre clientes, funcionários e defina permissões para cada usuário.",
  },
  {
    icon: BarChart3,
    title: "Relatórios inteligentes",
    description:
      "Visualize faturamento, ticket médio, desempenho de vendas e indicadores importantes.",
  },
  {
    icon: Smartphone,
    title: "Página online",
    description:
      "Divulgue produtos e serviços e receba pedidos por uma página personalizada.",
  },
];

const segments = [
  {
    icon: Store,
    title: "Lojas e comércios",
    description: "PDV, estoque, produtos, vendas, caixa e catálogo digital.",
  },
  {
    icon: Utensils,
    title: "Restaurantes",
    description: "Pedidos, cardápio digital, mesas, comandas e delivery.",
  },
  {
    icon: Scissors,
    title: "Salões e barbearias",
    description: "Agenda, profissionais, serviços, clientes e comissões.",
  },
  {
    icon: Wrench,
    title: "Assistências técnicas",
    description: "Ordens de serviço, peças, orçamentos e acompanhamento.",
  },
  {
    icon: CalendarDays,
    title: "Prestadores de serviços",
    description: "Agenda, clientes, serviços, cobranças e contratos.",
  },
  {
    icon: Building2,
    title: "Empresas em geral",
    description: "Uma estrutura flexível que se adapta ao seu negócio.",
  },
];

const plans = [
  {
    name: "Start",
    description: "Para pequenos negócios que estão começando.",
    price: "60",
    highlighted: false,
    features: [
      "1 empresa e 1 unidade",
      "Até 2 usuários",
      "Cadastro de clientes",
      "Produtos e serviços",
      "Vendas e pedidos",
      "Estoque básico",
      "Financeiro básico",
      "Relatórios essenciais",
      "Página online",
    ],
  },
  {
    name: "Business",
    description: "Para empresas que precisam crescer com organização.",
    price: "129",
    highlighted: true,
    features: [
      "Tudo do plano Start",
      "Até 10 usuários",
      "Frente de caixa — PDV",
      "Abertura e fechamento de caixa",
      "Contas a pagar e receber",
      "Estoque avançado",
      "Dashboard gerencial",
      "Relatórios completos",
      "Emissão fiscal por integração",
      "Módulo específico por segmento",
    ],
  },
  {
    name: "Premium",
    description: "Para operações maiores e mais automatizadas.",
    price: "249",
    highlighted: false,
    features: [
      "Tudo do plano Business",
      "Usuários ilimitados",
      "Até 3 unidades",
      "Múltiplos módulos",
      "Integração com WhatsApp",
      "Pedidos por QR Code",
      "Programa de fidelidade",
      "API para integrações",
      "Domínio personalizado",
      "Suporte prioritário",
    ],
  },
];

const stats = [
  {
    value: "100%",
    label: "Online e acessível",
  },
  {
    value: "24h",
    label: "Disponível para sua empresa",
  },
  {
    value: "1 só",
    label: "Sistema para toda a gestão",
  },
  {
    value: "R$ 60",
    label: "Plano inicial mensal",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-50 text-slate-950">
      <Header />

      <section className="relative isolate overflow-hidden pt-36 sm:pt-44">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_50%_5%,rgba(124,58,237,0.14),transparent_35%),radial-gradient(circle_at_90%_40%,rgba(6,182,212,0.12),transparent_30%)]" />

        <div className="absolute left-[-140px] top-24 -z-10 size-[420px] rounded-full bg-violet-300/30 blur-[130px]" />
        <div className="absolute right-[-120px] top-80 -z-10 size-[400px] rounded-full bg-cyan-200/40 blur-[130px]" />

        <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 pb-24 lg:grid-cols-[1fr_0.95fr] lg:px-8 lg:pb-32">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 shadow-sm">
              <Sparkles className="size-4 text-violet-500" />
              Gestão completa para qualquer negócio
            </div>

            <h1 className="max-w-4xl text-5xl font-black leading-[1.04] tracking-[-0.045em] text-slate-950 sm:text-6xl lg:text-7xl">
              Sua empresa inteira em um{" "}
              <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 bg-clip-text text-transparent">
                único sistema.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
              Controle vendas, clientes, estoque, financeiro, pedidos e
              serviços em uma plataforma simples, moderna e acessível de
              qualquer lugar.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/cadastro"
                className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-7 py-4 font-bold text-white shadow-xl shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-2xl"
              >
                Testar gratuitamente
                <ArrowRight className="size-5 transition group-hover:translate-x-1" />
              </Link>

              <Link
                href="#recursos"
                className="inline-flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-7 py-4 font-bold text-slate-800 shadow-sm transition hover:border-violet-200 hover:bg-violet-50"
              >
                Conhecer recursos
                <ChevronRight className="size-5" />
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3 text-sm text-slate-600">
              <Benefit text="Sem instalação" />
              <Benefit text="Acesso pelo celular" />
              <Benefit text="A partir de R$ 60/mês" />
            </div>
          </div>

          <DashboardPreview />
        </div>

        <div className="mx-auto max-w-7xl px-6 pb-24 lg:px-8">
          <div className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/40 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={`px-7 py-8 ${
                  index < stats.length - 1
                    ? "border-b border-slate-200 sm:border-r lg:border-b-0"
                    : ""
                }`}
              >
                <p className="text-3xl font-black text-slate-950">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

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
                  className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-100/60"
                >
                  <div className="absolute -right-10 -top-10 size-32 rounded-full bg-violet-100/0 blur-3xl transition group-hover:bg-violet-100" />

                  <div className="relative flex size-13 items-center justify-center rounded-2xl border border-violet-100 bg-violet-50 text-violet-600">
                    <Icon className="size-6" />
                  </div>

                  <h3 className="relative mt-6 text-xl font-bold text-slate-950">
                    {feature.title}
                  </h3>

                  <p className="relative mt-3 leading-7 text-slate-600">
                    {feature.description}
                  </p>

                  <div className="relative mt-6 flex items-center gap-2 text-sm font-semibold text-violet-600">
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
                  className="flex gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-lg"
                >
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
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
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700">
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
              />
            </div>
          </div>

          <OperationsPreview />
        </div>
      </section>

      <section id="planos" className="relative py-24 sm:py-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.10),transparent_38%)]" />

        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeader
            eyebrow="Planos acessíveis"
            title="Escolha o plano ideal para sua empresa"
            description="Comece com os recursos essenciais e evolua conforme o crescimento do seu negócio."
          />

          <div className="mt-16 grid items-stretch gap-6 lg:grid-cols-3">
            {plans.map((plan) => (
              <article
                key={plan.name}
                className={`relative flex flex-col rounded-[2rem] border p-7 sm:p-8 ${
                  plan.highlighted
                    ? "border-violet-300 bg-gradient-to-b from-violet-50 to-white shadow-2xl shadow-violet-200/60 lg:-translate-y-4"
                    : "border-slate-200 bg-white shadow-sm"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-lg">
                    Mais escolhido
                  </div>
                )}

                <h3 className="text-2xl font-black text-slate-950">
                  {plan.name}
                </h3>

                <p className="mt-3 min-h-12 text-sm leading-6 text-slate-600">
                  {plan.description}
                </p>

                <div className="mt-7 flex items-end gap-2">
                  <span className="pb-1 text-lg font-semibold text-slate-500">
                    R$
                  </span>
                  <span className="text-5xl font-black tracking-tight text-slate-950">
                    {plan.price}
                  </span>
                  <span className="pb-2 text-sm text-slate-500">/mês</span>
                </div>

                <Link
                  href="/cadastro"
                  className={`mt-8 inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-bold transition ${
                    plan.highlighted
                      ? "bg-violet-600 text-white shadow-lg shadow-violet-200 hover:bg-violet-700"
                      : "border border-slate-200 bg-slate-50 text-slate-900 hover:border-violet-200 hover:bg-violet-50"
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
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                        <Check className="size-3.5" strokeWidth={3} />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-slate-500">
            Integrações externas, emissão fiscal e serviços de terceiros podem
            possuir cobranças adicionais.
          </p>
        </div>
      </section>

      <section id="contato" className="px-6 pb-24 pt-8 lg:px-8 lg:pb-32">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-600 px-7 py-16 text-center shadow-2xl shadow-violet-200 sm:px-12 sm:py-20">
          <div className="absolute -left-20 -top-20 size-72 rounded-full bg-white/15 blur-3xl" />
          <div className="absolute -bottom-32 -right-20 size-80 rounded-full bg-cyan-200/20 blur-3xl" />

          <div className="relative mx-auto max-w-3xl">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-white/30 bg-white/15">
              <Sparkles className="size-7 text-white" />
            </div>

            <h2 className="mt-7 text-4xl font-black tracking-[-0.035em] text-white sm:text-5xl">
              Pronto para transformar a gestão da sua empresa?
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-violet-50">
              Comece agora e tenha vendas, estoque, clientes e financeiro
              trabalhando juntos em uma única plataforma.
            </p>

            <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/cadastro"
                className="inline-flex items-center justify-center gap-3 rounded-2xl bg-white px-7 py-4 font-bold text-slate-950 shadow-lg transition hover:bg-violet-50"
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
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <Logo />

          <div>
            <span className="block text-lg font-black tracking-tight text-slate-950">
              Gestão<span className="text-violet-600">+</span>
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
              Gestão inteligente
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 lg:flex">
          <Link href="#recursos" className="transition hover:text-violet-600">
            Recursos
          </Link>
          <Link href="#segmentos" className="transition hover:text-violet-600">
            Segmentos
          </Link>
          <Link href="#planos" className="transition hover:text-violet-600">
            Planos
          </Link>
          <Link href="#contato" className="transition hover:text-violet-600">
            Contato
          </Link>
        </nav>

        <div className="hidden items-center gap-3 sm:flex">
          <Link
            href="/login"
            className="rounded-xl px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
          >
            Entrar
          </Link>

          <Link
            href="/cadastro"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-600"
          >
            Começar agora
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <button
          type="button"
          aria-label="Abrir menu"
          className="flex size-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-800 lg:hidden"
        >
          <Menu className="size-5" />
        </button>
      </div>
    </header>
  );
}

function Logo() {
  return (
    <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 shadow-lg shadow-violet-200">
      <LayoutDashboard className="size-6 text-white" />
    </div>
  );
}

function Benefit({ text }: { text: string }) {
  return (
    <span className="flex items-center gap-2">
      <CheckCircle2 className="size-4 text-emerald-500" />
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
      <span className="text-sm font-black uppercase tracking-[0.22em] text-violet-600">
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
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-sm font-black text-violet-700">
        {number}
      </span>

      <div>
        <h3 className="font-bold text-slate-950">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
      </div>
    </div>
  );
}

function DashboardPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[620px]">
      <div className="absolute inset-0 translate-y-10 rounded-[2rem] bg-violet-300/30 blur-3xl" />

      <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-slate-300/50">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex gap-2">
            <span className="size-2.5 rounded-full bg-red-400" />
            <span className="size-2.5 rounded-full bg-amber-400" />
            <span className="size-2.5 rounded-full bg-emerald-400" />
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-medium text-slate-400">
            app.gestaomais.com
          </div>

          <div className="size-8 rounded-full bg-gradient-to-br from-violet-500 to-cyan-400" />
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
                      ? "bg-violet-600 text-white shadow-md"
                      : "text-slate-400"
                  }`}
                >
                  <Icon className="size-4" />
                </div>
              ))}
            </div>
          </aside>

          <div className="min-w-0 bg-slate-50/60 p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-3 w-20 rounded-full bg-slate-300" />
                <div className="mt-2 h-2 w-32 rounded-full bg-slate-200" />
              </div>

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
                  <BarChart3 className="size-4 text-violet-500" />
                </div>

                <div className="mt-8 flex h-36 items-end gap-2">
                  {[36, 52, 44, 75, 59, 88, 68, 96, 82, 100, 74, 91].map(
                    (height, index) => (
                      <div
                        key={index}
                        className="flex-1 rounded-t-md bg-gradient-to-t from-violet-500 to-cyan-400"
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
                <div className="h-7 w-20 rounded-lg bg-violet-100" />
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
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <FloatingNotification
        className="-bottom-6 -left-5"
        icon={PackageCheck}
        title="Venda concluída"
        description="Estoque atualizado automaticamente"
        iconClassName="bg-emerald-50 text-emerald-600"
      />

      <FloatingNotification
        className="-right-5 top-24"
        icon={CreditCard}
        title="Pagamento aprovado"
        description="R$ 189,90 via PIX"
        iconClassName="bg-cyan-50 text-cyan-600"
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
        <div className="flex size-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
          <Icon className="size-4" />
        </div>
        <span className="text-[9px] font-bold text-emerald-600">{detail}</span>
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
      <div className="absolute inset-0 rounded-full bg-cyan-200/40 blur-[100px]" />

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

          <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
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
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
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

                <span className="text-right text-xs font-bold text-cyan-600">
                  {item.value}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-gradient-to-br from-violet-100 to-violet-50 p-5">
            <ShieldCheck className="size-5 text-violet-600" />
            <p className="mt-6 text-2xl font-black text-slate-950">Seguro</p>
            <p className="mt-1 text-xs text-slate-500">
              Dados protegidos e separados
            </p>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-cyan-100 to-cyan-50 p-5">
            <Smartphone className="size-5 text-cyan-600" />
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
            <Logo />
            <span className="text-lg font-black text-slate-950">
              Gestão<span className="text-violet-600">+</span>
            </span>
          </Link>

          <p className="mt-5 max-w-xs text-sm leading-6 text-slate-500">
            Gestão completa e acessível para empresas de todos os segmentos.
          </p>
        </div>

        <FooterColumn
          title="Plataforma"
          links={[
            ["Recursos", "#recursos"],
            ["Segmentos", "#segmentos"],
            ["Planos", "#planos"],
            ["Entrar", "/login"],
          ]}
        />

        <FooterColumn
          title="Empresa"
          links={[
            ["Sobre nós", "/sobre"],
            ["Contato", "#contato"],
            ["Suporte", "/suporte"],
            ["Parceiros", "/parceiros"],
          ]}
        />

        <FooterColumn
          title="Legal"
          links={[
            ["Termos de uso", "/termos"],
            ["Privacidade", "/privacidade"],
            ["Segurança", "/seguranca"],
            ["LGPD", "/lgpd"],
          ]}
        />
      </div>

      <div className="border-t border-slate-200">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p>© {currentYear} Gestão+. Todos os direitos reservados.</p>
          <p>Desenvolvido para simplificar empresas.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: [string, string][];
}) {
  return (
    <div>
      <h3 className="text-sm font-bold text-slate-950">{title}</h3>

      <ul className="mt-5 space-y-3">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link
              href={href}
              className="text-sm text-slate-500 transition hover:text-violet-600"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
