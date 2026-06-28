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

const spotlightNavBtn =
  "absolute top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-9 h-9 bg-white/92 border border-primary-dark/10 text-primary-dark text-xl leading-none transition-colors hover:bg-primary-dark hover:text-white hover:border-primary-dark";

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
      <div className="aspect-[4/5] w-full flex items-center justify-center border border-dashed border-accent-gold/35 bg-accent-pink/35">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-custom">Featured collection coming soon</p>
      </div>
    );
  }

  const offerTag = product ? getProductOfferTag(product.id, offers) : null;

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="relative">
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-white border border-accent-gold/20 shadow-[0_12px_40px_rgba(60,52,46,0.06)]">
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

          {offerTag && <span className="inline-block px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-primary-dark border border-accent-gold/55 absolute top-4 right-4 z-10">{offerTag}</span>}
          <span className="absolute top-4 left-4 z-10 px-2 py-0.5 bg-white/95 text-primary-dark text-[8px] font-bold uppercase tracking-widest">
            Featured
          </span>
        </div>

        {count > 1 && (
          <>
            <button type="button" onClick={prev} aria-label="Previous" className={`${spotlightNavBtn} left-3`}>
              ‹
            </button>
            <button type="button" onClick={next} aria-label="Next" className={`${spotlightNavBtn} right-3`}>
              ›
            </button>
          </>
        )}
      </div>

      <div className="pt-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-custom text-[9px] mb-1.5">{product.category}</p>
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
          <div className="h-0.5 bg-accent-gold/20 overflow-hidden mt-5">
            <div
              className="h-full bg-accent-gold transition-[width] duration-500 ease-out"
              style={{ width: `${((active + 1) / count) * 100}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
