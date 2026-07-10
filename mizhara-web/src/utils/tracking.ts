import { TRACKING_PROVIDERS, TRACKING_URLS } from "@/constants/tracking";
import type { TrackingProvider } from "@/types/order";

export { TRACKING_PROVIDERS, DEFAULT_TRACKING_PROVIDER } from "@/constants/tracking";

export function getProviderLabel(provider?: TrackingProvider): string {
  if (!provider) return "—";
  return TRACKING_PROVIDERS.find((p) => p.id === provider)?.label ?? provider;
}

export function buildTrackingUrl(provider: TrackingProvider, trackingNumber: string, customUrl = ""): string {
  const trimmed = trackingNumber.trim();
  if (!trimmed) return "";
  const custom = customUrl.trim();
  if (custom) return custom;
  if (provider === "other") return "";

  const build = TRACKING_URLS[provider];
  return build ? build(trimmed) : "";
}
