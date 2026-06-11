"use client";
import React from "react";
interface ImageGalleryProps {
    images: string[];
    name: string;
    category: string;
}
export default function ImageGallery({ images, name, category }: ImageGalleryProps) {
    // Simple gallery displaying the product ornament
    return (
        <div className="space-y-4">
            {/* Primary Display */}
            <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-border-custom bg-accent-pink/10 flex items-center justify-center">
                <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
                    {category.toLowerCase() === "rings" && <span className="text-7xl">💍</span>}
                    {category.toLowerCase() === "anklets" && <span className="text-7xl">💫</span>}
                    {category.toLowerCase().includes("chain") && <span className="text-7xl">📿</span>}
                    {category.toLowerCase() === "bracelets" && <span className="text-7xl">✨</span>}
                    {category.toLowerCase() === "nose pins" && <span className="text-7xl">💎</span>}

                    <p className="font-serif text-lg font-bold text-primary-dark tracking-wider max-w-xs leading-snug">
                        {name}
                    </p>
                </div>

                {/* Glow Effects */}
                <div className="absolute top-4 right-4 animate-sparkle-pulse text-accent-gold text-xl">✦</div>
                <div className="absolute bottom-4 left-4 animate-sparkle-pulse text-primary text-xl">✦</div>
            </div>
            {/* Thumbnails row (for visual consistency) */}
            <div className="flex gap-4">
                {[...Array(3)].map((_, i) => (
                    <div
                        key={i}
                        className={`flex-1 aspect-square rounded-xl border border-border-custom bg-accent-mint/20 hover:border-primary transition-all duration-200 cursor-pointer flex items-center justify-center ${i === 0 ? "ring-2 ring-primary border-transparent" : ""
                            }`}
                    >
                        <span className="text-sm opacity-60">📷</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
