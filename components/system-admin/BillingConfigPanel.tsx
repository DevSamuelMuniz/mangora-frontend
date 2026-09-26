"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api/client";

type Settings = { email: string; purchases: boolean; paid: boolean; pending: boolean; emailConfigured: boolean };

export default function BillingConfigPanel() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => {
    let active = true;
    apiRequest<Settings>("/system-admin/billing-config").then((data) => { if (active) setSettings(data); }).catch((cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : "Não foi possível carregar as configurações."); });
    return () => { active = false; };
  }, []);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!settings) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const { email, purchases, paid, pending } = settings;
      setSettings(await apiRequest<Settings>("/system-admin/billing-config", { method: "PATCH", body: JSON.stringify({ email, purchases, paid, pending }) }));
      setMessage("Configurações salvas.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível salvar."); }
    finally { setBusy(false); }
  }

  return <section className="rounded-2xl border border-[#123d2b]/15 bg-[#fffdf8] p-5 shadow-sm">
    <h2 className="text-sm font-black">Avisos de assinaturas e pagamentos</h2>
    <p className="mt-2 text-sm text-[#597064]">Receba os avisos das empresas em um e-mail de gestão financeira.</p>
    {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
    {message && <p role="status" className="mt-4 text-sm text-green-700">{message}</p>}
    {!settings && !error && <p role="status" className="mt-4 text-sm">Carregando configurações…</p>}
    {settings && <form onSubmit={save} className="mt-5 max-w-xl space-y-5">
      {!settings.emailConfigured && <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">O envio de e-mail ainda não está configurado no servidor. Os avisos ficarão na fila até a configuração do SMTP.</p>}
      <label className="block text-sm font-bold">E-mail para receber os avisos
        <input type="email" maxLength={254} value={settings.email} disabled={busy} onChange={(event) => { setSettings({ ...settings, email: event.target.value }); setMessage(""); }} placeholder="financeiro@empresa.com.br" className="mt-2 block w-full rounded-xl border border-[#123d2b]/20 bg-white px-3 py-2 font-normal" />
        <span className="mt-2 block text-xs font-normal text-[#597064]">Deixe vazio para desativar todos os avisos.</span>
      </label>
      <fieldset disabled={busy} className="space-y-3"><legend className="mb-3 text-sm font-bold">Quando avisar</legend>
        {([['purchases', 'Compra de assinatura iniciada'], ['paid', 'Pagamento realizado'], ['pending', 'Pagamento pendente ou em atraso']] as const).map(([key, label]) => <label key={key} className="flex items-center gap-3 text-sm"><input type="checkbox" checked={settings[key]} onChange={(event) => { setSettings({ ...settings, [key]: event.target.checked }); setMessage(""); }} className="size-4 accent-[#123d2b]" />{label}</label>)}
      </fieldset>
      <p className="text-xs text-[#597064]">Avisos enviados quando a compra é iniciada ou o status da cobrança é informado pelo provedor. Incluem empresa, plano, valor e referência do pagamento.</p>
      <button type="submit" disabled={busy} className="rounded-xl bg-[#123d2b] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{busy ? "Salvando…" : "Salvar configurações"}</button>
    </form>}
  </section>;
}
