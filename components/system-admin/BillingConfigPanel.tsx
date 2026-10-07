"use client";

import { useEffect, useState } from "react";
import { BellRing, Building2, Check, CheckCircle2, CreditCard, Mail, ReceiptText, Save, Settings2, ShieldCheck, UserRoundPlus, WalletCards, type LucideIcon } from "lucide-react";
import { apiRequest } from "@/lib/api/client";
import { useT } from "@/i18n/provider";

type Settings = { email: string; purchases: boolean; paid: boolean; pending: boolean; newRegistrations: boolean; emailConfigured: boolean };
type EventKey = "newRegistrations" | "purchases" | "paid" | "pending";

const eventCards: Array<{ key: EventKey; title: string; description: string; icon: LucideIcon; tag: string }> = [
  { key: "newRegistrations", title: "Novo cadastro de empresa", description: "Quando uma empresa cria uma conta na Mangora.", icon: UserRoundPlus, tag: "CADASTROS" },
  { key: "purchases", title: "Nova compra de assinatura", description: "Quando uma empresa inicia a contratação de um plano.", icon: WalletCards, tag: "ASSINATURAS" },
  { key: "paid", title: "Pagamento confirmado", description: "Quando o provedor confirma o pagamento de uma cobrança.", icon: CheckCircle2, tag: "PAGAMENTOS" },
  { key: "pending", title: "Pagamento pendente ou vencido", description: "Quando uma cobrança fica pendente ou entra em atraso.", icon: ReceiptText, tag: "PAGAMENTOS" },
];

