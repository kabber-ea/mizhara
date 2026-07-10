type ChartCardProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export default function ChartCard({ title, subtitle, children }: ChartCardProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border-custom/80 bg-white shadow-sm shadow-primary-dark/[0.03]">
      <div className="shrink-0 border-b border-border-custom/50 bg-gradient-to-r from-accent-pink/40 to-white px-5 py-4">
        <h3 className="font-serif text-sm font-semibold text-primary-dark">{title}</h3>
        {subtitle && <p className="mt-0.5 text-[10px] text-muted-custom">{subtitle}</p>}
      </div>
      <div className="overflow-hidden p-5 pt-4">{children}</div>
    </div>
  );
}
