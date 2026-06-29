import { useState, useEffect, useCallback, useRef, useMemo } from "react";
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
  "pointer-events-auto flex shrink-0 items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/25 border border-white/35 text-white backdrop-blur-sm hover:bg-black/40 transition-colors disabled:opacity-40 disabled:pointer-events-none";

const SLIDE_MS = 700;

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

function toLogicalIndex(slideIndex: number, count: number) {
  if (count <= 1) return 0;
  if (slideIndex === 0) return count - 1;
  if (slideIndex === count + 1) return 0;
  return slideIndex - 1;
}

function PromoSlide({
  item,
  offers,
  isActive,
}: {
  item: SerializedProduct;
  offers: Offer[];
  isActive: boolean;
}) {
  const productOffer = getProductBestOffer(item.id, offers);
  const offerTag = getProductOfferTag(item.id, offers);
  const ctaHref = productOffer?.code
    ? `/cart?code=${encodeURIComponent(productOffer.code)}`
    : `/products/${item.id}`;

  return (
    <div className="relative w-full shrink-0 h-full bg-primary-dark">
      <Link to={`/products/${item.id}`} className="absolute inset-0 block">
        <img
          src={item.bannerImageMobile || item.bannerImage || item.images[0]}
          alt={item.name}
          className={`w-full h-full object-cover sm:hidden transition-transform duration-[10s] ease-out ${
            isActive ? "scale-[1.04]" : "scale-100"
          }`}
        />
        <img
          src={item.bannerImage || item.images[0]}
          alt={item.name}
          className={`w-full h-full object-cover hidden sm:block transition-transform duration-[10s] ease-out ${
            isActive ? "scale-[1.04]" : "scale-100"
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/72 via-primary-dark/45 to-primary-dark/8 sm:bg-gradient-to-r sm:from-primary-dark/62 sm:via-primary-dark/28 sm:to-transparent" />
      </Link>

      <div className="absolute inset-0 z-20 flex flex-col justify-end sm:justify-center px-6 sm:px-12 lg:px-20 pb-10 sm:pb-0 pointer-events-none">
        <div className="max-w-xl">
          <p className="text-[11px] sm:text-xs font-medium tracking-[0.2em] text-white/75 mb-3 sm:mb-4">
            {item.category}
          </p>
          <h2 className="font-serif text-3xl sm:text-5xl lg:text-[3.25rem] font-light text-white leading-[1.05] tracking-tight">
            {item.name}
          </h2>
          <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            <p className="text-sm sm:text-base text-white/85 font-light tracking-wide">
              {formatINR(item.price)}
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
    </div>
  );
}

export default function PromoBannerCarousel({ products, offers = [] }: PromoBannerCarouselProps) {
  const count = products.length;
  const loop = count > 1;

  const slides = useMemo(() => {
    if (!loop) return products;
    return [products[count - 1], ...products, products[0]];
  }, [products, count, loop]);

  const [slideIndex, setSlideIndex] = useState(loop ? 1 : 0);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  const slideIndexRef = useRef(loop ? 1 : 0);
  const isAnimatingRef = useRef(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const logicalActive = toLogicalIndex(slideIndex, count);

  const snapTo = useCallback((index: number, animate: boolean) => {
    slideIndexRef.current = index;
    setTransitionEnabled(animate);
    setSlideIndex(index);
  }, []);

  const finishAnimation = useCallback(() => {
    isAnimatingRef.current = false;
    setIsAnimating(false);
  }, []);

  const resetLoopPosition = useCallback(
    (targetIndex: number) => {
      setTransitionEnabled(false);
      slideIndexRef.current = targetIndex;
      setSlideIndex(targetIndex);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTransitionEnabled(true);
          finishAnimation();
        });
      });
    },
    [finishAnimation]
  );

  const step = useCallback(
    (direction: 1 | -1) => {
      if (!loop || isAnimatingRef.current) return;

      isAnimatingRef.current = true;
      setIsAnimating(true);

      const nextIndex = slideIndexRef.current + direction;
      snapTo(nextIndex, true);
    },
    [loop, snapTo]
  );

  const next = useCallback(() => step(1), [step]);
  const prev = useCallback(() => step(-1), [step]);

  const handleTransitionEnd = useCallback(
    (e: React.TransitionEvent<HTMLDivElement>) => {
      if (!loop || e.target !== e.currentTarget || e.propertyName !== "transform") return;

      const idx = slideIndexRef.current;

      if (idx === count + 1) {
        resetLoopPosition(1);
      } else if (idx === 0) {
        resetLoopPosition(count);
      } else {
        finishAnimation();
      }
    },
    [loop, count, resetLoopPosition, finishAnimation]
  );

  useEffect(() => {
    if (!loop || isAnimating) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [loop, isAnimating, next]);

  useEffect(() => {
    if (!isAnimating || !loop) return;

    const timeout = setTimeout(() => {
      if (!isAnimatingRef.current) return;
      const idx = slideIndexRef.current;
      if (idx === count + 1) resetLoopPosition(1);
      else if (idx === 0) resetLoopPosition(count);
      else finishAnimation();
    }, SLIDE_MS + 80);

    return () => clearTimeout(timeout);
  }, [isAnimating, loop, count, resetLoopPosition, finishAnimation]);

  useEffect(() => {
    if (!loop) return;
    slideIndexRef.current = 1;
    isAnimatingRef.current = false;
    setIsAnimating(false);
    setTransitionEnabled(true);
    setSlideIndex(1);
  }, [count, loop]);

  if (count === 0) {
    return (
      <div className="mx-4 sm:mx-6 border border-border-custom bg-secondary">
        <div className="flex items-center justify-center h-full min-h-[320px] sm:min-h-[420px] lg:min-h-[520px]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-custom">New collection arriving soon</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative isolate z-0 bg-primary-dark"
    >
      <div className="relative aspect-[5/6] sm:aspect-[21/9] min-h-[320px] sm:min-h-[380px] lg:min-h-[520px] overflow-hidden bg-primary-dark">
        <div
          ref={trackRef}
          className={`flex h-full will-change-transform ${transitionEnabled ? "transition-transform ease-in-out" : ""}`}
          style={{
            transform: `translate3d(-${slideIndex * 100}%, 0, 0)`,
            transitionDuration: transitionEnabled ? `${SLIDE_MS}ms` : "0ms",
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {slides.map((item, i) => (
            <div key={`${item.id}-${i}`} className="relative w-full shrink-0 h-full" aria-hidden={i !== slideIndex}>
              <PromoSlide item={item} offers={offers} isActive={i === slideIndex} />
            </div>
          ))}
        </div>

        {loop && (
          <div className="absolute bottom-0 left-0 right-0 z-30 pointer-events-none">
            <div className="h-px bg-white/20">
              <div
                className="h-full bg-accent-gold transition-[width] duration-700 ease-out"
                style={{ width: `${((logicalActive + 1) / count) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {loop && (
        <div className="absolute inset-0 z-10 flex items-center justify-between px-3 sm:px-5 lg:px-8 pointer-events-none">
          <button
            type="button"
            onClick={prev}
            disabled={isAnimating}
            aria-label="Previous slide"
            className={promoNavBtn}
          >
            <ChevronIcon direction="left" />
          </button>
          <button
            type="button"
            onClick={next}
            disabled={isAnimating}
            aria-label="Next slide"
            className={promoNavBtn}
          >
            <ChevronIcon direction="right" />
          </button>
        </div>
      )}
    </div>
  );
}
