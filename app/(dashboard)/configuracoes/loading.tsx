import { getTranslator } from "@/i18n/server";

export default async function SettingsLoading() {
  const { t } = await getTranslator();
  return (
<<<<<<< HEAD
    <div role="status" aria-label="Carregando configurações" className="animate-pulse">
=======
    <div role="status" aria-label={t("pageMeta.loading.configuracoes")} className="animate-pulse">
>>>>>>> 0e59a660a5acf0b652a188ddf2e8ccc96de79e4d
      <div><div className="h-3 w-24 rounded-full bg-orange-100" /><div className="mt-3 h-8 w-48 rounded-lg bg-slate-200" /><div className="mt-2 h-3 w-72 max-w-full rounded-full bg-slate-200" /></div>
      <div className="mt-5 grid items-start gap-4 lg:grid-cols-[240px_1fr]"><div className="h-72 rounded-2xl border border-slate-200 bg-white" /><div className="h-[520px] rounded-2xl border border-slate-200 bg-white" /></div>
    </div>
  );
}
