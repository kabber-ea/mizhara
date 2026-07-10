import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import OfferForm from "./components/OfferForm";
import OfferList from "./components/OfferList";
import PageSkeleton from "@/components/PageSkeleton";
import KpiCard from "@/components/KpiCard";
import type { Offer } from "@/types/offer";
import type { AdminProduct } from "@/types/catalog";

export default function OffersPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [stats, setStats] = useState({ total: 0, activeCount: 0, withCodeCount: 0 });
  const [listKey, setListKey] = useState(0);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get<AdminProduct[]>("/api/products");
      setProducts(data ?? []);
    } catch (e) {
      console.error("Failed to load products for offers", e);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleOfferSuccess = () => {
    setShowForm(false);
    setEditingOffer(null);
    setListKey((k) => k + 1);
  };

  if (loading) return <PageSkeleton kpiCount={3} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-primary-dark">Offers</h1>
          <p className="text-xs text-muted-custom mt-1">
            Percentage discounts, buy-X-get-Y deals — all items or selected products
          </p>
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={() => { setEditingOffer(null); setShowForm(true); }}
            className="px-5 py-2.5 bg-primary-dark text-white text-xs font-bold uppercase tracking-wider rounded-xl shine-sweep"
          >
            Create Offer
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Total Offers" value={String(stats.total)} icon="offers" accentIndex={0} />
        <KpiCard label="Active Now" value={String(stats.activeCount)} icon="active" accentIndex={1} />
        <KpiCard label="With Coupon Code" value={String(stats.withCodeCount)} icon="coupon" accentIndex={2} />
      </div>

      {showForm ? (
        <OfferForm
          products={products ?? []}
          editingOffer={editingOffer}
          onSuccess={handleOfferSuccess}
          onCancel={() => { setShowForm(false); setEditingOffer(null); }}
        />
      ) : (
        <OfferList
          key={listKey}
          products={products ?? []}
          onEdit={(offer) => { setEditingOffer(offer); setShowForm(true); }}
          onMeta={setStats}
        />
      )}
    </div>
  );
}
