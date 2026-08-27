import Link from "next/link";
import { Check, ShieldCheck, Sparkles } from "lucide-react";
import BrandLogo from "@/components/brand/BrandLogo";
import MascotPose from "@/components/brand/MascotPose";

type AuthVisualPanelProps = { variant: "login" | "register" };

const content = {
  login: {
    eyebrow: "Sua operação continua daqui",
    title: "Bom te ver de volta.",
    copy: "Entre e encontre vendas, estoque e financeiro do jeito que você deixou.",
    pose: "approve" as const,
    label: "Mascote Mangora dando sinal de positivo",
    note: "Tudo em ordem para mais um dia de negócio.",
    items: ["Dados protegidos", "Rotina sincronizada", "Acesso pelo celular"],
  },
  register: {
    eyebrow: "Comece sem complicação",
    title: "Sua empresa organizada desde o primeiro dia.",
    copy: "Conte um pouco sobre o seu negócio. A Mangora prepara o espaço para você começar.",
    pose: "point" as const,
    label: "Mascote Mangora apontando para o cadastro",
    note: "Leva poucos minutos. Depois é só começar.",
    items: ["Cadastre sua empresa", "Configure sua rotina", "Acompanhe os resultados"],
  },
};

export default function AuthVisualPanel({ variant }: AuthVisualPanelProps) {
  const panel = content[variant];

  return (
    <aside className="relative hidden min-h-screen overflow-hidden bg-[#123d2b] px-9 py-8 text-white lg:flex lg:flex-col xl:px-12 xl:py-10">
      <div className="absolute -left-28 top-[34%] size-72 rounded-full border-[42px] border-white/[0.035]" />
      <div className="absolute -right-20 -top-20 size-64 rounded-full bg-[#ffb21a]/10 blur-3xl" />
      <div className="absolute inset-x-0 bottom-0 h-[38%] bg-[linear-gradient(8deg,rgba(20,122,69,0.55)_0_48%,transparent_49%)]" />

      <Link href="/" aria-label="Ir para a página inicial" className="relative z-10 w-fit rounded-xl bg-[#fff8ea] px-4 py-2.5 shadow-[4px_4px_0_#ffb21a]">
        <BrandLogo className="h-8 xl:h-9" surface="light" priority />
      </Link>

      <div className="relative z-10 mt-auto max-w-[32rem] pb-[min(35vh,17rem)] xl:pb-[min(37vh,19rem)]">
        <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#ffd56a]"><Sparkles className="size-4" />{panel.eyebrow}</p>
        <h2 className="mt-5 text-balance font-[family-name:var(--font-bricolage)] text-[clamp(2.75rem,4.2vw,5.2rem)] font-extrabold leading-[0.91] tracking-[-0.055em]">{panel.title}</h2>
        <p className="mt-5 max-w-md text-sm font-medium leading-7 text-white/70 xl:text-base">{panel.copy}</p>
      </div>

      <div className="absolute bottom-7 left-9 z-20 max-w-[16rem] xl:bottom-10 xl:left-12">
        <div className="rotate-[-2deg] rounded-2xl bg-[#ffb21a] px-5 py-4 font-[family-name:var(--font-bricolage)] text-sm font-extrabold leading-5 text-[#123d2b] shadow-[5px_5px_0_#0b281c]">{panel.note}</div>
        <div className="mt-5 space-y-2.5">
          {panel.items.map((item) => <p key={item} className="flex items-center gap-2 text-xs font-bold text-white/75"><span className="flex size-5 items-center justify-center rounded-full bg-[#147a45] text-white"><Check className="size-3" strokeWidth={3} /></span>{item}</p>)}
        </div>
      </div>

      <div className={`absolute bottom-[-4.5rem] right-[-1.5rem] z-10 w-[48%] max-w-[25rem] xl:right-2 xl:w-[50%] ${variant === "register" ? "translate-x-6" : ""}`}>
        <MascotPose pose={panel.pose} label={panel.label} className="drop-shadow-[0_28px_25px_rgba(0,0,0,0.3)]" />
      </div>

      <div className="absolute bottom-8 right-8 z-20 flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.13em] text-white/70 backdrop-blur xl:right-10"><ShieldCheck className="size-3.5 text-[#ffd56a]" />Ambiente protegido</div>
    </aside>
  );
}
