import { useRef } from "react";
import { Link } from "react-router-dom";
import type { Offer } from "@/types/offer";
import { getOfferCardHeadline, getOfferConstraints, getOfferShopHref } from "@/lib/offer-label";

interface ActiveOffersSectionProps {
  offers: Offer[];
}

function OfferCard({ offer }: { offer: Offer }) {
  const href = getOfferShopHref(offer.id);
  const constraints = getOfferConstraints(offer);
  const headline = getOfferCardHeadline(offer);
  const lines = headline.split("\n");

  return (
    <Link
      to={href}
      className="group relative z-0 w-[9.5rem] sm:w-[11.5rem] aspect-square rounded-2xl border border-border-custom bg-white shadow-[0_2px_16px_-6px_rgba(42,36,32,0.1)] flex flex-col items-center justify-center p-4 text-center transition-all hover:z-10 hover:border-accent-gold/60 hover:shadow-[0_8px_24px_-8px_rgba(60,52,46,0.14)] hover:-translate-y-0.5"
    >
      <p className="font-slab text-[0.95rem] sm:text-[1.05rem] font-bold uppercase text-primary leading-snug tracking-[0.04em] whitespace-pre-line group-hover:text-primary-hover transition-colors">
        {lines.map((line, i) => (
          <span key={i} className="block">
            {line}
          </span>
        ))}
      </p>
      <p className="mt-2 text-[9px] font-medium uppercase tracking-[0.14em] text-muted-custom line-clamp-2">
        {offer.name}
      </p>
      {constraints.length > 0 && (
        <p className="mt-1.5 text-[8px] uppercase tracking-[0.12em] text-muted-custom/80 line-clamp-1">
          {constraints[0]}
        </p>
      )}
      {offer.code && (
        <span className="mt-3 text-[8px] font-semibold uppercase tracking-[0.16em] text-primary border border-primary/25 px-2 py-0.5 rounded-full">
          {offer.code}
        </span>
      )}
    </Link>
  );
}

export default function ActiveOffersSection({ offers }: ActiveOffersSectionProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  if (!offers?.length) return null;

  const scroll = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * 200, behavior: "smooth" });
  };

  return (
    <section className="py-12 sm:py-16 bg-background border-y border-border-custom/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-custom">
              Privileges
            </p>
            <h2 className="font-serif text-2xl sm:text-[1.75rem] font-light text-primary-dark mt-1 tracking-tight">
              Offers
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-accent-gold to-transparent w-12 mt-2.5" />
          </div>
          {offers.length > 1 && (
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => scroll(-1)}
                aria-label="Scroll offers left"
                className="w-9 h-9 flex items-center justify-center border border-border-custom text-primary-dark hover:bg-primary-dark hover:text-white transition-colors"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => scroll(1)}
                aria-label="Scroll offers right"
                className="w-9 h-9 flex items-center justify-center border border-border-custom text-primary-dark hover:bg-primary-dark hover:text-white transition-colors"
              >
                ›
              </button>
            </div>
          )}
        </div>

        <div
          ref={trackRef}
          className="flex gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide"
        >
          {offers.map((offer) => (
            <div key={offer.id} className="shrink-0 snap-start pt-2 pb-1">
              <OfferCard offer={offer} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
