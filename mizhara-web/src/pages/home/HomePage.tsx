import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Hero from "./components/Hero";
import FeaturedCategories from "./components/FeaturedCategories";
import StorySection from "./components/StorySection";
import ProductCard from "@/pages/shop/components/ProductCard";
import type { SerializedProduct } from "@/types/catalog";

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<SerializedProduct[]>([]);

  useEffect(() => {
    api
      .get<SerializedProduct[]>("/api/products/featured")
      .then(({ data }) => setFeaturedProducts(data))
      .catch(() => setFeaturedProducts([]));
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <FeaturedCategories />
        <section className="py-16 bg-accent-mint/15 border-t border-b border-border-custom/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-serif text-3xl font-bold text-primary-dark mb-10">Mizhara Best Sellers</h2>
            {featuredProducts.length === 0 ? (
              <p className="text-sm text-muted-custom text-center py-12">No featured products. Run backend seed.</p>
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
