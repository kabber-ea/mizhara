import type { TrackingProvider } from "@/types/order";

export const TRACKING_PROVIDERS: { id: TrackingProvider; label: string }[] = [
  { id: "delhivery", label: "Delhivery" },
  { id: "bluedart", label: "Blue Dart" },
  { id: "dtdc", label: "DTDC" },
  { id: "indiapost", label: "India Post" },
  { id: "shiprocket", label: "Shiprocket" },
  { id: "other", label: "Other" },
];

const TRACKING_URL_TEMPLATES: Record<Exclude<TrackingProvider, "other">, (n: string) => string> = {
  delhivery: (n) => `https://www.delhivery.com/track/package/${encodeURIComponent(n)}`,
  bluedart: (n) =>
    `https://www.bluedart.com/web/guest/trackdartresultthirdparty?trackFor=0&trackNo=${encodeURIComponent(n)}`,
  dtdc: (n) => `https://www.dtdc.in/tracking.asp?strCnno=${encodeURIComponent(n)}`,
  indiapost: (n) =>
    `https://www.indiapost.gov.in/_layouts/15/DOP.Portal.Tracking/TrackConsignment.aspx?consignmentnumber=${encodeURIComponent(n)}`,
  shiprocket: (n) => `https://shiprocket.co/tracking/${encodeURIComponent(n)}`,
};

export function buildTrackingUrl(
  provider: TrackingProvider,
  trackingNumber: string,
  customUrl?: string
): string | undefined {
  const trimmed = trackingNumber.trim();
  if (!trimmed) return undefined;
  if (customUrl?.trim()) return customUrl.trim();
  if (provider === "other") return undefined;
  return TRACKING_URL_TEMPLATES[provider](trimmed);
}

export function getProviderLabel(provider?: TrackingProvider): string {
  if (!provider) return "—";
  return TRACKING_PROVIDERS.find((p) => p.id === provider)?.label ?? provider;
}
