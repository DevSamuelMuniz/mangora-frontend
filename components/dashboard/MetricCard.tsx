import {
  ArrowDownRight,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";

type MetricCardProps = {
  title: string;
  value: string;
  description: string;
  variation?: string;
  trend?: "up" | "down" | "neutral";
  icon: LucideIcon;
  iconClassName?: string;
};

export default function MetricCard({
  title,
  value,
  description,
  variation,
  trend = "neutral",
  icon: Icon,
  iconClassName = "bg-violet-50 text-violet-600",
}: MetricCardProps) {
  const trendClassName =
    trend === "up"
      ? "bg-emerald-50 text-emerald-600"
      : trend === "down"
        ? "bg-red-50 text-red-600"
        : "bg-slate-100 text-slate-500";

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-violet-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}
        >
          <Icon className="size-4.5" />
        </div>

        {variation && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ${trendClassName}`}
          >
            {trend === "up" && (
              <ArrowUpRight className="size-3" />
            )}

            {trend === "down" && (
              <ArrowDownRight className="size-3" />
            )}

            {variation}
          </span>
        )}
      </div>

      <div className="mt-4">
        <p className="text-[11px] font-medium text-slate-500">
          {title}
        </p>

        <p className="mt-1 text-2xl font-black tracking-tight text-slate-950">
          {value}
        </p>

        <p className="mt-1.5 text-[10px] text-slate-400">
          {description}
        </p>
      </div>
    </article>
  );
}