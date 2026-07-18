export default function ProductsLoading() {
  return (
    <div role="status" aria-label="Carregando produtos" className="animate-pulse">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="h-3 w-20 rounded-full bg-violet-100" />
          <div className="mt-3 h-8 w-40 rounded-lg bg-slate-200" />
          <div className="mt-2 h-3 w-72 max-w-full rounded-full bg-slate-200" />
        </div>
        <div className="hidden h-11 w-36 rounded-xl bg-violet-200 sm:block" />
      </div>
      <div className="mt-5 h-20 rounded-2xl border border-slate-200 bg-white" />
      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="h-11 border-b border-slate-200 bg-slate-50" />
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div key={item} className="flex h-16 items-center gap-4 border-b border-slate-100 px-5 last:border-0">
            <div className="size-10 rounded-xl bg-slate-100" />
            <div className="h-3 w-48 rounded-full bg-slate-100" />
            <div className="ml-auto h-3 w-24 rounded-full bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
