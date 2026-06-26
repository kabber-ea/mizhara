import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import OfferForm from "./components/OfferForm";
import OfferList from "./components/OfferList";
import PageSkeleton from "@/components/PageSkeleton";
import type { Offer } from "@/types/offer";
import type { AdminProduct } from "@/types/catalog";

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [{ data: offersData }, { data: productsData }] = await Promise.all([
        api.get<Offer[]>("/api/offers"),
        api.get<AdminProduct[]>("/api/products"),
      ]);
      setOffers(offersData ?? []);
      setProducts(productsData ?? []);
    } catch (e) {
      console.error("Failed to load offers", e);
      setOffers([]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const safeOffers = offers ?? [];
  const activeCount = safeOffers.filter((o) => o.active).length;

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
          <p className="text-2xl font-extrabold text-primary-dark mt-1">{safeOffers.length}</p>
        </div>
        <div className="p-5 bg-white border border-border-custom rounded-2xl">
          <span className="text-[10px] font-bold text-muted-custom uppercase">Active Now</span>
          <p className="text-2xl font-extrabold text-primary-dark mt-1">{activeCount}</p>
        </div>
        <div className="p-5 bg-white border border-border-custom rounded-2xl">
          <span className="text-[10px] font-bold text-muted-custom uppercase">With Coupon Code</span>
          <p className="text-2xl font-extrabold text-primary-dark mt-1">
            {safeOffers.filter((o) => o.code).length}
          </p>
        </div>
      </div>

      {showForm ? (
        <OfferForm
          products={products ?? []}
          editingOffer={editingOffer}
          onSuccess={() => { setShowForm(false); setEditingOffer(null); loadData(); }}
          onCancel={() => { setShowForm(false); setEditingOffer(null); }}
        />
      ) : (
        <OfferList
          offers={safeOffers}
          products={products ?? []}
          onEdit={(offer) => { setEditingOffer(offer); setShowForm(true); }}
          onRefresh={loadData}
        />
      )}
    </div>
  );
}
