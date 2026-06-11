"use client";

import React, { useState } from "react";

interface ProductListProps {
  products: any[];
  onEdit: (product: any) => void;
  onRefresh: () => void;
}

export default function ProductList({ products, onEdit, onRefresh }: ProductListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleToggleFeatured = async (product: any) => {
    try {
      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: product.id,
          isFeatured: !product.isFeatured,
        }),
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (e) {
      console.error("Failed to toggle featured state", e);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this ornament?")) {
      try {
        const res = await fetch(`/api/products?id=${id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          onRefresh();
        }
      } catch (e) {
        console.error("Failed to delete product", e);
      }
    }
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white border border-border-custom rounded-2xl overflow-hidden shadow-xs space-y-4 p-6">
      {/* List Header Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-custom/50 pb-4">
        <h3 className="font-serif text-base font-bold text-primary-dark">Active Catalog</h3>
        <input
          type="text"
          placeholder="Filter catalog items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-64 px-4 py-2 border border-border-custom rounded-xl text-xs bg-background/50 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white"
        />
      </div>

      {/* Catalog Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-10 text-xs text-muted-custom">
          No matching ornaments found in the catalog.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border-custom/50 text-xs text-left">
            <thead>
              <tr className="text-primary-dark font-bold bg-accent-mint/10">
                <th className="px-4 py-3">Details</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3 text-center">Featured</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-custom/50">
              {filtered.map((product) => (
                <tr key={product.id} className="hover:bg-accent-pink/5 transition-colors">
                  {/* Info details */}
                  <td className="px-4 py-3">
                    <div className="font-semibold text-foreground">{product.name}</div>
                    <div className="text-[10px] text-muted-custom line-clamp-1">{product.description}</div>
                  </td>
                  
                  {/* Category */}
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full bg-accent-pink/20 text-primary font-medium uppercase text-[9px]">
                      {product.category}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="px-4 py-3 font-extrabold text-primary-dark">
                    ${product.price.toFixed(2)}
                  </td>

                  {/* Featured Status Toggle */}
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

                  {/* Actions */}
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
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
