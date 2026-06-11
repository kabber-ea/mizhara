"use client";
import React, { useState } from "react";
import { useCart } from "@/app/components/CartProvider";
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
    };
}
export default function ProductInfo({ product }: ProductInfoProps) {
    const { addToCart } = useCart();
    const [selectedMetal, setSelectedMetal] = useState("Rose Gold");
    const [selectedSize, setSelectedSize] = useState(product.sizes[0] || "One Size");
    const [quantity, setQuantity] = useState(1);
    const [addedMessage, setAddedMessage] = useState(false);
    const handleAddToCart = () => {
        // Add item to cart with selected configuration details
        const productConfig = {
            ...product,
            name: `${product.name} (${selectedMetal})`,
        };
        addToCart(productConfig, quantity, selectedSize);

        // Show temporary banner
        setAddedMessage(true);
        setTimeout(() => setAddedMessage(false), 3000);
    };
    return (
        <div className="space-y-6">
            {/* Category and Stock */}
            <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-widest text-primary uppercase bg-accent-pink/10 px-3 py-1 rounded-full">
                    {product.category}
                </span>
                <span className="inline-flex items-center text-xs text-emerald-600 font-semibold gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                    In Stock & Ready to Glow
                </span>
            </div>
            {/* Title & Price */}
            <div className="space-y-2">
                <h1 className="font-serif text-3xl font-bold tracking-tight text-primary-dark">
                    {product.name}
                </h1>
                <div className="flex items-center gap-4">
                    <p className="text-2xl font-extrabold text-primary-dark">${product.price.toFixed(2)}</p>
                    <div className="flex items-center space-x-1.5 border-l border-border-custom pl-4">
                        <span className="text-sm font-bold text-accent-gold">★</span>
                        <span className="text-xs font-bold text-foreground">{product.rating.toFixed(1)}</span>
                        <span className="text-xs text-muted-custom">({product.reviewsCount} reviews)</span>
                    </div>
                </div>
            </div>
            {/* Description */}
            <p className="text-xs text-muted-custom leading-relaxed">
                {product.description}
            </p>
            {/* Metal Finish Option */}
            <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-primary-dark">
                    Metal Polish: <span className="text-primary font-extrabold">{selectedMetal}</span>
                </label>
                <div className="flex gap-3">
                    {[
                        { name: "Rose Gold", bg: "bg-[#e5989b]", border: "border-[#e5989b]" },
                        { name: "Sterling Silver", bg: "bg-[#e2ece9]", border: "border-slate-300" },
                        { name: "Yellow Gold", bg: "bg-[#dfb15b]", border: "border-[#dfb15b]" },
                    ].map((metal) => (
                        <button
                            key={metal.name}
                            onClick={() => setSelectedMetal(metal.name)}
                            className={`p-1.5 rounded-full border-2 transition-all ${selectedMetal === metal.name
                                ? "ring-2 ring-primary ring-offset-2 border-transparentScale"
                                : "border-transparent"
                                }`}
                            title={metal.name}
                        >
                            <span className={`block h-5 w-5 rounded-full ${metal.bg} shadow-inner`} />
                        </button>
                    ))}
                </div>
            </div>
            {/* Sizes Options */}
            {product.sizes && product.sizes.length > 0 && (
                <div className="space-y-3">
                    <label className="block text-xs font-bold uppercase tracking-wider text-primary-dark">
                        Select Size
                    </label>
                    <div className="flex flex-wrap gap-2.5">
                        {product.sizes.map((size) => (
                            <button
                                key={size}
                                onClick={() => setSelectedSize(size)}
                                className={`px-4 py-2 border rounded-xl text-xs font-semibold tracking-wide transition-all ${selectedSize === size
                                    ? "border-primary bg-accent-pink/15 text-primary-dark"
                                    : "border-border-custom hover:border-primary text-foreground"
                                    }`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            {/* Quantity & Add action */}
            <div className="flex items-center gap-4 pt-4 border-t border-border-custom/50">
                {/* Quantity control */}
                <div className="flex items-center border border-border-custom rounded-xl bg-accent-mint/10 overflow-hidden">
                    <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3.5 py-2.5 text-muted-custom hover:text-primary transition-colors hover:bg-accent-pink/20 font-bold text-sm"
                    >
                        -
                    </button>
                    <span className="px-3 text-sm font-bold text-foreground">{quantity}</span>
                    <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="px-3.5 py-2.5 text-muted-custom hover:text-primary transition-colors hover:bg-accent-pink/20 font-bold text-sm"
                    >
                        +
                    </button>
                </div>
                {/* Add button */}
                <button
                    onClick={handleAddToCart}
                    className="flex-1 py-3 bg-primary hover:bg-primary-hover text-white font-semibold text-sm tracking-wide rounded-xl shadow-md transition-all shine-sweep flex items-center justify-center gap-2"
                >
                    Add to Shopping Cart
                </button>
            </div>
            {/* Success Added Message */}
            {addedMessage && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl flex items-center gap-2 animate-bounce">
                    <span>✓</span> Added to your cart! Open the bag to checkout.
                </div>
            )}
            {/* Premium Specifications */}
            <div className="pt-4 border-t border-border-custom/50 space-y-3">
                <h3 className="font-serif text-sm font-bold text-primary-dark">Details & Materials</h3>
                <ul className="list-disc pl-4 text-xs text-muted-custom space-y-1.5">
                    {product.materials.map((mat, i) => (
                        <li key={i}>{mat}</li>
                    ))}
                    <li>Nickel-free, Lead-free, and Hypoallergenic base</li>
                    <li>Signature fancy velvet packaging pouch included</li>
                </ul>
            </div>
            {/* Care advice */}
            <div className="p-4 bg-accent-mint/20 border border-border-custom rounded-2xl space-y-2">
                <h4 className="font-serif text-xs font-bold text-primary-dark">✦ Ornament Care Guide</h4>
                <p className="text-[10px] text-muted-custom leading-relaxed">
                    To maintain the fancy shine of your Mizhara ornaments, keep away from water, perfumes, and body lotions. Wipe gently with a soft micro-cloth after wearing.
                </p>
            </div>
        </div>
    );
}
