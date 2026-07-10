import { CATEGORY_COLORS, DELIVERY_STATUS_COLORS } from "@/constants/charts";

export { CHART_COLORS, DELIVERY_STATUS_COLORS, CATEGORY_COLORS, chartMargin, axisTick } from "@/constants/charts";

export function categoryColor(index: number) {
  return CATEGORY_COLORS[index % CATEGORY_COLORS.length];
}

export function deliveryStatusColor(status: string, index: number) {
  return DELIVERY_STATUS_COLORS[status] ?? ["#9a7358", "#7ba38c", "#c4a484"][index % 3];
}

export function formatStatusLabel(status: string) {
  return status.replace(/_/g, " ");
}
