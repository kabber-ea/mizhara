import type { DeliveryStatus, TrackingProvider } from "@/types/order";
import { DEFAULT_TRACKING_PROVIDER } from "@/constants/tracking";

export const DEFAULT_DELIVERY_STATUS: DeliveryStatus = "processing";

export type FulfillmentForm = {
  deliveryStatus: DeliveryStatus;
  trackingProvider: TrackingProvider;
  trackingNumber: string;
  trackingUrl: string;
};

export const DEFAULT_FULFILLMENT_FORM: FulfillmentForm = {
  deliveryStatus: DEFAULT_DELIVERY_STATUS,
  trackingProvider: DEFAULT_TRACKING_PROVIDER,
  trackingNumber: "",
  trackingUrl: "",
};
