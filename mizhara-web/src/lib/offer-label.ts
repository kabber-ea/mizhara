import type { Offer } from "@/types/offer";

export function offerAppliesToProduct(productId: string, offer: Offer): boolean {
  if (offer.scope === "all") return true;
  return (offer.productIds ?? []).includes(productId);
}

export function getProductBogoBadge(productId: string, offers: Offer[] = []): string | null {
  const bogo = offers.find((o) => o.type === "bogo" && offerAppliesToProduct(productId, o));
  if (!bogo) return null;
  return `B${bogo.buyQuantity}G${bogo.freeQuantity}`;
}

export function getProductPercentageDisplay(
  productId: string,
  price: number,
  offers: Offer[] = []
): ProductOfferDisplay | null {
  const applicable = offers.filter(
    (o) => o.type === "percentage" && offerAppliesToProduct(productId, o)
  );
  if (applicable.length === 0) return null;

  const best = applicable.reduce((a, b) =>
    (a.percentage ?? 0) >= (b.percentage ?? 0) ? a : b
  );
  const salePrice = getDiscountedPrice(price, best);
  if (salePrice == null) return null;

  return {
    tag: `${best.percentage}% Off`,
    shortTag: `-${best.percentage}%`,
    originalPrice: price,
    salePrice,
  };
}

export function getProductBestOffer(productId: string, offers: Offer[] = []): Offer | null {
  const applicable = offers.filter((o) => offerAppliesToProduct(productId, o));
  if (applicable.length === 0) return null;

  const percentageOffers = applicable.filter((o) => o.type === "percentage");
  if (percentageOffers.length > 0) {
    return percentageOffers.reduce((a, b) =>
      (a.percentage ?? 0) >= (b.percentage ?? 0) ? a : b
    );
  }

  return applicable.find((o) => o.type === "bogo") ?? applicable[0];
}

export function getDiscountedPrice(price: number, offer: Offer): number | null {
  if (offer.type !== "percentage" || !offer.percentage) return null;
  return Math.round(price * (1 - offer.percentage / 100));
}

export type ProductOfferDisplay = {
  tag: string;
  shortTag: string;
  originalPrice?: number;
  salePrice?: number;
};

export function getProductOfferDisplay(
  productId: string,
  price: number,
  offers: Offer[] = []
): ProductOfferDisplay | null {
  const percentage = getProductPercentageDisplay(productId, price, offers);
  if (percentage) return percentage;

  const bogoBadge = getProductBogoBadge(productId, offers);
  if (!bogoBadge) return null;

  return { tag: bogoBadge, shortTag: bogoBadge };
}

export function getProductOfferTag(productId: string, offers: Offer[] = []): string | null {
  return getProductOfferDisplay(productId, 0, offers)?.tag ?? null;
}

export function getOfferLabel(offer: Offer): string {
  if (offer.type === "percentage") {
    const pct = `${offer.percentage}% off`;
    return offer.scope === "all" ? `${pct} on everything` : `${pct} on select pieces`;
  }
  const bogo = `Buy ${offer.buyQuantity} Get ${offer.freeQuantity} Free`;
  return offer.scope === "selected" ? `${bogo} — selected items` : `${bogo} — storewide`;
}

export function getOfferHeadline(offer: Offer): string {
  if (offer.type === "percentage") {
    return offer.scope === "all" ? `${offer.percentage}% OFF` : `${offer.percentage}% OFF`;
  }
  return `B${offer.buyQuantity}G${offer.freeQuantity}`;
}
