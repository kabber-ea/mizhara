
import React from "react";
import Navbar from "@/ui/components/Navbar";
import Footer from "@/ui/components/Footer";
import Hero from "@/ui/components/Hero";
import FeaturedCategories from "@/ui/components/FeaturedCategories";
import StorySection from "@/ui/components/StorySection";
import ProductCard from "@/ui/components/ProductCard";
import { getFeaturedProducts } from "@/services/products";

export default async function Home() {
  const featuredProducts = await getFeaturedProducts(4);
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <FeaturedCategories />
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
                  The fancy ornaments stealing everyone&apos;s hearts right now.
                </p>
              </div>
            </div>
            {featuredProducts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-border-custom">
                <p className="text-sm text-muted-custom">No featured ornaments found. Run <code className="text-primary">npm run seed</code> to load data.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>
        <StorySection />
      </main>
      <Footer />
    </div>
  );
}
