import { useState, useEffect, useCallback } from "react";
import ProductCard from "@/pages/shop/components/ProductCard";
import type { SerializedProduct } from "@/types/catalog";

import type { Offer } from "@/types/offer";

const carouselNavBtn =
  "flex items-center justify-center w-10 h-10 bg-white/95 border border-border-custom text-primary-dark text-2xl leading-none shadow-[0_4px_16px_rgba(60,52,46,0.12)] transition-colors hover:bg-primary-dark hover:text-white hover:border-primary-dark disabled:opacity-30";

const carouselDot =
  "w-2 h-2 rounded-full bg-border-custom transition-all duration-300 p-0 border-none";

const carouselDotActive = "w-6 bg-primary";

interface ProductCarouselProps {
  products: SerializedProduct[];
  offers?: Offer[];
}

function useVisibleCount() {
  const [visible, setVisible] = useState(1);

  useEffect(() => {
    const update = () => {
      setVisible(window.innerWidth >= 1024 ? 4 : window.innerWidth >= 640 ? 2 : 1);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return visible;
}

export default function ProductCarousel({ products, offers = [] }: ProductCarouselProps) {
  const [page, setPage] = useState(0);
  const visible = useVisibleCount();
  const maxPage = Math.max(0, products.length - visible);

  const goTo = useCallback(
    (p: number) => setPage(Math.max(0, Math.min(p, maxPage))),
    [maxPage]
  );

  useEffect(() => {
    setPage((p) => Math.min(p, maxPage));
  }, [maxPage]);

  useEffect(() => {
    if (products.length <= visible) return;
    const timer = setInterval(() => {
      setPage((p) => (p >= maxPage ? 0 : p + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [products.length, visible, maxPage]);

  if (products.length === 0) return null;

  const slideWidth = 100 / visible;

  return (
    <div className="relative group/carousel">
      <div className="overflow-hidden mx-0">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${page * slideWidth}%)` }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="shrink-0 px-2 sm:px-2.5"
              style={{ width: `${slideWidth}%` }}
            >
              <ProductCard product={product} offers={offers} />
            </div>
          ))}
        </div>
      </div>

      {products.length > visible && (
        <>
          <button
            type="button"
            onClick={() => goTo(page - 1)}
            disabled={page === 0}
            aria-label="Previous products"
            className={`${carouselNavBtn} absolute left-0 top-[38%] -translate-y-1/2 -translate-x-2 sm:-translate-x-4 z-10 opacity-100 sm:opacity-0 sm:group-hover/carousel:opacity-100 disabled:opacity-30 transition-opacity`}
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => goTo(page + 1)}
            disabled={page >= maxPage}
            aria-label="Next products"
            className={`${carouselNavBtn} absolute right-0 top-[38%] -translate-y-1/2 translate-x-2 sm:translate-x-4 z-10 opacity-100 sm:opacity-0 sm:group-hover/carousel:opacity-100 disabled:opacity-30 transition-opacity`}
          >
            ›
          </button>
          <div className="flex justify-center gap-1.5 mt-6">
            {Array.from({ length: maxPage + 1 }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Page ${i + 1}`}
                className={`${carouselDot} ${i === page ? carouselDotActive : ""}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
