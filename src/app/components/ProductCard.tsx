"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/app/components/CartProvider";

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
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  // Pick first size or default depending on category
  const getDefaultSize = (category: string) => {
    switch (category.toLowerCase()) {
      case "rings":
        return "7";
      case "chains":
        return "18 inches";
      case "anklets":
        return "9.5 inches + Extender";
      case "bracelets":
        return "Adjustable";
      default:
        return "One Size";
    }
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const size = getDefaultSize(product.category);
    addToCart(product, 1, size);
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border-custom bg-white card-hover-shadow">
      {/* Category & Badge Overlay */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        <span className="inline-flex items-center rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary shadow-xs backdrop-blur-xs">
          {product.category}
        </span>
        {product.isFeatured && (
          <span className="inline-flex items-center rounded-full bg-primary px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-xs animate-sparkle-pulse">
            ★ Popular
          </span>
        )}
      </div>

      {/* Image Container */}
      <Link href={`/products/${product.id}`} className="relative block aspect-square w-full overflow-hidden bg-accent-pink/10">
        <div className="flex h-full w-full items-center justify-center text-center p-4">
          {/* Stylized placeholder representation of the actual ornament */}
          <div className="flex flex-col items-center justify-center space-y-2">
            {product.category.toLowerCase() === "rings" && (
              <span className="text-4xl">💍</span>
            )}
            {product.category.toLowerCase() === "anklets" && (
              <span className="text-4xl">💫</span>
            )}
            {product.category.toLowerCase().includes("chain") && (
              <span className="text-4xl">📿</span>
            )}
            {product.category.toLowerCase() === "bracelets" && (
              <span className="text-4xl">✨</span>
            )}
            {product.category.toLowerCase() === "nose pins" && (
              <span className="text-4xl">💎</span>
            )}
            <span className="font-serif text-sm font-bold tracking-wide text-primary-dark line-clamp-2 px-2">
              {product.name}
            </span>
          </div>
        </div>

        {/* Hover overlay quick controls */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
          <button
            onClick={handleQuickAdd}
            className="w-full bg-white hover:bg-primary hover:text-white text-foreground font-semibold text-xs py-2.5 rounded-xl shadow-lg transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 shine-sweep flex items-center justify-center gap-1.5"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Quick Add
          </button>
        </div>
      </Link>

      {/* Product Information */}
      <div className="flex flex-1 flex-col p-4 bg-white">
        <div className="flex-1">
          <Link href={`/products/${product.id}`} className="hover:text-primary transition-colors block">
            <h3 className="text-sm font-semibold tracking-wide text-foreground line-clamp-1">
              {product.name}
            </h3>
          </Link>
          <p className="mt-1 text-xs text-muted-custom line-clamp-2">
            {product.description}
          </p>
        </div>

        {/* Rating and Details */}
        <div className="mt-2.5 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold text-accent-gold">★</span>
            <span className="text-xs font-medium text-foreground">{product.rating.toFixed(1)}</span>
          </div>
          {/* Metal option indicators */}
          <div className="flex space-x-1">
            <span className="h-2 w-2 rounded-full bg-[#e5989b] border border-white" title="Rose Gold" />
            <span className="h-2 w-2 rounded-full bg-[#d4af37] border border-white" title="Gold" />
            <span className="h-2 w-2 rounded-full bg-[#e2ece9] border border-white" title="Silver" />
          </div>
        </div>

        {/* Price & Primary Action */}
        <div className="mt-3.5 pt-3 border-t border-border-custom/50 flex items-center justify-between">
          <p className="text-sm font-extrabold text-primary-dark">
            ${product.price.toFixed(2)}
          </p>
          <Link
            href={`/products/${product.id}`}
            className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-0.5 transition-colors"
          >
            Details &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
