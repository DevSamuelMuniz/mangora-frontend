import Link from "next/link";
import { ArrowLeft, CheckCircle2, LayoutDashboard } from "lucide-react";

type PublicInfoSection = {
  title: string;
  paragraphs: string[];
  items?: string[];
};

type PublicInfoPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  updatedAt?: string;
  sections: PublicInfoSection[];
};

export default function PublicInfoPage({
  eyebrow,
  title,
  description,
  updatedAt,
  sections,
}: PublicInfoPageProps) {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 shadow-md shadow-violet-200">
              <LayoutDashboard className="size-4.5 text-white" />
            </span>
            <span className="font-black tracking-tight">
              Gestão<span className="text-violet-600">+</span>
            </span>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-violet-700"
          >
            <ArrowLeft className="size-4" />
            Voltar ao início
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="max-w-3xl">
          <span className="text-xs font-black uppercase tracking-[0.16em] text-violet-600">
            {eyebrow}
          </span>
          <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg">
            {description}
          </p>
          {updatedAt && (
            <p className="mt-3 text-xs font-semibold text-slate-400">
              Última atualização: {updatedAt}
            </p>
          )}
        </div>

        <div className="mt-10 grid gap-5">
          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <h2 className="text-xl font-black tracking-tight">
                {section.title}
              </h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              {section.items && (
                <ul className="mt-5 grid gap-3">
                  {section.items.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-slate-600">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/cadastro"
            className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-700"
          >
            Criar uma conta
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-violet-200 hover:text-violet-700"
          >
            Entrar na plataforma
          </Link>
        </div>
      </div>
    </main>
  );
}
