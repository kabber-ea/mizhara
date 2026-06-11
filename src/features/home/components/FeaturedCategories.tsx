"use client";

import React from "react";
import Link from "next/link";

export default function FeaturedCategories() {
  const categories = [
    {
      name: "Rings",
      icon: "💍",
      description: "Adjustable bands & gems",
      bg: "bg-amber-50 text-amber-600",
      query: "Rings"
    },
    {
      name: "Anklets",
      icon: "💫",
      description: "Charming double layers",
      bg: "bg-pink-50 text-pink-600",
      query: "Anklets"
    },
    {
      name: "Chains",
      icon: "📿",
      description: "Starlets & chokers",
      bg: "bg-purple-50 text-purple-600",
      query: "Chains"
    },
    {
      name: "Waist Chains",
      icon: "✨",
      description: "Dewdrop style drops",
      bg: "bg-blue-50 text-blue-600",
      query: "Waist Chains"
    },
    {
      name: "Nose Pins",
      icon: "💎",
      description: "Dazzling studs & hooks",
      bg: "bg-teal-50 text-teal-600",
      query: "Nose Pins"
    },
    {
      name: "Bracelets",
      icon: "🌸",
      description: "Dainty blossom chains",
      bg: "bg-rose-50 text-rose-600",
      query: "Bracelets"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="font-serif text-3xl font-bold tracking-tight text-primary-dark">
            Shop by Ornament Type
          </h2>
          <p className="text-xs text-muted-custom">
            Select an ornament style to find your perfect sparkling match.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={`/products?category=${encodeURIComponent(cat.query)}`}
              className="group flex flex-col items-center text-center p-6 border border-border-custom rounded-2xl hover:border-primary/45 bg-background hover:bg-accent-pink/5 transition-all duration-300 card-hover-shadow"
            >
              {/* Emoji Icon Container */}
              <div className={`h-16 w-16 rounded-full flex items-center justify-center text-3xl transition-transform duration-300 group-hover:scale-110 shadow-xs ${cat.bg}`}>
                {cat.icon}
              </div>
              <h3 className="mt-4 font-serif text-sm font-bold tracking-wide text-foreground">
                {cat.name}
              </h3>
              <p className="mt-1.5 text-[10px] text-muted-custom leading-tight">
                {cat.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
