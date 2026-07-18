export default function SalesLoading() {
  return (
    <div role="status" aria-label="Carregando vendas" className="animate-pulse">
      <div className="flex items-end justify-between gap-4">
        <div><div className="h-3 w-16 rounded-full bg-violet-100" /><div className="mt-3 h-8 w-32 rounded-lg bg-slate-200" /><div className="mt-2 h-3 w-64 max-w-full rounded-full bg-slate-200" /></div>
        <div className="hidden h-11 w-32 rounded-xl bg-violet-200 sm:block" />
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[1, 2, 3, 4].map((item) => <div key={item} className="h-24 rounded-2xl border border-slate-200 bg-white" />)}</div>
      <div className="mt-4 h-20 rounded-2xl border border-slate-200 bg-white" />
      <div className="mt-4 h-96 rounded-2xl border border-slate-200 bg-white" />
    </div>
  );
}
