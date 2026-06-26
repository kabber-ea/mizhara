const DELIVERY_COLORS: Record<string, string> = {
  processing: "bg-amber-50 text-amber-700 border-amber-200",
  packed: "bg-blue-50 text-blue-700 border-blue-200",
  shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
  out_for_delivery: "bg-purple-50 text-purple-700 border-purple-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200",
  returned: "bg-orange-50 text-orange-700 border-orange-200",
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
  const label = status.replace(/_/g, " ");

  return (
    <span
      className={`inline-flex px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border ${
        colors[status] ?? "bg-gray-50 text-gray-600 border-gray-200"
      }`}
    >
      {label}
    </span>
  );
}
