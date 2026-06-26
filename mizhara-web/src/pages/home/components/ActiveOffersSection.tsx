import { Link } from "react-router-dom";
import type { Offer } from "@/types/offer";
import { getOfferHeadline, getOfferLabel } from "@/lib/offer-label";

interface ActiveOffersSectionProps {
  offers: Offer[];
}

export default function ActiveOffersSection({ offers }: ActiveOffersSectionProps) {
  if (!offers?.length) return null;

  return (
    <section className="py-14 sm:py-16 bg-accent-pink/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-serif text-xl sm:text-2xl text-primary-dark text-center mb-8">
          Shop by Offer
        </h2>

        <div className="offer-collection-scroll -mx-4 px-4 sm:mx-0 sm:px-0">
          {offers.map((offer, i) => (
            <Link
              key={offer.id}
              to={offer.code ? `/cart?code=${encodeURIComponent(offer.code)}` : "/products"}
              className={`offer-collection-card group shrink-0 offer-collection-tone-${i % 4}`}
            >
              <div className="offer-collection-card-inner">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/70">
                  {offer.code ? `Code ${offer.code}` : "Auto Applied"}
                </p>
                <p className="font-serif text-3xl sm:text-4xl font-light text-white mt-3 leading-none">
                  {getOfferHeadline(offer)}
                </p>
                <p className="font-serif text-lg text-white/90 mt-2">{offer.name}</p>
                <p className="text-xs text-white/65 mt-3 line-clamp-2 font-light leading-relaxed">
                  {offer.description || getOfferLabel(offer)}
                </p>
                <span className="offer-collection-btn mt-auto">Shop Now</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
