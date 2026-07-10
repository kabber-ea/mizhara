import { DELIVERY_STATUS_BADGE_COLORS, PAYMENT_STATUS_BADGE_COLORS } from "@/constants/statusBadge";

type StatusBadgeProps = {
  status: string;
  type?: "delivery" | "payment";
};

export default function StatusBadge({ status, type = "delivery" }: StatusBadgeProps) {
  const colors = type === "payment" ? PAYMENT_STATUS_BADGE_COLORS : DELIVERY_STATUS_BADGE_COLORS;
  const label = status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <span
      className={`inline-flex h-5 items-center justify-center rounded-full border px-1.5 text-center text-[10px] font-bold uppercase leading-none tracking-wide ${
        colors[status] ?? "bg-gray-50 text-gray-600 border-gray-200"
      }`}
    >
      {label}
    </span>
  );
}
