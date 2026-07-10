import type { DeliveryStatus } from "@/types/order";

export const DELIVERY_STATUS_ORDER: DeliveryStatus[] = ["processing", "shipped", "delivered"];

export const DELIVERY_FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
];

export const DELIVERY_OPTIONS: DeliveryStatus[] = ["processing", "shipped", "delivered"];

export const DELIVERY_LABELS: Record<DeliveryStatus, string> = {
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
};
