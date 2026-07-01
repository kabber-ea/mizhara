import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Hero from "./components/Hero";
import HomeTrustBar from "./components/HomeTrustBar";
import ActiveOffersSection from "./components/ActiveOffersSection";
import BudgetSection from "./components/BudgetSection";
import StorySection from "./components/StorySection";
import ShopCTA from "./components/ShopCTA";
import ProductSection from "./components/ProductSection";
import type { SerializedProduct } from "@/types/catalog";
import type { Offer } from "@/types/offer";

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<SerializedProduct[]>([]);
  const [newProducts, setNewProducts] = useState<SerializedProduct[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<SerializedProduct[]>([]);
  const [activeOffers, setActiveOffers] = useState<Offer[]>([]);

  useEffect(() => {
    Promise.all([
      api.get<SerializedProduct[]>("/api/products/featured?limit=all"),
      api.get<SerializedProduct[]>("/api/products/new?limit=8"),
      api.get<SerializedProduct[]>("/api/products/trending?limit=8"),
      api.get<Offer[]>("/api/offers/active"),
    ])
      .then(([featured, newest, trending, offers]) => {
        setFeaturedProducts(featured.data ?? []);
        setNewProducts(newest.data ?? []);
        setTrendingProducts(trending.data ?? []);
        setActiveOffers(offers.data ?? []);
      })
      .catch(() => {
        setFeaturedProducts([]);
        setNewProducts([]);
        setTrendingProducts([]);
        setActiveOffers([]);
      });
  }, []);

  const storyProduct = featuredProducts[0] ?? newProducts[0];

  return (
    <main className="flex-grow">
        <Hero featuredProducts={featuredProducts} offers={activeOffers} />

        <HomeTrustBar />

        <ProductSection
          title="New Arrivals"
          products={newProducts}
          offers={activeOffers}
          emptyMessage="No new products yet."
          viewAllHref="/products?sort=newest"
          viewAllLabel="View all"
          layout="grid"
          className="py-12 sm:py-16 bg-white"
        />

        <ActiveOffersSection offers={activeOffers} />

        <ProductSection
          title="Featured Picks"
          products={featuredProducts}
          offers={activeOffers}
          emptyMessage="No featured products yet."
          viewAllHref="/products?sort=popular"
          viewAllLabel="View all"
          layout="grid"
          className="py-12 sm:py-16 bg-background"
        />

        <ProductSection
          title="Best Sellers"
          products={trendingProducts}
          offers={activeOffers}
          emptyMessage="No best sellers yet."
          viewAllHref="/products?sort=popular"
          viewAllLabel="View all"
          layout="grid"
          className="py-12 sm:py-16 bg-secondary/30"
        />

        <BudgetSection />

        <StorySection spotlightProduct={storyProduct} />
        <ShopCTA />
    </main>
  );
}
