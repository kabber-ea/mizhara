import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import OfferForm from "./components/OfferForm";
import OfferList from "./components/OfferList";
import PageSkeleton from "@/components/PageSkeleton";
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

  if (loading) return <PageSkeleton />;

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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white border border-border-custom rounded-2xl">
          <span className="text-[10px] font-bold text-muted-custom uppercase">Total Offers</span>
          <p className="text-2xl font-extrabold text-primary-dark mt-1">{stats.total}</p>
        </div>
        <div className="p-5 bg-white border border-border-custom rounded-2xl">
          <span className="text-[10px] font-bold text-muted-custom uppercase">Active Now</span>
          <p className="text-2xl font-extrabold text-primary-dark mt-1">{stats.activeCount}</p>
        </div>
        <div className="p-5 bg-white border border-border-custom rounded-2xl">
          <span className="text-[10px] font-bold text-muted-custom uppercase">With Coupon Code</span>
          <p className="text-2xl font-extrabold text-primary-dark mt-1">{stats.withCodeCount}</p>
        </div>
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
