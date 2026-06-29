import ProductCard from "@/pages/shop/components/ProductCard";
import ProductCarousel from "./ProductCarousel";
import { Link } from "react-router-dom";
import type { SerializedProduct } from "@/types/catalog";
import type { Offer } from "@/types/offer";

interface ProductSectionProps {
  title: string;
  label?: string;
  products: SerializedProduct[];
  emptyMessage: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  layout?: "grid" | "rail" | "carousel";
  className?: string;
  offers?: Offer[];
}

export default function ProductSection({
  title,
  label,
  products,
  emptyMessage,
  viewAllHref = "/products",
  viewAllLabel = "View all",
  layout = "grid",
  className = "py-20 bg-background",
  offers = [],
}: ProductSectionProps) {
  const safeProducts = products ?? [];

  return (
    <section className={className}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 sm:mb-10">
          <div>
            {label && (
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-custom mb-2">
                {label}
              </p>
            )}
            <h2 className="font-serif text-2xl sm:text-3xl font-light text-primary-dark tracking-tight">
              {title}
            </h2>
          </div>
          {viewAllHref && viewAllLabel && (
            <Link
              to={viewAllHref}
              className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary hover:text-primary-dark shrink-0"
            >
              {viewAllLabel} →
            </Link>
          )}
        </div>

        {safeProducts.length === 0 ? (
          <p className="text-sm text-muted-custom text-center py-16 font-light">{emptyMessage}</p>
        ) : layout === "rail" ? (
          <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide [&>*]:snap-start [&>*]:shrink-0 [&>*]:w-[260px] sm:[&>*]:w-[280px]">
            {safeProducts.map((product) => (
              <ProductCard key={product.id} product={product} offers={offers} />
            ))}
          </div>
        ) : layout === "carousel" ? (
          <ProductCarousel products={safeProducts} offers={offers} />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
            {safeProducts.map((product) => (
              <ProductCard key={product.id} product={product} offers={offers} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
