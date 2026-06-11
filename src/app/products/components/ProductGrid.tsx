"use client";
import React from "react";
import ProductCard from "@/app/components/ProductCard";
interface ProductGridProps {
    products: any[];
    loading: boolean;
}
export default function ProductGrid({ products, loading }: ProductGridProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="border border-border-custom rounded-2xl p-4 bg-white space-y-4 animate-pulse"
                    >
                        <div className="aspect-square w-full bg-accent-pink/15 rounded-xl" />
                        <div className="space-y-2">
                            <div className="h-4 bg-accent-pink/15 rounded-md w-2/3" />
                            <div className="h-3 bg-accent-pink/15 rounded-md w-full" />
                            <div className="h-3 bg-accent-pink/15 rounded-md w-5/6" />
                        </div>
                        <div className="pt-3 border-t border-border-custom/50 flex justify-between">
                            <div className="h-4 bg-accent-pink/15 rounded-md w-1/4" />
                            <div className="h-4 bg-accent-pink/15 rounded-md w-1/5" />
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
                <h3 className="font-serif text-lg font-bold text-primary-dark">No Ornaments Match Your Filters</h3>
                <p className="text-xs text-muted-custom max-w-xs mx-auto">
                    Try adjusting your search queries, widening your price slider, or choosing another category category.
                </p>
            </div>
        );
    }
    return (
        <div className="space-y-6">
            {/* Count Info */}
            <div className="flex items-center justify-between text-xs text-muted-custom">
                <p>Showing <span className="font-bold text-foreground">{products.length}</span> fancy ornaments</p>
            </div>
            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
}
