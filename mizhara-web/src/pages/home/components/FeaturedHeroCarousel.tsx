import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { formatINR } from "@/lib/format";
import { getProductOfferTag } from "@/lib/offer-label";
import type { SerializedProduct } from "@/types/catalog";
import type { Offer } from "@/types/offer";

interface FeaturedHeroCarouselProps {
  products: SerializedProduct[];
  offers?: Offer[];
}

export default function FeaturedHeroCarousel({ products, offers = [] }: FeaturedHeroCarouselProps) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = products.length;
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
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [count, paused, next]);

  if (count === 0) {
    return (
      <div className="hero-spotlight-empty aspect-[4/5] w-full flex items-center justify-center">
        <p className="section-label text-muted-custom">Featured collection coming soon</p>
      </div>
    );
  }

  const offerTag = product ? getProductOfferTag(product.id, offers) : null;

  return (
    <div
      className="hero-spotlight"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative">
        <div className="hero-spotlight-image aspect-[4/5] w-full overflow-hidden bg-white">
          {products.map((item, i) => (
            <img
              key={item.id}
              src={item.images[0]}
              alt={item.name}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                i === active ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}

          {offerTag && (
            <span className="offer-badge absolute top-4 right-4 z-10">{offerTag}</span>
          )}
          <span className="absolute top-4 left-4 z-10 px-2 py-0.5 bg-white/95 text-primary-dark text-[8px] font-bold uppercase tracking-widest">
            Featured
          </span>
        </div>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous"
              className="hero-spotlight-nav hero-spotlight-nav-prev"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next"
              className="hero-spotlight-nav hero-spotlight-nav-next"
            >
              ›
            </button>
          </>
        )}
      </div>

      <div className="hero-spotlight-caption">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="section-label text-[9px] mb-1.5">{product.category}</p>
            <Link
              to={`/products/${product.id}`}
              className="font-serif text-xl sm:text-2xl text-primary-dark font-light leading-snug hover:text-primary transition-colors line-clamp-2"
            >
              {product.name}
            </Link>
            <p className="text-sm text-muted-custom mt-2">{formatINR(product.price)}</p>
          </div>
          {count > 1 && (
            <span className="text-[10px] text-muted-custom tabular-nums shrink-0 pt-1">
              {active + 1} / {count}
            </span>
          )}
        </div>

        <Link
          to={`/products/${product.id}`}
          className="inline-block mt-4 text-[10px] font-bold uppercase tracking-[0.15em] text-primary hover:text-primary-dark transition-colors"
        >
          View piece →
        </Link>

        {count > 1 && (
          <div className="hero-spotlight-progress mt-5">
            <div
              className="hero-spotlight-progress-fill"
              style={{ width: `${((active + 1) / count) * 100}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
