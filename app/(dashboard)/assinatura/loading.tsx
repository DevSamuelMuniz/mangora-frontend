export default function SubscriptionLoading() {
  return (
    <div className="animate-pulse space-y-5" aria-label="Carregando assinatura">
      <div>
        <div className="h-3 w-24 rounded bg-violet-100" />
        <div className="mt-3 h-8 w-64 rounded-lg bg-slate-200" />
        <div className="mt-2 h-3 w-80 max-w-full rounded bg-slate-100" />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="h-52 rounded-2xl bg-violet-200" />
        <div className="h-52 rounded-2xl border border-slate-200 bg-white" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-96 rounded-2xl border border-slate-200 bg-white" />)}
      </div>
    </div>
  );
}
