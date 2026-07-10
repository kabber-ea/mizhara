const KPI_ACCENTS = [
  { bg: "from-[#f8f3ed] to-white", accent: "text-primary", ring: "ring-primary/15" },
  { bg: "from-[#f0f5f2] to-white", accent: "text-[#5c9e7a]", ring: "ring-[#5c9e7a]/15" },
  { bg: "from-[#f5f0f3] to-white", accent: "text-[#8b5a6b]", ring: "ring-[#8b5a6b]/15" },
  { bg: "from-[#f8f4ee] to-white", accent: "text-accent-gold", ring: "ring-accent-gold/20" },
] as const;

function KpiIcon({ type }: { type: "revenue" | "orders" | "customers" | "shipments" }) {
  const paths = {
    revenue: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
    orders: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
      />
    ),
    customers: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
      />
    ),
    shipments: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2-2h8zm0 0l3 3m-3-3l3-3M3 16h10"
      />
    ),
  };

  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      {paths[type]}
    </svg>
  );
}

type KpiCardProps = {
  label: string;
  value: string;
  sub?: string;
  icon: "revenue" | "orders" | "customers" | "shipments";
  accentIndex?: number;
};

export default function KpiCard({ label, value, sub, icon, accentIndex = 0 }: KpiCardProps) {
  const accent = KPI_ACCENTS[accentIndex % KPI_ACCENTS.length];

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-border-custom/70 bg-gradient-to-br ${accent.bg} p-5 shadow-sm shadow-primary-dark/[0.04] transition-shadow duration-300 hover:shadow-md hover:shadow-primary-dark/[0.06]`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-custom">{label}</span>
          <p className="mt-2 font-serif text-2xl font-bold tracking-tight text-primary-dark tabular-nums sm:text-[1.65rem]">
            {value}
          </p>
          {sub && <p className="mt-1.5 text-[10px] leading-relaxed text-muted-custom">{sub}</p>}
        </div>
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/80 ring-1 ${accent.ring} ${accent.accent} shadow-sm`}
        >
          <KpiIcon type={icon} />
        </div>
      </div>
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/40 blur-2xl transition-opacity duration-300 group-hover:opacity-70" />
    </div>
  );
}
