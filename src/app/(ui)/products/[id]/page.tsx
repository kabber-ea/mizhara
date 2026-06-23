import React from "react";
import Link from "next/link";
import Navbar from "@/ui/components/Navbar";
import Footer from "@/ui/components/Footer";
import ImageGallery from "@/ui/products/[id]/components/ImageGallery";
import ProductInfo from "@/ui/products/[id]/components/ProductInfo";
import ProductCard from "@/ui/components/ProductCard";
import { getProductById, getRelatedProducts } from "@/services/products";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <main className="flex-grow flex flex-col items-center justify-center py-24 text-center space-y-4 px-4">
          <span className="text-5xl animate-sparkle-pulse">✨</span>
          <h1 className="font-serif text-2xl font-bold text-primary-dark">Ornament Not Found</h1>
          <p className="text-xs text-muted-custom max-w-sm">
            We couldn&apos;t locate this ornament. It may have sold out or been removed.
          </p>
          <Link
            href="/products"
            className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl transition-all"
          >
            Back to Collection
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const relatedProducts = await getRelatedProducts(product.category, id, 4);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-accent-pink/5 border-b border-border-custom/40 py-3.5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-xs font-medium">
            <span className="text-muted-custom">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              <span className="mx-2">/</span>
              <Link href="/products" className="hover:text-primary transition-colors">Shop</Link>
              <span className="mx-2">/</span>
              <Link href={`/products?category=${product.category}`} className="hover:text-primary transition-colors">{product.category}</Link>
              <span className="mx-2">/</span>
            </span>
            <span className="text-primary-dark font-semibold">{product.name}</span>
          </div>
        </div>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
            <ImageGallery images={product.images} name={product.name} category={product.category} />
            <ProductInfo product={product} />
          </div>
        </section>
        {relatedProducts.length > 0 && (
          <section className="border-t border-border-custom py-16 bg-accent-mint/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="space-y-1 mb-8">
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-border-custom shadow-3xs">
                  More sparkles ✦
                </span>
                <h2 className="font-serif text-2xl font-bold text-primary-dark pt-1">
                  You Might Also Sparkle In
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relProduct) => (
                  <ProductCard key={relProduct.id} product={relProduct} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
