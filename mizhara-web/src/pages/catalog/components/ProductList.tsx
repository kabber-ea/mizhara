import React, { useEffect, useMemo, useState } from "react";
import { formatINR } from "@/lib/format";
import { api } from "@/lib/api";
import Pagination from "@/components/Pagination";
import ProductThumbnail from "@/components/ProductThumbnail";
import type { AdminProduct } from "@/types/catalog";
import type { PaginationMeta } from "@/lib/pagination";

const PAGE_SIZE = 10;

interface ProductListProps {
  products: AdminProduct[];
  onEdit: (product: AdminProduct) => void;
  onRefresh: () => void;
}

export default function ProductList({ products, onEdit, onRefresh }: ProductListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.category.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [products, searchTerm]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const pagination: PaginationMeta = {
    page: currentPage,
    limit: PAGE_SIZE,
    total: filtered.length,
    totalPages,
  };

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const handleToggleFeatured = async (product: AdminProduct) => {
    try {
      await api.put("/api/products", {
        ...product,
        isFeatured: !product.isFeatured,
      });
      onRefresh();
    } catch (e) {
      console.error("Failed to toggle featured state", e);
    }
  };

  const handleToggleActive = async (product: AdminProduct) => {
    try {
      await api.put("/api/products", {
        ...product,
        isActive: !product.isActive,
      });
      onRefresh();
    } catch (e) {
      console.error("Failed to toggle active state", e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this ornament?")) return;
    try {
      await api.delete(`/api/products?id=${id}`);
      onRefresh();
    } catch (e) {
      console.error("Failed to delete product", e);
    }
  };

  return (
    <div className="bg-white border border-border-custom rounded-2xl overflow-hidden shadow-xs space-y-4 p-6">
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

      {filtered.length === 0 ? (
        <div className="text-center py-10 text-xs text-muted-custom">
          No matching ornaments found in the catalog.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border-custom/50 text-xs text-left">
              <thead>
                <tr className="text-primary-dark font-bold bg-accent-mint/10">
                  <th className="px-4 py-3 w-14">Image</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Unit Cost</th>
                  <th className="px-4 py-3">Retail Price</th>
                  <th className="px-4 py-3 text-center">Stock</th>
                  <th className="px-4 py-3 text-center">Margin</th>
                  <th className="px-4 py-3 text-center">Featured</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-custom/50">
                {paginated.map((product) => {
                  const margin = product.price - product.costPrice;
                  const marginPct = product.price > 0 ? Math.round((margin / product.price) * 100) : 0;
                  return (
                    <tr key={product.id} className={`hover:bg-accent-pink/5 transition-colors ${!product.isActive ? "opacity-60" : ""}`}>
                      <td className="px-4 py-3">
                        <ProductThumbnail
                          src={product.images?.[0]}
                          alt={product.name}
                          category={product.category}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-foreground">{product.name}</div>
                        <div className="text-[10px] text-primary/70 font-medium mt-0.5">{product.category}</div>
                        <div className="text-[10px] text-muted-custom line-clamp-1 mt-0.5">{product.description}</div>
                      </td>
                      <td className="px-4 py-3 text-muted-custom">{formatINR(product.costPrice)}</td>
                      <td className="px-4 py-3 font-extrabold text-primary-dark">{formatINR(product.price)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-[10px] font-bold ${product.stockQuantity <= 5 ? "text-amber-600" : "text-emerald-600"}`}>
                          {product.stockQuantity ?? (product.inStock ? "—" : "0")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-[10px] font-bold ${margin >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                          {formatINR(margin)} ({marginPct}%)
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
                      <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => onEdit(product)}
                          className="px-3 py-1 bg-white border border-border-custom hover:border-primary text-foreground font-semibold rounded-lg transition-all"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="px-3 py-1 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-600 font-semibold rounded-lg transition-all"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination pagination={pagination} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
