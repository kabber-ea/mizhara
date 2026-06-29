import { useRef } from "react";
import { Link } from "react-router-dom";
import type { Offer } from "@/types/offer";
import { getOfferConstraints, getOfferHeadline } from "@/lib/offer-label";

interface ActiveOffersSectionProps {
  offers: Offer[];
}

function OfferBanner({ offer }: { offer: Offer }) {
  const href = offer.code ? `/cart?code=${encodeURIComponent(offer.code)}` : "/products";
  const constraints = getOfferConstraints(offer);

  return (
    <Link
      to={href}
      className="group relative shrink-0 snap-start w-[85vw] sm:w-[420px] lg:w-[480px] aspect-[16/9] overflow-hidden border border-border-custom bg-primary-dark"
    >
      {offer.image ? (
        <img
          src={offer.image}
          alt=""
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary-dark via-[#3d3530] to-primary-dark" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/85 via-primary-dark/35 to-primary-dark/10" />

      <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-6">
        <p className="font-serif text-3xl sm:text-4xl font-light text-white leading-none tracking-tight">
          {getOfferHeadline(offer)}
        </p>
        <p className="mt-2 text-sm text-white/90 font-light line-clamp-1">{offer.name}</p>
        {constraints.length > 0 && (
          <p className="mt-1.5 text-[10px] uppercase tracking-[0.14em] text-white/55">
            {constraints.join(" · ")}
          </p>
        )}
        <div className="mt-4 flex items-center justify-between gap-3">
          {offer.code ? (
            <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/80 border border-white/30 px-2 py-1">
              {offer.code}
            </span>
          ) : (
            <span className="text-[9px] uppercase tracking-[0.14em] text-white/50">Auto applied</span>
          )}
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white group-hover:text-accent-gold transition-colors">
            Shop →
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function ActiveOffersSection({ offers }: ActiveOffersSectionProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  if (!offers?.length) return null;

  const scroll = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    const amount = track.clientWidth * 0.85;
    track.scrollBy({ left: direction * amount, behavior: "smooth" });
  };

  return (
    <section className="py-12 sm:py-16 bg-white border-y border-border-custom/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-custom">
              Privileges
            </p>
            <h2 className="font-serif text-2xl sm:text-[1.75rem] font-light text-primary-dark mt-1 tracking-tight">
              Curated Offers
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
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide"
        >
          {offers.map((offer) => (
            <OfferBanner key={offer.id} offer={offer} />
          ))}
        </div>
      </div>
    </section>
  );
}
