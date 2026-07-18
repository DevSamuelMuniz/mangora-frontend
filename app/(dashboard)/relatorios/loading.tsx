export default function ReportsLoading() {
  return (
    <div role="status" aria-label="Carregando relatórios" className="animate-pulse space-y-4">
      <div className="flex items-end justify-between gap-4"><div><div className="h-3 w-36 rounded bg-violet-100" /><div className="mt-3 h-8 w-40 rounded-lg bg-slate-200" /><div className="mt-2 h-3 w-72 max-w-full rounded bg-slate-100" /></div><div className="hidden h-11 w-80 rounded-xl bg-slate-200 sm:block" /></div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[1, 2, 3, 4].map((item) => <div key={item} className="h-32 rounded-2xl border border-slate-200 bg-white" />)}</div>
      <div className="grid gap-4 xl:grid-cols-[1.45fr_0.55fr]"><div className="h-80 rounded-2xl border border-slate-200 bg-white" /><div className="h-80 rounded-2xl border border-slate-200 bg-white" /></div>
      <div className="h-96 rounded-2xl border border-slate-200 bg-white" />
    </div>
  );
}
