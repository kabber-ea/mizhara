import ProductCard from "./ProductCard";
import type { Offer } from "@/types/offer";
import type { SerializedProduct } from "@/types/catalog";

interface ProductGridProps {
  products: SerializedProduct[];
  loading: boolean;
  offers?: Offer[];
  filtersOpen?: boolean;
}

export default function ProductGrid({
  products,
  loading,
  offers = [],
  filtersOpen = true,
}: ProductGridProps) {
  const gridCols = filtersOpen
    ? "grid-cols-2 lg:grid-cols-3"
    : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";

  if (loading) {
    return (
      <div className={`grid ${gridCols} gap-3 sm:gap-4`}>
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="border border-border-custom rounded-2xl p-4 bg-white space-y-4 animate-pulse"
          >
            <div className="aspect-square w-full bg-accent-pink/15 rounded-xl" />
            <div className="space-y-2">
              <div className="h-4 bg-accent-pink/15 rounded-md w-2/3" />
              <div className="h-3 bg-accent-pink/15 rounded-md w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20 bg-white border border-border-custom rounded-2xl space-y-4 shadow-2xs">
        <span className="text-5xl">✨</span>
        <h3 className="font-serif text-lg font-bold text-primary-dark">No Products Match Your Filters</h3>
        <p className="text-xs text-muted-custom max-w-xs mx-auto">
          Try adjusting your search, price range, category, or offer filters.
        </p>
      </div>
    );
  }

  return (
    <div className={`grid ${gridCols} gap-3 sm:gap-4`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} offers={offers} />
      ))}
    </div>
  );
}
