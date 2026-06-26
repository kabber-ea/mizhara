import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "@/lib/api";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ImageGallery from "./components/ImageGallery";
import ProductInfo from "./components/ProductInfo";
import ProductCard from "@/pages/shop/components/ProductCard";
import type { SerializedProduct } from "@/types/catalog";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<SerializedProduct | null>(null);
  const [related, setRelated] = useState<SerializedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .get<SerializedProduct>(`/api/products/${id}`)
      .then(async ({ data: p }) => {
        setProduct(p);
        if (p?.category) {
          const { data: rel } = await api.get<SerializedProduct[]>(
            `/api/products/${id}/related?category=${encodeURIComponent(p.category)}`
          );
          setRelated(rel);
        }
      })
      .catch(() => {
        setProduct(null);
        setRelated([]);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-xs text-muted-custom">Loading...</div>;
  }

  if (!product) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <main className="flex-grow flex flex-col items-center justify-center py-24 text-center space-y-4 px-4">
          <h1 className="font-serif text-2xl font-bold text-primary-dark">Ornament Not Found</h1>
          <Link to="/products" className="px-6 py-2.5 bg-primary text-white text-xs font-semibold rounded-xl">Back to Collection</Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-grow">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
            <ImageGallery images={product.images} name={product.name} category={product.category} />
            <ProductInfo product={product} />
          </div>
        </section>
        {related.length > 0 && (
          <section className="border-t border-border-custom py-16 bg-accent-mint/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="font-serif text-2xl font-bold text-primary-dark mb-8">You Might Also Sparkle In</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {related.map((relProduct) => (
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
