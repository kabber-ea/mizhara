import type { Offer } from "@/types/offer";
import { formatINR } from "@/lib/format";

export function offerAppliesToProduct(productId: string, offer: Offer): boolean {
  if (offer.scope === "all") return true;
  return (offer.productIds ?? []).includes(productId);
}

export function getProductBogoBadge(productId: string, offers: Offer[] = []): string | null {
  const bogo = offers.find((o) => o.type === "bogo" && offerAppliesToProduct(productId, o));
  if (!bogo) return null;
  return `B${bogo.buyQuantity}G${bogo.freeQuantity}`;
}

type ProductOfferDisplay = {
  tag: string;
  shortTag: string;
  originalPrice?: number;
  salePrice?: number;
};

function getDiscountedPrice(price: number, offer: Offer): number | null {
  if (offer.type !== "percentage" || !offer.percentage) return null;
  let discount = price * (offer.percentage / 100);
  if (offer.maxDiscount && offer.maxDiscount > 0) {
    discount = Math.min(discount, offer.maxDiscount);
  }
  return Math.round(price - discount);
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

  return applicable.find((o) => o.type === "bogo") ?? applicable.find((o) => o.type === "fixed") ?? applicable[0];
}

function getProductOfferDisplay(
  productId: string,
  price: number,
  offers: Offer[] = []
): ProductOfferDisplay | null {
  const percentage = getProductPercentageDisplay(productId, price, offers);
  if (percentage) return percentage;

  const bogoBadge = getProductBogoBadge(productId, offers);
  if (bogoBadge) return { tag: bogoBadge, shortTag: bogoBadge };

  const fixed = offers.find((o) => o.type === "fixed" && offerAppliesToProduct(productId, o));
  if (fixed?.fixedAmount) {
    return { tag: `${formatINR(fixed.fixedAmount)} Off`, shortTag: `-${formatINR(fixed.fixedAmount)}` };
  }

  return null;
}

export function getProductOfferTag(productId: string, offers: Offer[] = []): string | null {
  return getProductOfferDisplay(productId, 0, offers)?.tag ?? null;
}

export function getOfferConstraints(offer: Offer): string[] {
  const parts: string[] = [];
  if (offer.minPurchase && offer.minPurchase > 0) {
    parts.push(`Min. ${formatINR(offer.minPurchase)}`);
  }
  if (offer.type === "percentage" && offer.maxDiscount && offer.maxDiscount > 0) {
    parts.push(`Up to ${formatINR(offer.maxDiscount)} off`);
  }
  return parts;
}

export function getOfferLabel(offer: Offer): string {
  if (offer.type === "percentage") {
    const pct = `${offer.percentage}% off`;
    const base = offer.scope === "all" ? `${pct} on everything` : `${pct} on select pieces`;
    const constraints = getOfferConstraints(offer);
    return constraints.length ? `${base} · ${constraints.join(" · ")}` : base;
  }
  if (offer.type === "fixed") {
    const base = offer.scope === "all"
      ? `${formatINR(offer.fixedAmount ?? 0)} off everything`
      : `${formatINR(offer.fixedAmount ?? 0)} off select pieces`;
    const constraints = getOfferConstraints(offer);
    return constraints.length ? `${base} · ${constraints.join(" · ")}` : base;
  }
  const bogo = `Buy ${offer.buyQuantity} Get ${offer.freeQuantity} Free`;
  return offer.scope === "selected" ? `${bogo} — selected items` : `${bogo} — storewide`;
}

export function getOfferCardHeadline(offer: Offer): string {
  if (offer.type === "percentage") {
    return `FLAT\n${offer.percentage}% OFF`;
  }
  if (offer.type === "fixed") {
    return `FLAT\n${formatINR(offer.fixedAmount ?? 0)} OFF`;
  }
  return `BUY ${offer.buyQuantity}\nGET ${offer.freeQuantity}\nFREE`;
}

export function getOfferHeadline(offer: Offer): string {
  if (offer.type === "percentage") {
    return `${offer.percentage}% OFF`;
  }
  if (offer.type === "fixed") {
    return `${formatINR(offer.fixedAmount ?? 0)} OFF`;
  }
  return `B${offer.buyQuantity}G${offer.freeQuantity}`;
}

export function getOfferShopHref(offerId: string) {
  return `/products?offer=${encodeURIComponent(offerId)}`;
}

export function getOfferTickerText(offer: Offer): string {
  const title = offer.name.trim();
  const scopeTarget = offer.scope === "all" ? "all items" : "select items";

  let detail = "";
  if (offer.type === "percentage") {
    const upto = offer.maxDiscount && offer.maxDiscount > 0 ? "Upto " : "";
    detail = `${upto}${offer.percentage}% off on ${scopeTarget}`;
  } else if (offer.type === "fixed") {
    const min =
      offer.minPurchase && offer.minPurchase > 0
        ? ` (min. ${formatINR(offer.minPurchase)})`
        : "";
    detail = `Flat ${formatINR(offer.fixedAmount ?? 0)} off on ${scopeTarget}${min}`;
  } else {
    detail = `Buy ${offer.buyQuantity} Get ${offer.freeQuantity} Free on ${scopeTarget}`;
  }

  return `${title} - ${detail}`;
}
