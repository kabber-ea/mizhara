import React, { useState, useEffect, useMemo, useCallback } from "react";
import ProductForm from "@/pages/catalog/components/ProductForm";
import ProductList from "@/pages/catalog/components/ProductList";
import CategoryManager from "@/pages/catalog/components/CategoryManager";
import PageSkeleton from "@/components/PageSkeleton";
import { api } from "@/lib/api";
import type { AdminProduct, Category } from "@/types/catalog";

export default function AdminCatalogPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"products" | "categories">("products");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [productMeta, setProductMeta] = useState({ total: 0, featuredCount: 0 });

  const loadCategories = async () => {
    try {
      setLoading(true);
      const { data: categoriesData } = await api.get<Category[]>("/api/categories");
      setCategories(categoriesData ?? []);
    } catch (e) {
      console.error("Failed to load catalog", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleProductMeta = useCallback((meta: { total: number; featuredCount: number }) => {
    setProductMeta(meta);
  }, []);

  const totalCategories = categories.length;
  const categoryNames = useMemo(() => categories.map((c) => c.name), [categories]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-primary-dark">Catalog</h1>
        <p className="text-xs text-muted-custom mt-1">Manage ornaments, categories, and product images</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white border border-border-custom rounded-2xl">
          <span className="text-[10px] font-bold text-muted-custom uppercase">Total Ornaments</span>
          <p className="text-2xl font-extrabold text-primary-dark mt-1">{productMeta.total}</p>
        </div>
        <div className="p-5 bg-white border border-border-custom rounded-2xl">
          <span className="text-[10px] font-bold text-muted-custom uppercase">Featured</span>
          <p className="text-2xl font-extrabold text-primary-dark mt-1">{productMeta.featuredCount}</p>
        </div>
        <div className="p-5 bg-white border border-border-custom rounded-2xl">
          <span className="text-[10px] font-bold text-muted-custom uppercase">Categories</span>
          <p className="text-2xl font-extrabold text-primary-dark mt-1">{totalCategories}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border-custom/50 gap-4 pb-2">
        <div className="flex gap-4">
          <button
            onClick={() => {
              setActiveTab("products");
              setShowForm(false);
              setEditingProduct(null);
            }}
            className={`pb-2 border-b-2 text-xs font-bold uppercase ${
              activeTab === "products" && !showForm
                ? "border-primary text-primary"
                : "border-transparent text-muted-custom"
            }`}
          >
            Manage Ornaments
          </button>
          <button
            onClick={() => {
              setActiveTab("categories");
              setShowForm(false);
            }}
            className={`pb-2 border-b-2 text-xs font-bold uppercase ${
              activeTab === "categories" ? "border-primary text-primary" : "border-transparent text-muted-custom"
            }`}
          >
            Manage Categories
          </button>
        </div>
        {activeTab === "products" && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-5 py-2 bg-primary text-white text-xs font-bold uppercase rounded-xl shine-sweep"
          >
            Add New Product
          </button>
        )}
      </div>

      {loading && categories.length === 0 ? (
        <PageSkeleton rows={4} />
      ) : (
        <div className="space-y-6">
          {showForm && activeTab === "products" && (
            <ProductForm
              categories={categoryNames}
              editingProduct={editingProduct}
              onSuccess={() => {
                setShowForm(false);
                setEditingProduct(null);
                loadCategories();
              }}
              onCancel={() => {
                setShowForm(false);
                setEditingProduct(null);
              }}
            />
          )}
          {!showForm && activeTab === "products" && (
            <ProductList
              onEdit={(p) => {
                setEditingProduct(p);
                setShowForm(true);
              }}
              onMeta={handleProductMeta}
            />
          )}
          {activeTab === "categories" && (
            <CategoryManager categories={categories} onRefresh={loadCategories} />
          )}
        </div>
      )}
    </div>
  );
}
