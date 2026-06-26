import { useState } from "react";
import { useCart } from "@/components/CartProvider";
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
    sizes: string[];
    images: string[];
    stockQuantity?: number;
    inStock?: boolean;
  };
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const { addToCart } = useCart();
  const [selectedMetal] = useState("Rose Gold");
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || "One Size");
  const [quantity, setQuantity] = useState(1);
  const [addedMessage, setAddedMessage] = useState(false);
  const inStock = product.inStock !== false && (product.stockQuantity == null || product.stockQuantity > 0);
  const maxQty = product.stockQuantity && product.stockQuantity > 0 ? product.stockQuantity : 99;

  const handleAddToCart = () => {
    addToCart({ ...product, name: `${product.name} (${selectedMetal})` }, quantity, selectedSize);
    setAddedMessage(true);
    setTimeout(() => setAddedMessage(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold tracking-widest text-primary uppercase bg-accent-pink/10 px-3 py-1 rounded-full">{product.category}</span>
        <span className={`inline-flex items-center text-xs font-semibold gap-1 ${inStock ? "text-emerald-600" : "text-rose-600"}`}>
          {inStock ? (
            <>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              {product.stockQuantity != null ? `${product.stockQuantity} in stock` : "In Stock & Ready to Glow"}
            </>
          ) : (
            "Out of Stock"
          )}
        </span>
      </div>
      <div className="space-y-2">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-primary-dark">{product.name}</h1>
        <div className="flex items-center gap-4">
          <p className="text-2xl font-extrabold text-primary-dark">{formatINR(product.price)}</p>
          <div className="flex items-center space-x-1.5 border-l border-border-custom pl-4">
            <span className="text-sm font-bold text-accent-gold">★</span>
            <span className="text-xs font-bold text-foreground">{product.rating.toFixed(1)}</span>
            <span className="text-xs text-muted-custom">({product.reviewsCount} reviews)</span>
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-custom leading-relaxed">{product.description}</p>
      {product.sizes?.length > 0 && (
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-primary-dark">Select Size</label>
          <div className="flex flex-wrap gap-2.5">
            {product.sizes.map((size) => (
              <button key={size} type="button" onClick={() => setSelectedSize(size)} className={`px-4 py-2 border rounded-xl text-xs font-semibold cursor-pointer ${selectedSize === size ? "border-primary bg-accent-pink/15" : "border-border-custom"}`}>
                {size}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="flex items-center gap-4 pt-4 border-t border-border-custom/50">
        <div className="flex items-center border border-border-custom rounded-xl overflow-hidden">
          <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3.5 py-2.5 font-bold text-sm cursor-pointer">-</button>
          <span className="px-3 text-sm font-bold">{quantity}</span>
          <button type="button" onClick={() => setQuantity(Math.min(maxQty, quantity + 1))} className="px-3.5 py-2.5 font-bold text-sm cursor-pointer">+</button>
        </div>
        <button type="button" onClick={handleAddToCart} disabled={!inStock} className="flex-1 py-3 bg-primary text-white font-semibold text-sm rounded-xl shine-sweep cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
          Add to Shopping Cart
        </button>
      </div>
      {addedMessage && <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl">✓ Added to your cart!</div>}
    </div>
  );
}
