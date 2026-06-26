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
      <div className="promo-banner promo-banner-empty">
        <div className="flex items-center justify-center h-full min-h-[320px] sm:min-h-[420px] lg:min-h-[520px]">
          <p className="section-label text-muted-custom">New collection arriving soon</p>
        </div>
      </div>
    );
  }

  const ctaHref = productOffer?.code
    ? `/cart?code=${encodeURIComponent(productOffer.code)}`
    : `/products/${product.id}`;

  return (
    <div
      className="promo-banner group"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
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
                src={item.images[0]}
                alt={item.name}
                className={`promo-banner-image w-full h-full object-cover ${
                  i === active ? "promo-banner-image-active" : ""
                }`}
              />
              <div className="promo-banner-overlay absolute inset-0" />
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
                  <span className="promo-banner-offer-tag">{offerTag}</span>
                )}
              </div>
            </div>

            <Link
              to={ctaHref}
              className="promo-banner-cta pointer-events-auto self-start mt-7 sm:mt-9"
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
                className="promo-banner-nav promo-banner-nav-prev"
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
                className="promo-banner-nav promo-banner-nav-next"
              >
                <ChevronIcon direction="right" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 z-30">
                <div className="promo-banner-progress">
                  <div
                    className="promo-banner-progress-fill"
                    style={{ width: `${((active + 1) / count) * 100}%` }}
                  />
                </div>
                <p className="promo-banner-counter">
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
