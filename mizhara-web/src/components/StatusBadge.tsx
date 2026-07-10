const DELIVERY_COLORS: Record<string, string> = {
  processing: "bg-amber-50 text-amber-700 border-amber-200",
  shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const PAYMENT_COLORS: Record<string, string> = {
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  failed: "bg-rose-50 text-rose-700 border-rose-200",
};

type StatusBadgeProps = {
  status: string;
  type?: "delivery" | "payment";
};

export default function StatusBadge({ status, type = "delivery" }: StatusBadgeProps) {
  const colors = type === "payment" ? PAYMENT_COLORS : DELIVERY_COLORS;
  const label = status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <span
      className={`inline-flex h-5 min-w-[5.85rem] items-center justify-center rounded-full border px-2 text-center text-[10px] font-bold uppercase leading-none ${
        colors[status] ?? "bg-gray-50 text-gray-600 border-gray-200"
      }`}
    >
      {label}
    </span>
  );
}
