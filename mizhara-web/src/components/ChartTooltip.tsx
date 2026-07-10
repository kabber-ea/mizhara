type TooltipContentProps = {
  active?: boolean;
  payload?: readonly { value?: unknown }[];
  label?: string | number;
};

export function renderChartTooltip(
  valueFormatter?: (v: number) => string,
  labelFormatter?: (l: string) => string,
) {
  return function ChartTooltipContent({ active, payload, label }: TooltipContentProps) {
    if (!active || !payload?.length) return null;
    const item = payload[0];
    const displayLabel = labelFormatter ? labelFormatter(String(label ?? "")) : String(label ?? "");
    const displayValue = valueFormatter ? valueFormatter(Number(item.value ?? 0)) : String(item.value ?? "");

    return (
      <div className="rounded-xl border border-border-custom/80 bg-white/95 px-3.5 py-2.5 shadow-xl shadow-primary-dark/8 backdrop-blur-sm">
        {displayLabel && (
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-custom">{displayLabel}</p>
        )}
        <p className="mt-0.5 font-serif text-lg font-bold text-primary-dark tabular-nums">{displayValue}</p>
      </div>
    );
  };
}
