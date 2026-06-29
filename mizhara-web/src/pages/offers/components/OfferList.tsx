import { api } from "@/lib/api";
import { getOfferLabel } from "@/lib/offer-label";
import type { Offer } from "@/types/offer";
import type { AdminProduct } from "@/types/catalog";

interface OfferListProps {
  offers: Offer[];
  products: AdminProduct[];
  onEdit: (offer: Offer) => void;
  onRefresh: () => void;
}

export default function OfferList({ offers, products, onEdit, onRefresh }: OfferListProps) {
  const safeOffers = offers ?? [];
  const safeProducts = products ?? [];
  const productName = (id: string) => safeProducts.find((p) => p.id === id)?.name ?? id.slice(-6);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this offer?")) return;
    try {
      await api.delete(`/api/offers?id=${encodeURIComponent(id)}`);
      onRefresh();
    } catch (e) {
      console.error("Failed to delete offer", e);
    }
  };

  const toggleActive = async (offer: Offer) => {
    try {
      await api.put("/api/offers", {
        ...offer,
        isActive: !offer.isActive,
        productIds: offer.productIds || [],
        percentage: offer.percentage ?? 0,
        fixedAmount: offer.fixedAmount ?? 0,
        minPurchase: offer.minPurchase ?? 0,
        maxDiscount: offer.maxDiscount ?? 0,
        buyQuantity: offer.buyQuantity ?? 0,
        freeQuantity: offer.freeQuantity ?? 0,
        code: offer.code || "",
      });
      onRefresh();
    } catch (e) {
      console.error("Failed to toggle offer", e);
    }
  };

  if (safeOffers.length === 0) {
    return (
      <div className="p-12 bg-white border border-border-custom rounded-2xl text-center">
        <p className="text-sm text-muted-custom">No offers yet. Create your first promotion above.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-border-custom rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border-custom bg-accent-mint/30 text-left">
              <th className="px-4 py-3 font-bold uppercase text-[10px]">Offer</th>
              <th className="px-4 py-3 font-bold uppercase text-[10px]">Deal</th>
              <th className="px-4 py-3 font-bold uppercase text-[10px]">Code</th>
              <th className="px-4 py-3 font-bold uppercase text-[10px] text-center">Status</th>
              <th className="px-4 py-3 font-bold uppercase text-[10px] text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {safeOffers.map((offer) => (
              <tr key={offer.id} className="border-b border-border-custom/50 hover:bg-accent-mint/10">
                <td className="px-4 py-3">
                  <p className="font-semibold text-primary-dark">{offer.name}</p>
                  {offer.scope === "selected" && offer.productIds && offer.productIds.length > 0 && (
                    <p className="text-[10px] text-muted-custom mt-0.5 line-clamp-1">
                      {offer.productIds.slice(0, 2).map(productName).join(", ")}
                      {offer.productIds.length > 2 ? ` +${offer.productIds.length - 2} more` : ""}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-custom">{getOfferLabel(offer)}</td>
                <td className="px-4 py-3">
                  {offer.code ? (
                    <span className="font-mono font-bold text-primary">{offer.code}</span>
                  ) : (
                    <span className="text-muted-custom italic">Auto</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    type="button"
                    onClick={() => toggleActive(offer)}
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      offer.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {offer.isActive ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button type="button" onClick={() => onEdit(offer)} className="text-primary font-semibold hover:underline">
                    Edit
                  </button>
                  <button type="button" onClick={() => handleDelete(offer.id)} className="text-rose-600 font-semibold hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
