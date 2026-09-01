"use client";

import { useEffect, useState } from "react";
import { LoaderCircle, Star, Trash2 } from "lucide-react";

import { apiRequest } from "@/lib/api/client";
import { formatDate } from "@/lib/format";

type Review = { id: string; reviewerName: string; rating: number; comment: string; createdAt: string };
type ReviewsData = { stats: { count: number; average: number; distribution: Record<number, number> }; reviews: Review[] };

export default function ReviewsPanel() {
  const [data, setData] = useState<ReviewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    apiRequest<ReviewsData>("/reviews")
      .then((result) => { if (alive) setData(result); })
      .catch((cause) => { if (alive) setError(cause instanceof Error ? cause.message : "Não foi possível carregar as avaliações."); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  async function remove(id: string) {
    if (!window.confirm("Remover esta avaliação? Ela desaparece da sua página online.")) return;
    setBusyId(id);
    try {
      await apiRequest<void>(`/reviews/${id}`, { method: "DELETE" });
      setData((prev) => prev ? { ...prev, reviews: prev.reviews.filter((review) => review.id !== id) } : prev);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível remover a avaliação.");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <div className="flex min-h-72 items-center justify-center text-xs text-slate-500"><LoaderCircle className="mr-2 size-5 animate-spin text-orange-500" />Carregando avaliações...</div>;

  const stats = data?.stats;
  const maxCount = stats ? Math.max(1, ...Object.values(stats.distribution)) : 1;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-orange-600">Reputação</p>
        <h1 className="mt-1 text-2xl font-black sm:text-3xl">Avaliações</h1>
        <p className="mt-1 text-xs text-slate-500">O que os clientes dizem da sua página online — remova avaliações indevidas.</p>
      </div>

      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">{error}</div>}

      {stats && (
        <section className="grid gap-4 md:grid-cols-[220px_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
            <p className="font-[family-name:var(--font-bricolage)] text-5xl font-black text-slate-950">{stats.count ? stats.average.toFixed(1) : "—"}</p>
            <div className="mt-2 flex justify-center">{Array.from({ length: 5 }, (_, i) => <Star key={i} className={`size-4 ${i < Math.round(stats.average) ? "fill-orange-500 text-orange-500" : "text-slate-300"}`} />)}</div>
            <p className="mt-2 font-mono text-[10px] text-slate-400">{stats.count ? `${stats.count} avaliação(ões)` : "Ainda sem avaliações"}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold text-slate-700">Distribuição das notas</p>
            <div className="mt-3 space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-2">
                  <span className="w-6 text-right font-mono text-[10px] font-bold text-slate-500">{rating}★</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-orange-500" style={{ width: `${(stats.distribution[rating] ?? 0) / maxCount * 100}%` }} />
                  </div>
                  <span className="w-8 font-mono text-[10px] text-slate-400">{stats.distribution[rating] ?? 0}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4"><h2 className="text-sm font-black">Todas as avaliações</h2><p className="text-[10px] text-slate-400">Exibidas na sua página online.</p></div>
        <div className="divide-y divide-slate-100">
          {data?.reviews.length ? data.reviews.map((review) => (
            <div key={review.id} className="flex items-start justify-between gap-3 px-5 py-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs font-black text-slate-900">{review.reviewerName}</p>
                  <div className="flex">{Array.from({ length: 5 }, (_, i) => <Star key={i} className={`size-3 ${i < review.rating ? "fill-orange-500 text-orange-500" : "text-slate-300"}`} />)}</div>
                  <span className="font-mono text-[9px] text-slate-400">{formatDate(review.createdAt)}</span>
                </div>
                {review.comment && <p className="mt-1.5 text-xs leading-5 text-slate-600">{review.comment}</p>}
              </div>
              <button type="button" onClick={() => void remove(review.id)} disabled={busyId === review.id} className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:border-red-300 hover:text-red-600 disabled:opacity-50" aria-label={`Remover avaliação de ${review.reviewerName}`}>{busyId === review.id ? <LoaderCircle className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}</button>
            </div>
          )) : <div className="p-10 text-center"><Star className="mx-auto size-7 text-slate-300" /><p className="mt-3 text-sm font-bold text-slate-600">Nenhuma avaliação ainda</p><p className="mt-1 text-[10px] text-slate-400">Quando clientes avaliarem sua página online, elas aparecem aqui.</p></div>}
        </div>
      </section>
    </div>
  );
}
