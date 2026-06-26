import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getOfferHeadline } from "@/lib/offer-label";
import type { SerializedProduct } from "@/types/catalog";
import type { Offer } from "@/types/offer";

interface PromoBannerCarouselProps {
  products: SerializedProduct[];
  offers?: Offer[];
}

export default function PromoBannerCarousel({ products, offers = [] }: PromoBannerCarouselProps) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = products.length;
  const topOffer = offers[0];
  const product = products[active];

  const goTo = useCallback(
    (index: number) => {
      if (count === 0) return;
      setActive(((index % count) + count) % count);
    },
    [count]
  );

  const next = useCallback(() => goTo(active + 1), [active, goTo]);
  const prev = useCallback(() => goTo(active - 1), [active, goTo]);

  useEffect(() => {
    if (count <= 1 || paused) return;
    const timer = setInterval(next, 5500);
    return () => clearInterval(timer);
  }, [count, paused, next]);

  if (count === 0) {
    return (
      <div className="promo-banner promo-banner-empty mx-4 sm:mx-6 lg:mx-8">
        <div className="flex items-center justify-center h-full min-h-[280px] sm:min-h-[360px]">
          <p className="section-label text-muted-custom">New collection arriving soon</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="promo-banner mx-4 sm:mx-6 lg:mx-8"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl">
        <div className="relative aspect-[4/3] sm:aspect-[21/9] min-h-[280px] sm:min-h-[320px]">
          {products.map((item, i) => (
            <Link
              key={item.id}
              to={`/products/${item.id}`}
              className={`absolute inset-0 block transition-opacity duration-700 ${
                i === active ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
              aria-hidden={i !== active}
            >
              <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
              <div className="promo-banner-overlay absolute inset-0" />
            </Link>
          ))}

          <div className="absolute inset-0 z-20 flex flex-col justify-center px-6 sm:px-12 lg:px-16 pointer-events-none">
            {topOffer ? (
              <>
                <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-white/80 mb-2">
                  Limited Time Offer
                </p>
                <p className="font-serif text-3xl sm:text-5xl lg:text-6xl font-light text-white leading-none">
                  {getOfferHeadline(topOffer)}
                </p>
                <p className="font-serif text-xl sm:text-3xl lg:text-4xl font-light text-accent-gold mt-1 sm:mt-2">
                  {topOffer.scope === "all" ? "Sitewide" : topOffer.name}
                </p>
                {topOffer.code && (
                  <p className="text-[10px] sm:text-xs text-white/70 mt-3 uppercase tracking-widest">
                    Code: {topOffer.code}
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-white/80 mb-2">
                  Mizhara · Spotlight
                </p>
                <p className="font-serif text-2xl sm:text-4xl lg:text-5xl font-light text-white leading-tight max-w-lg">
                  {product.name}
                </p>
                <p className="text-sm text-white/75 mt-2 uppercase tracking-wider">{product.category}</p>
              </>
            )}

            <Link
              to={topOffer?.code ? `/cart?code=${encodeURIComponent(topOffer.code)}` : "/products"}
              className="promo-banner-cta pointer-events-auto self-start mt-6 sm:mt-8"
            >
              {topOffer ? "Shop the Offer" : "Explore Collection"}
            </Link>
          </div>

          {count > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); prev(); }}
                aria-label="Previous slide"
                className="promo-banner-nav promo-banner-nav-prev"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); next(); }}
                aria-label="Next slide"
                className="promo-banner-nav promo-banner-nav-next"
              >
                ›
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
                {products.map((item, i) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => goTo(i)}
                    aria-label={`Slide ${i + 1}`}
                    className={`promo-banner-dot ${i === active ? "promo-banner-dot-active" : ""}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
