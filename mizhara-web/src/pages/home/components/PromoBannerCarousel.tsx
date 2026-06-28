import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { formatINR } from "@/lib/format";
import { getProductBestOffer, getProductOfferTag } from "@/lib/offer-label";
import type { SerializedProduct } from "@/types/catalog";
import type { Offer } from "@/types/offer";

interface PromoBannerCarouselProps {
  products: SerializedProduct[];
  offers?: Offer[];
}

const promoNavBtn =
  "absolute top-1/2 -translate-y-1/2 z-30 flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/10 border border-white/25 text-white opacity-65 sm:opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-all hover:bg-white/15 hover:border-white/45";

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.25"
      stroke="currentColor"
      className="w-4 h-4"
      aria-hidden
    >
      {direction === "left" ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      )}
    </svg>
  );
}

export default function PromoBannerCarousel({ products, offers = [] }: PromoBannerCarouselProps) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = products.length;
  const product = products[active];
  const productOffer = product ? getProductBestOffer(product.id, offers) : null;
  const offerTag = product ? getProductOfferTag(product.id, offers) : null;

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
    const timer = setInterval(next, 7000);
    return () => clearInterval(timer);
  }, [count, paused, next]);

  if (count === 0) {
    return (
      <div className="mx-4 sm:mx-6 border border-border-custom bg-secondary">
        <div className="flex items-center justify-center h-full min-h-[320px] sm:min-h-[420px] lg:min-h-[520px]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-custom">New collection arriving soon</p>
        </div>
      </div>
    );
  }

  const ctaHref = productOffer?.code
    ? `/cart?code=${encodeURIComponent(productOffer.code)}`
    : `/products/${product.id}`;

  return (
    <div className="group bg-background" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="relative overflow-hidden">
        <div className="relative aspect-[5/6] sm:aspect-[21/9] min-h-[320px] sm:min-h-[380px] lg:min-h-[520px]">
          {products.map((item, i) => (
            <Link
              key={item.id}
              to={`/products/${item.id}`}
              className={`absolute inset-0 block transition-opacity duration-1000 ease-out ${
                i === active ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
              aria-hidden={i !== active}
            >
              <img
                src={item.bannerImageMobile || item.bannerImage || item.images[0]}
                alt={item.name}
                className={`w-full h-full object-cover sm:hidden transition-transform duration-[10s] ease-out ${
                  i === active ? "scale-[1.06]" : "scale-100"
                }`}
              />
              <img
                src={item.bannerImage || item.images[0]}
                alt={item.name}
                className={`w-full h-full object-cover hidden sm:block transition-transform duration-[10s] ease-out ${
                  i === active ? "scale-[1.06]" : "scale-100"
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/72 via-primary-dark/45 to-primary-dark/8 sm:bg-gradient-to-r sm:from-primary-dark/62 sm:via-primary-dark/28 sm:to-transparent" />
            </Link>
          ))}

          <div className="absolute inset-0 z-20 flex flex-col justify-end sm:justify-center px-6 sm:px-12 lg:px-20 pb-10 sm:pb-0 pointer-events-none">
            <div className="max-w-xl">
              <p className="text-[11px] sm:text-xs font-medium tracking-[0.2em] text-white/75 mb-3 sm:mb-4">
                {product.category}
              </p>
              <h2 className="font-serif text-3xl sm:text-5xl lg:text-[3.25rem] font-light text-white leading-[1.05] tracking-tight">
                {product.name}
              </h2>
              <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                <p className="text-sm sm:text-base text-white/85 font-light tracking-wide">
                  {formatINR(product.price)}
                </p>
                {offerTag && (
                  <span className="inline-block px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white/90 border border-white/35">
                    {offerTag}
                  </span>
                )}
              </div>
            </div>

            <Link
              to={ctaHref}
              className="pointer-events-auto self-start mt-7 sm:mt-9 inline-flex py-3 text-[11px] font-medium uppercase tracking-[0.18em] text-white border-b border-white/55 hover:text-accent-gold hover:border-accent-gold transition-colors"
            >
              {productOffer ? "Shop offer" : "Discover piece"}
            </Link>
          </div>

          {count > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  prev();
                }}
                aria-label="Previous slide"
                className={`${promoNavBtn} left-3 sm:left-5`}
              >
                <ChevronIcon direction="left" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  next();
                }}
                aria-label="Next slide"
                className={`${promoNavBtn} right-3 sm:right-5`}
              >
                <ChevronIcon direction="right" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 z-30">
                <div className="h-px bg-white/20">
                  <div
                    className="h-full bg-accent-gold transition-[width] duration-700 ease-out"
                    style={{ width: `${((active + 1) / count) * 100}%` }}
                  />
                </div>
                <p className="hidden sm:block absolute right-5 bottom-5 text-[10px] font-medium tracking-[0.15em] text-white/55 tabular-nums">
                  {String(active + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
