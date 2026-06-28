import { useState } from "react";
import { useCart } from "@/providers/CartProvider";
import { formatINR } from "@/lib/format";

interface ProductInfoProps {
  product: {
    id: string;
    name: string;
    description: string;
    category: string;
    price: number;
    rating: number;
    reviewsCount: number;
    materials: string[];
    images: string[];
    stockQuantity?: number;
    inStock?: boolean;
  };
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [addedMessage, setAddedMessage] = useState(false);
  const [cartError, setCartError] = useState("");

  const inStock = product.inStock !== false && (product.stockQuantity == null || product.stockQuantity > 0);
  const maxQty =
    typeof product.stockQuantity === "number" && product.stockQuantity > 0
      ? product.stockQuantity
      : inStock
        ? 99
        : 0;

  const handleAddToCart = () => {
    setCartError("");
    const result = addToCart({ ...product, images: product.images }, quantity);
    if (!result.ok) {
      setCartError(result.message);
      return;
    }
    setAddedMessage(true);
    setTimeout(() => setAddedMessage(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-custom bg-accent-pink/40 px-3 py-1">{product.category}</span>
        <span className={`text-[10px] font-bold uppercase tracking-widest ${inStock ? "text-primary" : "text-rose-600"}`}>
          {inStock ? "Available" : "Out of Stock"}
        </span>
      </div>

      <div className="space-y-2">
        <h1 className="font-serif text-3xl font-light tracking-tight text-primary-dark">{product.name}</h1>
        <div className="flex items-center gap-4">
          <p className="text-2xl font-semibold text-primary-dark">{formatINR(product.price)}</p>
          <div className="flex items-center space-x-1.5 border-l border-border-custom pl-4">
            <span className="text-sm text-accent-gold">★</span>
            <span className="text-xs font-semibold text-foreground">{product.rating.toFixed(1)}</span>
            <span className="text-xs text-muted-custom">({product.reviewsCount} reviews)</span>
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-custom leading-relaxed font-light">{product.description}</p>

      {product.materials?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {product.materials.map((m) => (
            <span key={m} className="px-3 py-1 text-[10px] uppercase tracking-wider border border-border-custom text-muted-custom">
              {m}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-4 pt-4 border-t border-border-custom/50">
        <div className="flex items-center border border-border-custom overflow-hidden">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-3.5 py-2.5 font-bold text-sm cursor-pointer hover:bg-accent-pink/30 transition-colors"
          >
            −
          </button>
          <span className="px-4 text-sm font-semibold min-w-[2.5rem] text-center">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
            disabled={!inStock || quantity >= maxQty}
            className="px-3.5 py-2.5 font-bold text-sm cursor-pointer hover:bg-accent-pink/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            +
          </button>
        </div>
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!inStock}
          className="flex-1 py-3 bg-primary-dark hover:bg-primary text-white font-bold text-xs uppercase tracking-[0.12em] shine-sweep cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Add to Bag
        </button>
      </div>

      {cartError && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">{cartError}</div>
      )}
      {addedMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
          Added to your bag
        </div>
      )}
    </div>
  );
}
