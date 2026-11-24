"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUpRight, LoaderCircle, Save, Sparkles } from "lucide-react";
import { apiRequest } from "@/lib/api/client";
import { blackFridayPreset, landingLayouts, layoutDraft, switchLandingLayout, type LandingConfig, type LandingLayout, type LandingLayoutDraft } from "@/lib/marketing";
import LayoutThumbnail from "@/components/marketing/LayoutThumbnail";
import { useT } from "@/i18n/provider";

const field = "mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-2 focus-visible:outline-orange-600 disabled:opacity-60";
const button = "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 disabled:cursor-not-allowed disabled:opacity-60";
const secondaryButton = `${button} border-slate-300 bg-white hover:bg-orange-50`;

export default function LandingConfigPanel({ onDirtyChange }: { onDirtyChange?: (dirty: boolean) => void }) {
  const t = useT();
  const [config, setConfig] = useState<LandingConfig | null>(null);
  const [saved, setSaved] = useState("");
  const [error, setError] = useState("");
  const [invalidField, setInvalidField] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const data = await apiRequest<LandingConfig>("/system-admin/landing", { signal });
      if (signal?.aborted) return;
      setConfig(data); setSaved(JSON.stringify(data)); setError("");
    } catch (cause) { if (!signal?.aborted) setError(cause instanceof Error ? cause.message : t("systemAdmin.landing.loadError")); }
  }, [t]);
  useEffect(() => {
    const abort = new AbortController();
    void Promise.resolve().then(() => { if (!abort.signal.aborted) return load(abort.signal); });
    return () => abort.abort();
  }, [load]);
  const dirty = !!config && JSON.stringify(config) !== saved;
  useEffect(() => { onDirtyChange?.(dirty); }, [dirty, onDirtyChange]);
  useEffect(() => () => onDirtyChange?.(false), [onDirtyChange]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  function update<K extends keyof LandingConfig>(key: K, value: LandingConfig[K]) {
    setConfig(current => current ? { ...current, [key]: value } : current); setMessage(""); setInvalidField("");
  }
  function preset(theme: LandingLayout): LandingLayoutDraft {
    return { theme, headline: t(`systemAdmin.landing.layouts.${theme}.headline`), description: t(`systemAdmin.landing.layouts.${theme}.copy`), ctaLabel: t(`systemAdmin.landing.layouts.${theme}.cta`) };
  }
  function selectLayout(theme: LandingLayout, applyOffer = false) {
    if (config && theme !== config.theme) {
      const fields = [["headline", "campaign-headline", 80], ["description", "campaign-description", 240], ["ctaLabel", "campaign-cta", 40]] as const;
      const invalid = fields.find(([key, , max]) => config[key].trim().length < 3 || config[key].length > max);
      if (invalid) { setError(t("systemAdmin.landing.finishText")); setInvalidField(invalid[1]); document.getElementById(invalid[1])?.focus(); return; }
    }
    setConfig(current => {
      if (!current) return current;
      const next = switchLandingLayout(current, theme, preset(theme));
      return applyOffer ? { ...next, promotionEnabled: true, discountPercent: blackFridayPreset.discountPercent, discountMonths: blackFridayPreset.discountMonths, startsAt: null, endsAt: null } : next;
    });
    setMessage(""); setError(""); setInvalidField("");
  }
  const validation = (id: string) => ({ "aria-invalid": invalidField === id, "aria-describedby": invalidField === id ? "campaign-error" : undefined });
  async function save(event: FormEvent) {
    event.preventDefault();
    if (!config || busy) return;
    setMessage(""); setError("");
    const invalid = form.current?.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(":invalid");
    if (invalid) { setInvalidField(invalid.id); setError(t("systemAdmin.landing.validation")); invalid.focus(); return; }
    if (config.startsAt && config.endsAt && config.startsAt >= config.endsAt) {
      setInvalidField("campaign-end"); setError(t("systemAdmin.landing.dateError")); form.current?.querySelector<HTMLInputElement>("#campaign-end")?.focus(); return;
    }
    setBusy(true);
    try {
      const { theme, promotionEnabled, headline, description, ctaLabel, discountPercent, discountMonths, startsAt, endsAt } = config;
      const data = await apiRequest<LandingConfig>("/system-admin/landing", { method: "PATCH", body: JSON.stringify({
        theme, promotionEnabled, headline: headline.trim(), description: description.trim(), ctaLabel: ctaLabel.trim(),
        discountPercent, discountMonths, startsAt, endsAt,
        layoutDrafts: [...(config.layoutDrafts ?? []).filter(draft => draft.theme !== config.theme), { ...layoutDraft(config), headline: headline.trim(), description: description.trim(), ctaLabel: ctaLabel.trim() }],
      }) });
      setConfig(data); setSaved(JSON.stringify(data)); setMessage(t("systemAdmin.landing.saved"));
    } catch (cause) { setError(cause instanceof Error ? cause.message : t("systemAdmin.landing.saveError")); }
    finally { setBusy(false); }
  }
  if (!config) return <div className="rounded-2xl bg-white p-6">{error ? <><p role="alert">{error}</p><button className={`${secondaryButton} mt-4`} onClick={() => void load()}>{t("systemAdmin.landing.retry")}</button></> : <p role="status" className="flex items-center gap-2"><LoaderCircle className="size-5 motion-safe:animate-spin" />{t("systemAdmin.landing.loading")}</p>}</div>;
  const publishedTheme = saved ? (JSON.parse(saved) as LandingConfig).theme : config.theme;
  return <div className="space-y-5">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-orange-800">Marketing / Mangora</p><h2 className="mt-2 text-2xl font-black">{t("systemAdmin.landing.title")}</h2><p className="mt-2 max-w-2xl text-sm text-slate-600">{t("systemAdmin.landing.intro")}</p></div><Link href="/" target="_blank" rel="noopener noreferrer" className={secondaryButton}>{t("systemAdmin.landing.open")}<ArrowUpRight className="size-4" /></Link></div>
    <fieldset disabled={busy} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <legend className="px-2 text-lg font-extrabold">{t("systemAdmin.landing.library")}</legend>
      <p className="mb-5 max-w-3xl text-sm leading-6 text-slate-600">{t("systemAdmin.landing.libraryHint")}</p>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">{landingLayouts.map(theme => <button key={theme} type="button" aria-pressed={config.theme === theme} onClick={() => selectLayout(theme)} className={`landing-layout-choice ${config.theme === theme ? "landing-layout-choice--selected" : ""}`}>
        <LayoutThumbnail layout={theme} />
        <span className="landing-layout-choice__heading"><strong>{t(`systemAdmin.landing.layouts.${theme}.name`)}</strong>{publishedTheme === theme && <span>{t("systemAdmin.landing.published")}</span>}</span>
        <span className="landing-layout-choice__description">{t(`systemAdmin.landing.layouts.${theme}.description`)}</span>
        <span className="landing-layout-choice__action">{t(config.theme === theme ? "systemAdmin.landing.selectedLayout" : "systemAdmin.landing.chooseLayout")}</span>
      </button>)}</div>
    </fieldset>
    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
      <form noValidate ref={form} onSubmit={save} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <fieldset disabled={busy} className="space-y-5">
          <legend className="text-lg font-extrabold">{t("systemAdmin.landing.appearance")}</legend>
          <p className="text-sm font-semibold text-slate-600">{t("systemAdmin.landing.editingLayout", { name: t(`systemAdmin.landing.layouts.${config.theme}.name`) })}</p>
          <label className="block text-sm font-bold" htmlFor="campaign-headline">{t("systemAdmin.landing.headline")}<input id="campaign-headline" {...validation("campaign-headline")} required minLength={3} maxLength={80} value={config.headline} onChange={e => update("headline", e.target.value)} className={field} /></label>
          <div><label className="block text-sm font-bold" htmlFor="campaign-description">{t("systemAdmin.landing.description")}</label><textarea id="campaign-description" {...validation("campaign-description")} required minLength={3} maxLength={240} rows={4} value={config.description} onChange={e => update("description", e.target.value)} className={`${field} resize-none`} /></div>
          <label className="block text-sm font-bold" htmlFor="campaign-cta">{t("systemAdmin.landing.cta")}<input id="campaign-cta" {...validation("campaign-cta")} required minLength={3} maxLength={40} value={config.ctaLabel} onChange={e => update("ctaLabel", e.target.value)} className={field} /></label>
        </fieldset>
        <fieldset disabled={busy} className="space-y-4 border-t border-slate-200 pt-5">
          <legend className="pt-5 text-lg font-extrabold">{t("systemAdmin.landing.offer")}</legend>
          <button type="button" className={secondaryButton} onClick={() => selectLayout("black-friday", true)}><Sparkles className="size-4" />{t("systemAdmin.landing.preset")}</button>
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-bold"><input type="checkbox" checked={config.promotionEnabled} onChange={e => update("promotionEnabled", e.target.checked)} className="size-5 accent-orange-600" />{t("systemAdmin.landing.enabled")}</label>
          <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold" htmlFor="campaign-percent">{t("systemAdmin.landing.percent")}<input id="campaign-percent" {...validation("campaign-percent")} type="number" required min={1} max={90} step={1} value={config.discountPercent} onChange={e => update("discountPercent", Number(e.target.value))} className={field} /></label><label className="text-sm font-bold" htmlFor="campaign-months">{t("systemAdmin.landing.months")}<input id="campaign-months" {...validation("campaign-months")} type="number" required min={1} max={12} step={1} value={config.discountMonths} onChange={e => update("discountMonths", Number(e.target.value))} className={field} /></label></div>
          <p className="text-xs leading-6 text-slate-600">{t("systemAdmin.landing.rules")}</p>
          <div className="grid gap-4 sm:grid-cols-2">{(["startsAt", "endsAt"] as const).map(key => <label key={key} className="text-sm font-bold" htmlFor={key === "endsAt" ? "campaign-end" : "campaign-start"}>{t(`systemAdmin.landing.${key}`)}<input id={key === "endsAt" ? "campaign-end" : "campaign-start"} type="date" {...validation(key === "endsAt" ? "campaign-end" : "campaign-start")} value={config[key]?.slice(0, 10) ?? ""} onChange={e => update(key, e.target.value ? `${e.target.value}T03:00:00.000Z` : null)} className={field} /></label>)}</div>
          <p className="text-xs leading-6 text-slate-600">{t("systemAdmin.landing.schedule")}</p>
        </fieldset>
        <div className="min-h-6 text-sm">{error && <p id="campaign-error" role="alert" className="text-red-800">{error}</p>}{message && <p role="status" className="text-green-800">{message}</p>}{dirty && <p className="text-amber-800">{t("systemAdmin.landing.unsaved")}</p>}</div>
        <button disabled={busy || !dirty} className={`${button} w-full border-orange-700 bg-orange-700 text-white hover:bg-orange-800`}>{busy ? <LoaderCircle className="size-4 motion-safe:animate-spin" /> : <Save className="size-4" />}{t("systemAdmin.landing.save")}</button>
      </form>
      <aside className="space-y-4 xl:sticky xl:top-24"><h3 className="text-sm font-bold">{t("systemAdmin.landing.preview")} · {t(`systemAdmin.landing.layouts.${config.theme}.name`)}</h3><div className={`campaign-preview campaign-preview--${config.theme} ${config.theme === "black-friday" ? "campaign-preview--black" : ""}`}>
        <p className="campaign-preview__eyebrow">{config.theme === "black-friday" ? "BLACK FRIDAY / MANGORA" : "MANGORA"}</p>
        <h4>{config.headline}</h4><p className="campaign-preview__description">{config.description}</p>
        {config.promotionEnabled && <p className="campaign-preview__discount"><strong>{config.discountPercent}%</strong><span>OFF · {t("systemAdmin.landing.previewPeriod", { months: config.discountMonths })}</span></p>}
        <span className="campaign-preview__cta">{config.ctaLabel}<ArrowUpRight className="size-5" /></span>
        {(config.theme === "showcase" || config.theme === "editorial") && <LayoutThumbnail layout={config.theme} />}
      </div><p className="text-xs leading-6 text-slate-600">{t("systemAdmin.landing.previewNote")}</p></aside>
    </div>
  </div>;
}
