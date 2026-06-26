import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FilterSidebar from "@/pages/shop/components/FilterSidebar";
import ProductGrid from "@/pages/shop/components/ProductGrid";
import { api } from "@/lib/api";
function CatalogContent() {
    const [searchParams] = useSearchParams();
    const initialCategory = searchParams.get("category") || "All";
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState(initialCategory);
    const [priceRange, setPriceRange] = useState(10000);
    const [maxPrice, setMaxPrice] = useState(10000);
    const [sortBy, setSortBy] = useState("popular");
    // Fetch initial products and categories
    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                const [{ data: productsData }, { data: categoriesData }] = await Promise.all([
                    api.get<any[]>("/api/products"),
                    api.get<string[]>("/api/categories"),
                ]);

                setProducts(productsData);
                setCategories(categoriesData);

                if (productsData.length > 0) {
                    const prices = productsData.map((p: any) => p.price);
                    const highest = Math.ceil(Math.max(...prices));
                    setMaxPrice(highest);
                    setPriceRange(highest);
                }
            } catch (error) {
                console.error("Failed to load catalog data", error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);
    // Sync category state when URL search parameter changes
    useEffect(() => {
        if (initialCategory) {
            setSelectedCategory(initialCategory);
        }
    }, [initialCategory]);
    // Client side filtering & sorting logic
    useEffect(() => {
        let result = [...products];
        // Search query match
        if (search.trim()) {
            const query = search.toLowerCase();
            result = result.filter(
                (p) =>
                    p.name.toLowerCase().includes(query) ||
                    p.description.toLowerCase().includes(query) ||
                    p.materials.some((m: string) => m.toLowerCase().includes(query))
            );
        }
        // Category match
        if (selectedCategory !== "All") {
            result = result.filter((p) => p.category === selectedCategory);
        }
        // Price range match
        result = result.filter((p) => p.price <= priceRange);
        // Sorting
        if (sortBy === "price-low") {
            result.sort((a, b) => a.price - b.price);
        } else if (sortBy === "price-high") {
            result.sort((a, b) => b.price - a.price);
        } else if (sortBy === "rating") {
            result.sort((a, b) => b.rating - a.rating);
        } else {
            // "popular" -> featured first, then by rating
            result.sort((a, b) => {
                if (a.isFeatured && !b.isFeatured) return -1;
                if (!a.isFeatured && b.isFeatured) return 1;
                return b.rating - a.rating;
            });
        }
        setFilteredProducts(result);
    }, [products, search, selectedCategory, priceRange, sortBy]);
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Title Header */}
            <div className="mb-10 text-center space-y-2">
                <h1 className="font-serif text-3xl sm:text-4xl font-extrabold tracking-tight text-primary-dark">
                    The Mizhara Collection
                </h1>
                <p className="text-xs text-muted-custom max-w-md mx-auto leading-relaxed">
                    Glimmer with delicate rings, sparkling nose pins, lovely double anklets, and hand-layered chains.
                </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left Side: Filter Sidebar */}
                <div className="lg:col-span-1">
                    <FilterSidebar
                        search={search}
                        setSearch={setSearch}
                        selectedCategory={selectedCategory}
                        setSelectedCategory={setSelectedCategory}
                        priceRange={priceRange}
                        setPriceRange={setPriceRange}
                        sortBy={sortBy}
                        setSortBy={setSortBy}
                        categories={categories}
                        maxPrice={maxPrice}
                     />
                </div>
                {/* Right Side: Product Grid */}
                <div className="lg:col-span-3">
                    <ProductGrid products={filteredProducts} loading={loading}  />
                </div>
            </div>
        </div>
    );
}
export default function ProductsPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Navbar  />
            <main className="flex-grow">
                <Suspense
                    fallback={
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center text-xs text-muted-custom">
                            Loading the Mizhara Collection...
                        </div>
                    }
                >
                    <CatalogContent  />
                </Suspense>
            </main>
            <Footer  />
        </div>
    );
}