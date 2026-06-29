import type { TrackingProvider } from "@/types/order";

export const TRACKING_PROVIDERS: { id: TrackingProvider; label: string }[] = [
  { id: "delhivery", label: "Delhivery" },
  { id: "bluedart", label: "Blue Dart" },
  { id: "dtdc", label: "DTDC" },
  { id: "indiapost", label: "India Post" },
  { id: "shiprocket", label: "Shiprocket" },
  { id: "other", label: "Other" },
];

export function getProviderLabel(provider?: TrackingProvider): string {
  if (!provider) return "—";
  return TRACKING_PROVIDERS.find((p) => p.id === provider)?.label ?? provider;
}
