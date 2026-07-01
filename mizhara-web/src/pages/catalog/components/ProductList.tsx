import { useCallback, useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { formatINR } from "@/lib/format";
import { api, apiErrorMessage } from "@/lib/api";
import Pagination from "@/components/Pagination";
import ProductThumbnail from "@/components/ProductThumbnail";
import SortableTableHeader from "@/components/SortableTableHeader";
import TableSkeleton from "@/components/TableSkeleton";
import { TableDeleteButton, TableEditButton } from "@/components/TableIconButtons";
import { DEFAULT_SORT, nextSort, type SortState } from "@/lib/sort";
import type { AdminProduct } from "@/types/catalog";
import type { PaginationMeta } from "@/lib/pagination";

const PAGE_SIZE = 10;

interface ProductListProps {
  onEdit: (product: AdminProduct) => void;
  onMeta?: (meta: { total: number; featuredCount: number }) => void;
}

export default function ProductList({ onEdit, onMeta }: ProductListProps) {
  const { confirm, dialog } = useConfirmDialog();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortState>(DEFAULT_SORT);
  const [items, setItems] = useState<AdminProduct[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [featuredError, setFeaturedError] = useState("");

  const debouncedSearch = useDebounce(searchTerm);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
        search: debouncedSearch,
        sortBy: sort.column,
        sortDir: sort.direction,
      });
      const { data } = await api.get<{
        items: AdminProduct[];
        pagination: PaginationMeta;
        featuredCount: number;
      }>(`/api/products?${params}`);
      setItems(data.items ?? []);
      setPagination(data.pagination);
      onMeta?.({ total: data.pagination.total, featuredCount: data.featuredCount ?? 0 });
    } catch (e) {
      console.error("Failed to load products", e);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, sort, onMeta]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, sort]);

  const handleSort = (column: string) => {
    setSort((prev) => nextSort(prev, column));
  };

  const refresh = () => {
    loadProducts();
  };

  const handleToggleFeatured = async (product: AdminProduct) => {
    setFeaturedError("");
    try {
      await api.put("/api/products", {
        ...product,
        isFeatured: !product.isFeatured,
      });
      refresh();
    } catch (err: unknown) {
      setFeaturedError(apiErrorMessage(err, "Failed to update featured status."));
    }
  };

  const handleToggleActive = async (product: AdminProduct) => {
    try {
      await api.put("/api/products", {
        ...product,
        isActive: !product.isActive,
      });
      refresh();
    } catch (e) {
      console.error("Failed to toggle active state", e);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Delete this product?",
      message: "This ornament will be permanently removed from the catalog.",
    });
    if (!ok) return;
    try {
      await api.delete(`/api/products?id=${id}`);
      refresh();
    } catch (e) {
      console.error("Failed to delete product", e);
    }
  };

  return (
    <div className="bg-white border border-border-custom rounded-2xl overflow-hidden shadow-xs space-y-4 p-6">
      {dialog}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-custom/50 pb-4">
        <h3 className="font-serif text-base font-bold text-primary-dark">Product Catalog</h3>
        <input
          type="text"
          placeholder="Filter catalog items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-64 px-4 py-2 border border-border-custom rounded-xl text-xs bg-background/50 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white"
        />
      </div>

      {featuredError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
          {featuredError}
        </div>
      )}

      {loading && items.length === 0 ? (
        <TableSkeleton rows={6} />
      ) : items.length === 0 ? (
        <div className="text-center py-10 text-xs text-muted-custom">
          No matching ornaments found in the catalog.
        </div>
      ) : (
        <div className={loading ? "opacity-60 pointer-events-none transition-opacity duration-150" : ""}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border-custom/50 text-xs text-left">
              <thead>
                <tr className="text-primary-dark bg-accent-mint/10">
                  <th className="px-4 py-3 w-14">Image</th>
                  <SortableTableHeader label="Product" column="name" sort={sort} onSort={handleSort} />
                  <SortableTableHeader label="Unit Cost" column="costPrice" sort={sort} onSort={handleSort} />
                  <SortableTableHeader label="Retail Price" column="price" sort={sort} onSort={handleSort} />
                  <SortableTableHeader label="Stock" column="stock" sort={sort} onSort={handleSort} align="center" />
                  <SortableTableHeader label="Featured" column="featured" sort={sort} onSort={handleSort} align="center" />
                  <SortableTableHeader label="Status" column="status" sort={sort} onSort={handleSort} align="center" />
                  <SortableTableHeader label="Last Updated" column="updatedAt" sort={sort} onSort={handleSort} />
                  <th className="px-4 py-3 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-custom/50">
                {items.map((product) => (
                    <tr key={product.id} className={`hover:bg-accent-pink/5 transition-colors ${!product.isActive ? "opacity-60" : ""}`}>
                      <td className="px-4 py-3">
                        <ProductThumbnail src={product.images?.[0]} alt={product.name} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-foreground">{product.name}</div>
                        <div className="text-[10px] text-primary/70 font-medium mt-0.5">{product.category}</div>
                      </td>
                      <td className="px-4 py-3 text-muted-custom">{formatINR(product.costPrice)}</td>
                      <td className="px-4 py-3 font-extrabold text-primary-dark">{formatINR(product.price)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-[10px] font-bold ${product.stockQuantity <= 5 ? "text-amber-600" : "text-emerald-600"}`}>
                          {product.stockQuantity ?? (product.inStock ? "—" : "0")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleToggleFeatured(product)}
                          className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[10px] font-bold transition-all shadow-3xs ${
                            product.isFeatured
                              ? "bg-primary text-white hover:bg-primary-hover"
                              : "bg-accent-mint text-primary-dark hover:bg-slate-200"
                          }`}
                        >
                          {product.isFeatured ? "★ Yes" : "☆ No"}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(product)}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            product.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {product.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-muted-custom whitespace-nowrap">
                        {product.updatedAt
                          ? new Date(product.updatedAt).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1">
                          <TableEditButton onClick={() => onEdit(product)} />
                          <TableDeleteButton onClick={() => handleDelete(product.id)} />
                        </div>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination pagination={pagination} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
