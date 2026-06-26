import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "@/providers/CartProvider";
import { formatINR } from "@/lib/format";
import { getProductBogoBadge, getProductPercentageDisplay } from "@/lib/offer-label";
import type { Offer } from "@/types/offer";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description: string;
    category: string;
    price: number;
    rating: number;
    images: string[];
    isFeatured?: boolean;
    inStock?: boolean;
    stockQuantity?: number;
  };
  offers?: Offer[];
}

export default function ProductCard({ product, offers = [] }: ProductCardProps) {
  const { addToCart } = useCart();
  const [cartError, setCartError] = useState("");
  const imageUrl = product.images[0];
  const inStock = product.inStock !== false && (product.stockQuantity == null || product.stockQuantity > 0);
  const bogoBadge = getProductBogoBadge(product.id, offers);
  const percentageOffer = getProductPercentageDisplay(product.id, product.price, offers);

  const handleAddToBag = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCartError("");
    const result = addToCart({ ...product, images: product.images }, 1);
    if (!result.ok) setCartError(result.message);
  };

  return (
    <article className="group product-card flex flex-col overflow-hidden h-full rounded-2xl">
      <Link to={`/products/${product.id}`} className="relative block shrink-0">
        <div className="relative aspect-square w-full overflow-hidden rounded-t-2xl bg-accent-pink/30">
          {product.isFeatured && (
            <span className="absolute top-3 left-3 z-10 px-2 py-0.5 bg-white/95 text-primary-dark text-[8px] font-bold uppercase tracking-widest shadow-sm rounded-full">
              Popular
            </span>
          )}
          {bogoBadge && (
            <span className="offer-badge absolute top-3 right-3 z-10 rounded-full">
              {bogoBadge}
            </span>
          )}
          {!inStock && (
            <span className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 text-[10px] font-bold uppercase tracking-widest text-primary-dark">
              Sold Out
            </span>
          )}
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        </div>
      </Link>

      <div className="flex flex-1 flex-col px-3.5 pt-3 pb-4 bg-white">
        <Link to={`/products/${product.id}`} className="hover:text-primary transition-colors">
          <h3 className="text-[13px] text-primary-dark line-clamp-2 leading-snug font-medium">
            {product.name}
          </h3>
        </Link>

        <div className="mt-2 flex items-center flex-wrap gap-x-2 gap-y-1">
          {percentageOffer?.salePrice != null ? (
            <>
              <p className="text-sm font-bold text-primary-dark">{formatINR(percentageOffer.salePrice)}</p>
              <p className="text-xs text-muted-custom line-through">{formatINR(product.price)}</p>
              <span className="offer-price-tag">{percentageOffer.shortTag}</span>
            </>
          ) : (
            <p className="text-sm font-bold text-primary-dark">{formatINR(product.price)}</p>
          )}
        </div>

        <div className="mt-1 flex items-center justify-end">
          <span className="text-[10px] text-muted-custom flex items-center gap-0.5 shrink-0">
            <span className="text-accent-gold">★</span>
            {product.rating.toFixed(1)}
          </span>
        </div>

        {cartError && <p className="mt-2 text-[10px] text-rose-600 leading-snug">{cartError}</p>}

        <button
          type="button"
          onClick={handleAddToBag}
          disabled={!inStock}
          className="product-card-add-btn mt-3 w-full py-2.5 text-[10px] font-bold uppercase tracking-[0.12em] rounded-full disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {inStock ? "Add to Bag" : "Sold Out"}
        </button>
      </div>
    </article>
  );
}