export default function BillingConfigPanel() {
  const t = useT();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    apiRequest<Settings>("/system-admin/billing-config")
      .then((data) => { if (active) setSettings(data); })
      .catch((cause: unknown) => {
        if (!active) return;
        const saved = window.localStorage.getItem("mangora:system-notifications");
        if (saved) {
          try { setSettings({ emailConfigured: false, ...JSON.parse(saved) as Omit<Settings, "emailConfigured"> }); }
          catch { setSettings({ email: "", purchases: true, paid: true, pending: true, newRegistrations: true, emailConfigured: false }); }
        } else setSettings({ email: "", purchases: true, paid: true, pending: true, newRegistrations: true, emailConfigured: false });
        setMessage("A API ainda não disponibiliza esta função. Você pode salvar as preferências neste navegador; o envio por e-mail depende da atualização do servidor.");
      });
    return () => { active = false; };
  }, []);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!settings) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const { email, purchases, paid, pending, newRegistrations } = settings;
      const payload = { email: email.trim(), purchases, paid, pending, newRegistrations };
      try {
        await apiRequest<Settings>("/system-admin/billing-config", { method: "PATCH", body: JSON.stringify(payload) });
        setSettings({ ...payload, emailConfigured: settings.emailConfigured });
        setMessage("Preferências de notificação salvas no sistema.");
      } catch (cause) {
        if (!(cause instanceof Error) || !cause.message.includes("Cannot GET") && !cause.message.includes("Cannot PATCH")) throw cause;
        window.localStorage.setItem("mangora:system-notifications", JSON.stringify(payload));
        setSettings({ ...payload, emailConfigured: false });
        setMessage("Preferências salvas neste navegador. O envio de e-mails será ativado quando o backend atualizado estiver disponível.");
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível salvar as configurações.");
    } finally { setBusy(false); }
  }

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((current) => current ? { ...current, [key]: value } : current);
    setMessage("");
  }

  return <div className="mx-auto max-w-5xl space-y-5">
    <section className="overflow-hidden rounded-3xl border-2 border-[#123d2b] bg-[#fff8ea] shadow-[7px_8px_0_#ffb21a]">
      <div className="grid gap-5 p-5 sm:p-7 md:grid-cols-[1fr_auto] md:items-end">
        <div><span className="inline-flex items-center gap-2 rounded-full bg-[#123d2b] px-3 py-1.5 text-[9px] font-black uppercase tracking-[.16em] text-[#ffcf5a]"><BellRing className="size-3.5" /> Administração de notificações</span><h2 className="mt-4 text-2xl font-black text-[#123d2b] sm:text-3xl">Saiba quando algo importante acontece</h2><p className="mt-2 max-w-2xl text-xs leading-5 text-[#597064]">Escolha quais eventos da plataforma devem chegar ao e-mail da equipe financeira ou administrativa.</p></div>
        <div className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-[10px] font-black ${settings?.emailConfigured ? "border-green-200 bg-green-50 text-green-800" : "border-amber-200 bg-amber-50 text-amber-900"}`}><span className={`size-2.5 rounded-full ${settings?.emailConfigured ? "bg-green-500" : "bg-amber-500"}`} />{settings?.emailConfigured ? "E-mail do servidor conectado" : "E-mail do servidor não configurado"}</div>
      </div>
    </section>

      {error && <div role="alert" className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold leading-5 text-red-800"><ShieldCheck className="mt-0.5 size-4 shrink-0" /><p>{error}</p></div>}
    {message && <div role="status" className="flex items-center gap-2 rounded-2xl border border-green-200 bg-green-50 p-4 text-xs font-bold text-green-800"><CheckCircle2 className="size-4" />{message}</div>}
    {!settings && !error && <section role="status" className="rounded-2xl border border-[#123d2b]/15 bg-[#fffdf8] p-8 text-center text-xs font-bold text-[#597064]">Carregando preferências…</section>}

    {settings && <form onSubmit={save} className="space-y-5">
      <section className="rounded-3xl border border-[#123d2b]/15 bg-[#fffdf8] p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#e9f3ec] text-[#123d2b]"><Mail className="size-5" /></span><div><p className="text-[9px] font-black uppercase tracking-[.15em] text-[#a93a05]">Destino</p><h3 className="mt-1 text-sm font-black text-[#123d2b]">E-mail que recebe os avisos</h3><p className="mt-1 text-[10px] leading-4 text-[#597064]">Um único endereço centraliza as notificações selecionadas abaixo.</p></div></div>
        <label className="mt-5 block max-w-2xl text-[10px] font-bold text-[#315847]">Endereço de e-mail<input type="email" maxLength={254} value={settings.email} disabled={busy} onChange={(event) => update("email", event.target.value)} placeholder="financeiro@empresa.com.br" className="mt-2 block h-12 w-full rounded-xl border border-[#123d2b]/20 bg-white px-4 text-sm font-medium text-[#123d2b] outline-none transition placeholder:text-[#9aa99f] focus:border-[#ce4a0a] focus:ring-2 focus:ring-[#ce4a0a]/15 disabled:opacity-60" /><span className="mt-2 block font-normal text-[#789083]">Deixe vazio para suspender o envio de todos os avisos.</span></label>
      </section>

      <section className="rounded-3xl border border-[#123d2b]/15 bg-[#fffdf8] p-5 shadow-sm sm:p-6">
        <div className="flex items-start justify-between gap-4"><div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#fff0dd] text-[#b94713]"><Settings2 className="size-5" /></span><div><p className="text-[9px] font-black uppercase tracking-[.15em] text-[#a93a05]">Eventos</p><h3 className="mt-1 text-sm font-black text-[#123d2b]">O que você quer acompanhar?</h3><p className="mt-1 text-[10px] leading-4 text-[#597064]">Ative somente os avisos úteis para sua rotina.</p></div></div><span className="hidden rounded-full bg-[#f5f4ed] px-3 py-1.5 text-[9px] font-bold text-[#597064] sm:inline-flex">{eventCards.filter((item) => settings[item.key]).length} de {eventCards.length} ativos</span></div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">{eventCards.map(({ key, title, description, icon: Icon, tag }) => { const enabled = settings[key]; return <label key={key} className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${enabled ? "border-[#123d2b]/25 bg-[#f4f8f3]" : "border-[#123d2b]/10 bg-white hover:bg-[#faf9f4]"}`}><span className={`grid size-10 shrink-0 place-items-center rounded-xl ${enabled ? "bg-[#123d2b] text-[#ffcf5a]" : "bg-[#f5f4ed] text-[#789083]"}`}><Icon className="size-4.5" /></span><span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-2"><span className="text-xs font-black text-[#123d2b]">{title}</span><span className="rounded-full bg-white px-2 py-0.5 text-[8px] font-black tracking-wide text-[#789083]">{tag}</span></span><span className="mt-1 block text-[10px] leading-4 text-[#597064]">{description}</span></span><span className={`relative mt-1 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${enabled ? "bg-[#147a45]" : "bg-[#d5dbd5]"}`}><input type="checkbox" checked={enabled} disabled={busy} onChange={(event) => update(key, event.target.checked)} className="peer sr-only" aria-label={title} /><span className={`pointer-events-none absolute size-4 rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-6" : "translate-x-1"}`} />{enabled && <Check className="pointer-events-none absolute left-1.5 size-3 text-white" />}</span></label>; })}</div>
      </section>

      {!settings.emailConfigured && <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-[10px] leading-5 text-amber-900"><Building2 className="mt-0.5 size-4 shrink-0" /><p><strong>O envio por e-mail ainda não foi ativado no servidor.</strong> As preferências desta tela ficam salvas neste navegador, mas não conseguem disparar e-mails até a API atualizada receber o deploy.</p></div>}

      <div className="sticky bottom-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#123d2b]/10 bg-[#fffdf8]/95 p-3 shadow-lg backdrop-blur"><p className="hidden items-center gap-2 pl-2 text-[10px] text-[#597064] sm:flex"><CreditCard className="size-4" />As notificações incluem os dados da empresa e do evento.</p><button type="submit" disabled={busy} className="ml-auto flex h-11 items-center justify-center gap-2 rounded-xl bg-[#ce4a0a] px-5 text-xs font-black text-white shadow-[0_3px_0_#963203] transition hover:bg-[#b94108] disabled:cursor-wait disabled:opacity-60"><Save className="size-4" />{busy ? "Salvando…" : "Salvar preferências"}</button></div>
    </form>}
  </div>;
}
