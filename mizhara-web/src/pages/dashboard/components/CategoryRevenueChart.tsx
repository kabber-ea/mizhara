import { useMemo } from "react";
import ChartCard from "@/components/ChartCard";
import { formatINR } from "@/utils/format";
import { categoryColor } from "@/utils/chartUtils";
import { DASHBOARD_PANEL_MIN_HEIGHT, TOP_CATEGORY_LIMIT, DASHBOARD_LOOKBACK_LABEL_LOWER } from "@/constants/dashboard";
import type { CategorySales } from "@/types/dashboard";

function ProportionStrip({ items, total }: { items: CategorySales[]; total: number }) {
  if (total <= 0) return null;

  return (
    <div
      className="flex h-2.5 w-full overflow-hidden rounded-full bg-accent-pink/30 ring-1 ring-border-custom/50"
      role="img"
      aria-label="Category revenue mix"
    >
      {items.map((item, i) => {
        const width = (item.revenue / total) * 100;
        if (width < 0.4) return null;

        return (
          <div
            key={item.category}
            className="h-full transition-opacity hover:opacity-80"
            style={{ width: `${width}%`, backgroundColor: categoryColor(i) }}
            title={`${item.category} · ${Math.round(width)}%`}
          />
        );
      })}
    </div>
  );
}

function CategoryRow({
  item,
  index,
  share,
  compact,
}: {
  item: CategorySales;
  index: number;
  share: number;
  compact: boolean;
}) {
  const color = categoryColor(index);

  return (
    <div className="group relative h-full min-h-0 overflow-hidden rounded-md">
      <div
        className="absolute inset-y-0 left-0 opacity-20 transition-opacity group-hover:opacity-30"
        style={{ width: `${Math.max(share, share === 0 ? 0 : 4)}%`, backgroundColor: color }}
        aria-hidden
      />
      <div className="relative grid h-full grid-cols-[0.625rem_minmax(0,1fr)_5rem_2.25rem] items-center gap-2 px-2">
        <span
          className={`shrink-0 rounded-[3px] ring-1 ring-black/5 ${compact ? "h-2 w-2" : "h-2.5 w-2.5"}`}
          style={{ backgroundColor: color }}
          aria-hidden
        />
        <p
          className={`truncate font-medium leading-none text-primary-dark ${compact ? "text-[10px]" : "text-[11px]"}`}
        >
          {item.category}
        </p>
        <p
          className={`truncate text-right tabular-nums leading-none text-muted-custom ${compact ? "text-[9px]" : "text-[10px]"}`}
        >
          {formatINR(item.revenue)}
        </p>
        <p
          className={`text-right font-semibold tabular-nums leading-none ${compact ? "text-[10px]" : "text-[11px]"}`}
          style={{ color }}
        >
          {share}%
        </p>
      </div>
    </div>
  );
}

function CategoryRevenuePanel({ data }: { data: CategorySales[] }) {
  const items = useMemo(
    () => [...data].sort((a, b) => b.revenue - a.revenue).slice(0, TOP_CATEGORY_LIMIT),
    [data],
  );

  if (!items.length) {
    return (
      <div
        className="flex flex-1 items-center justify-center"
        style={{ minHeight: DASHBOARD_PANEL_MIN_HEIGHT }}
      >
        <p className="text-[11px] text-muted-custom">No category data yet</p>
      </div>
    );
  }

  const total = items.reduce((sum, item) => sum + item.revenue, 0);
  const compact = items.length >= 9;

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col" style={{ minHeight: DASHBOARD_PANEL_MIN_HEIGHT }}>
      <div className="mb-2 shrink-0">
        <ProportionStrip items={items} total={total} />
      </div>

      <div className="mb-1.5 grid shrink-0 grid-cols-[0.625rem_minmax(0,1fr)_5rem_2.25rem] gap-2 px-2 text-[8px] font-bold uppercase tracking-[0.1em] text-muted-custom">
        <span aria-hidden />
        <span>Category</span>
        <span className="text-right">Revenue</span>
        <span className="text-right">Share</span>
      </div>

      <div
        className="grid min-h-0 flex-1 gap-0.5"
        style={{ gridTemplateRows: `repeat(${items.length}, minmax(0, 1fr))` }}
      >
        {items.map((item, index) => {
          const share = total > 0 ? Math.round((item.revenue / total) * 100) : 0;
          return (
            <CategoryRow
              key={item.category}
              item={item}
              index={index}
              share={share}
              compact={compact}
            />
          );
        })}
      </div>
    </div>
  );
}

export default function CategoryRevenueChart({ data }: { data: CategorySales[] }) {
  return (
    <ChartCard title="Top Categories" subtitle={`Revenue mix · ${DASHBOARD_LOOKBACK_LABEL_LOWER}`}>
      <CategoryRevenuePanel data={data} />
    </ChartCard>
  );
}
