import { useCallback, useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { api } from "@/lib/api";
import Pagination from "@/components/Pagination";
import TableSkeleton from "@/components/TableSkeleton";
import { TableDeleteButton, TableEditButton } from "@/components/TableIconButtons";
import { getOfferLabel } from "@/lib/offer-label";
import type { PaginationMeta } from "@/lib/pagination";
import type { Offer } from "@/types/offer";
import type { AdminProduct } from "@/types/catalog";

const PAGE_SIZE = 10;

interface OfferListProps {
  products: AdminProduct[];
  onEdit: (offer: Offer) => void;
  onMeta?: (stats: { total: number; activeCount: number; withCodeCount: number }) => void;
}

export default function OfferList({ products, onEdit, onMeta }: OfferListProps) {
  const { confirm, dialog } = useConfirmDialog();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Offer[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);

  const debouncedSearch = useDebounce(searchTerm);
  const safeProducts = products ?? [];
  const productName = (id: string) => safeProducts.find((p) => p.id === id)?.name ?? id.slice(-6);

  const loadOffers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
        search: debouncedSearch,
      });
      const { data } = await api.get<{
        items: Offer[];
        pagination: PaginationMeta;
        stats: { total: number; activeCount: number; withCodeCount: number };
      }>(`/api/offers?${params}`);
      setItems(data.items ?? []);
      setPagination(data.pagination);
      onMeta?.(data.stats ?? { total: data.pagination.total, activeCount: 0, withCodeCount: 0 });
    } catch (e) {
      console.error("Failed to load offers", e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, onMeta]);

  useEffect(() => {
    loadOffers();
  }, [loadOffers]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Delete this offer?",
      message: "This promotion will be permanently removed.",
    });
    if (!ok) return;
    try {
      await api.delete(`/api/offers?id=${encodeURIComponent(id)}`);
      loadOffers();
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
      loadOffers();
    } catch (e) {
      console.error("Failed to toggle offer", e);
    }
  };

  if (loading && items.length === 0) {
    return <TableSkeleton rows={5} />;
  }

  return (
    <div className="space-y-4">
      {dialog}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search offers by name or code…"
          className="flex-1 px-4 py-2.5 text-xs border border-border-custom rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {items.length === 0 ? (
        <div className="p-12 bg-white border border-border-custom rounded-2xl text-center">
          <p className="text-sm text-muted-custom">
            {debouncedSearch ? "No offers match your search." : "No offers yet. Create your first promotion above."}
          </p>
        </div>
      ) : (
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
                {items.map((offer) => (
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
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center justify-end gap-1">
                        <TableEditButton onClick={() => onEdit(offer)} />
                        <TableDeleteButton onClick={() => handleDelete(offer.id)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Pagination pagination={pagination} onPageChange={setPage} />
    </div>
  );
}
