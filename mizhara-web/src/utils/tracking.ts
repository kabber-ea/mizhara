import { TRACKING_PROVIDERS } from "@/constants/tracking";
import type { TrackingProvider } from "@/types/order";

export { TRACKING_PROVIDERS } from "@/constants/tracking";

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

  const encoded = encodeURIComponent(trimmed);
  switch (provider) {
    case "delhivery":
      return `https://www.delhivery.com/track/package/${encoded}`;
    case "bluedart":
      return `https://www.bluedart.com/web/guest/trackdartresultthirdparty?trackFor=0&trackNo=${encoded}`;
    case "dtdc":
      return `https://www.dtdc.in/tracking.asp?strCnno=${encoded}`;
    case "indiapost":
      return `https://www.indiapost.gov.in/_layouts/15/DOP.Portal.Tracking/TrackConsignment.aspx?consignmentnumber=${encoded}`;
    case "shiprocket":
      return `https://shiprocket.co/tracking/${encoded}`;
    default:
      return "";
  }
}
