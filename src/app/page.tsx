
import React from "react";
import fs from "fs/promises";
import path from "path";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import Hero from "@/app/components/Hero";
import FeaturedCategories from "@/app/components/FeaturedCategories";
import StorySection from "@/app/components/StorySection";
import ProductCard from "@/app/components/ProductCard";
async function getFeaturedProducts() {
  try {
    const dataPath = path.join(process.cwd(), "src", "data", "products.json");
    const fileContent = await fs.readFile(dataPath, "utf-8");
    const data = JSON.parse(fileContent);
    return data.products.filter((p: any) => p.isFeatured === true);
  } catch (error) {
    console.error("Failed to load featured products", error);
    return [];
  }
}
export default async function Home() {
  const featuredProducts = await getFeaturedProducts();
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Shared Navbar */}
      <Navbar />
      <main className="flex-grow">
        {/* Hero Banner */}
        <Hero />
        {/* Featured Categories list */}
        <FeaturedCategories />
        {/* Best Sellers Featured Grid */}
        <section className="py-16 bg-accent-mint/15 border-t border-b border-border-custom/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-border-custom shadow-3xs">
                  Trending Gems ✦
                </span>
                <h2 className="font-serif text-3xl font-bold tracking-tight text-primary-dark">
                  Mizhara Best Sellers
                </h2>
                <p className="text-xs text-muted-custom">
                  The fancy ornaments stealing everyone's hearts right now.
                </p>
              </div>
            </div>
            {/* Products Grid */}
            {featuredProducts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-border-custom">
                <p className="text-sm text-muted-custom">No featured ornaments found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.slice(0, 4).map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>
        {/* Philosophy/Heritage section */}
        <StorySection />
      </main>
      {/* Shared Footer */}
      <Footer />
    </div>
  );
}