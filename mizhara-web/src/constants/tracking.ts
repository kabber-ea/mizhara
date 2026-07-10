import type { TrackingProvider } from "@/types/order";

export const DEFAULT_TRACKING_PROVIDER: TrackingProvider = "delhivery";

export const TRACKING_URLS: Record<Exclude<TrackingProvider, "other">, (trackingNumber: string) => string> = {
  delhivery: (n) => `https://www.delhivery.com/track/package/${encodeURIComponent(n)}`,
  bluedart: (n) =>
    `https://www.bluedart.com/web/guest/trackdartresultthirdparty?trackFor=0&trackNo=${encodeURIComponent(n)}`,
  dtdc: (n) => `https://www.dtdc.in/tracking.asp?strCnno=${encodeURIComponent(n)}`,
  indiapost: (n) =>
    `https://www.indiapost.gov.in/_layouts/15/DOP.Portal.Tracking/TrackConsignment.aspx?consignmentnumber=${encodeURIComponent(n)}`,
  shiprocket: (n) => `https://shiprocket.co/tracking/${encodeURIComponent(n)}`,
};

export const TRACKING_PROVIDERS: { id: TrackingProvider; label: string }[] = [
  { id: "delhivery", label: "Delhivery" },
  { id: "bluedart", label: "Blue Dart" },
  { id: "dtdc", label: "DTDC" },
  { id: "indiapost", label: "India Post" },
  { id: "shiprocket", label: "Shiprocket" },
  { id: "other", label: "Other" },
];
