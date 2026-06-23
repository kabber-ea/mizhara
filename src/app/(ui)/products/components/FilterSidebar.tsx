"use client";
import React from "react";
interface FilterSidebarProps {
    search: string;
    setSearch: (s: string) => void;
    selectedCategory: string;
    setSelectedCategory: (c: string) => void;
    priceRange: number;
    setPriceRange: (p: number) => void;
    sortBy: string;
    setSortBy: (s: string) => void;
    categories: string[];
    maxPrice: number;
}
export default function FilterSidebar({
    search,
    setSearch,
    selectedCategory,
    setSelectedCategory,
    priceRange,
    setPriceRange,
    sortBy,
    setSortBy,
    categories,
    maxPrice,
}: FilterSidebarProps) {
    return (
        <div className="space-y-6 p-6 bg-white border border-border-custom rounded-2xl shadow-xs">
            {/* Search Bar */}
            <div>
                <label htmlFor="search" className="block text-xs font-bold uppercase tracking-wider text-primary-dark mb-2">
                    Search Ornaments
                </label>
                <div className="relative">
                    <input
                        type="text"
                        id="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search rings, anklets..."
                        className="w-full px-4 py-2.5 border border-border-custom rounded-xl text-xs bg-background/50 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch("")}
                            className="absolute right-2.5 top-2.5 text-muted-custom hover:text-primary transition-colors text-xs font-bold"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>
            {/* Category Filter */}
            <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-primary-dark mb-2">
                    Category
                </label>
                <div className="flex flex-wrap lg:flex-col gap-2">
                    <button
                        onClick={() => setSelectedCategory("All")}
                        className={`px-3 py-1.5 rounded-lg text-left text-xs font-medium tracking-wide transition-all ${selectedCategory === "All"
                                ? "bg-primary text-white shadow-xs font-semibold"
                                : "bg-accent-pink/10 hover:bg-accent-pink/30 text-primary-dark"
                            }`}
                    >
                        All Ornaments
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-3 py-1.5 rounded-lg text-left text-xs font-medium tracking-wide transition-all ${selectedCategory === cat
                                    ? "bg-primary text-white shadow-xs font-semibold"
                                    : "bg-accent-pink/10 hover:bg-accent-pink/30 text-primary-dark"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>
            {/* Price Range Slider */}
            <div>
                <div className="flex justify-between items-center mb-2">
                    <label htmlFor="price" className="block text-xs font-bold uppercase tracking-wider text-primary-dark">
                        Max Price
                    </label>
                    <span className="text-xs font-bold text-primary">₹{priceRange.toLocaleString("en-IN")}</span>
                </div>
                <input
                    type="range"
                    id="price"
                    min={0}
                    max={maxPrice || 100}
                    value={priceRange}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className="w-full h-1 bg-accent-pink rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[10px] text-muted-custom mt-1">
                    <span>₹0</span>
                    <span>₹{(maxPrice || 10000).toLocaleString("en-IN")}</span>
                </div>
            </div>
            {/* Sort Options */}
            <div>
                <label htmlFor="sort" className="block text-xs font-bold uppercase tracking-wider text-primary-dark mb-2">
                    Sort By
                </label>
                <select
                    id="sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-border-custom rounded-xl text-xs bg-background/50 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all font-medium"
                >
                    <option value="popular">Best Sellers</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                </select>
            </div>
            {/* Reset filters */}
            <button
                onClick={() => {
                    setSearch("");
                    setSelectedCategory("All");
                    setPriceRange(maxPrice);
                    setSortBy("popular");
                }}
                className="w-full py-2 border border-dashed border-primary/50 hover:border-primary text-primary hover:text-primary-hover font-semibold text-xs rounded-xl transition-all"
            >
                Reset Filters
            </button>
        </div>
    );
}
