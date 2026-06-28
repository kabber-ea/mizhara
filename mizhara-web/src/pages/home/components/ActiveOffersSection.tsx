import { Link } from "react-router-dom";
import type { Offer } from "@/types/offer";
import { getOfferHeadline, getOfferLabel } from "@/lib/offer-label";

const OFFER_CARD_TONES = [
  "bg-gradient-to-br from-[#3a332e] to-[#524840]",
  "bg-gradient-to-br from-[#2a2420] to-[#3d3530]",
  "bg-gradient-to-br from-[#5c4f44] to-[#7a6a5c]",
  "bg-gradient-to-br from-[#1a1614] to-[#2e2824]",
] as const;

interface ActiveOffersSectionProps {
  offers: Offer[];
}

export default function ActiveOffersSection({ offers }: ActiveOffersSectionProps) {
  if (!offers?.length) return null;

  return (
    <section className="py-14 sm:py-16 bg-secondary/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-serif text-2xl sm:text-3xl font-light text-primary-dark text-center mb-10 tracking-tight">
          Curated Offers
        </h2>

        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
          {offers.map((offer, i) => (
            <Link
              key={offer.id}
              to={offer.code ? `/cart?code=${encodeURIComponent(offer.code)}` : "/products"}
              className={`group shrink-0 snap-start w-56 sm:w-64 aspect-[3/4] rounded-2xl overflow-hidden transition-transform hover:-translate-y-1 ${OFFER_CARD_TONES[i % OFFER_CARD_TONES.length]}`}
            >
              <div className="flex flex-col h-full p-6">
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
                <span className="mt-auto inline-flex self-start py-2 text-[10px] font-medium uppercase tracking-[0.14em] text-white/90 border-b border-white/40 group-hover:text-white group-hover:border-accent-gold transition-colors">
                  Shop Now
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
