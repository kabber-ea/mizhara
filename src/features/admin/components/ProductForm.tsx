"use client";

import React, { useState, useEffect } from "react";

interface ProductFormProps {
  categories: string[];
  editingProduct: any | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ProductForm({ categories, editingProduct, onSuccess, onCancel }: ProductFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [materials, setMaterials] = useState("");
  const [sizes, setSizes] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Sync editing item state
  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name || "");
      setDescription(editingProduct.description || "");
      setCategory(editingProduct.category || categories[0] || "");
      setPrice(editingProduct.price ? String(editingProduct.price) : "");
      setMaterials(editingProduct.materials ? editingProduct.materials.join(", ") : "");
      setSizes(editingProduct.sizes ? editingProduct.sizes.join(", ") : "");
      setIsFeatured(!!editingProduct.isFeatured);
    } else {
      // Default reset
      setName("");
      setDescription("");
      setCategory(categories[0] || "");
      setPrice("");
      setMaterials("925 Sterling Silver, Cubic Zirconia");
      setSizes("");
      setIsFeatured(false);
    }
  }, [editingProduct, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!category) {
      setError("Please select or add a category first.");
      setLoading(false);
      return;
    }

    // Process lists split by comma
    const materialsArray = materials
      .split(",")
      .map((m) => m.trim())
      .filter((m) => m.length > 0);
      
    const sizesArray = sizes
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    // Determine category based image representation
    const getCategoryImage = (cat: string) => {
      const formatted = cat.toLowerCase();
      if (formatted.includes("ring")) return ["/images/ring-1.jpg"];
      if (formatted.includes("anklet")) return ["/images/anklet-1.jpg"];
      if (formatted.includes("chain")) return ["/images/chain-1.jpg"];
      if (formatted.includes("bracelet")) return ["/images/bracelet-1.jpg"];
      if (formatted.includes("waist")) return ["/images/waist-1.jpg"];
      if (formatted.includes("nose")) return ["/images/nose-1.jpg"];
      return ["/images/placeholder.jpg"];
    };

    const payload = {
      id: editingProduct?.id, // include if editing
      name,
      description,
      category,
      price: Number(price),
      materials: materialsArray,
      sizes: sizesArray.length > 0 ? sizesArray : ["One Size"],
      isFeatured,
      images: editingProduct?.images || getCategoryImage(category)
    };

    try {
      const url = "/api/products";
      const method = editingProduct ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onSuccess();
      } else {
        const errData = await res.json();
        setError(errData.error || "An error occurred while saving the product.");
      }
    } catch (e: any) {
      setError(e.message || "Network error. Failed to save product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white border border-border-custom rounded-2xl space-y-4">
      <h3 className="font-serif text-base font-bold text-primary-dark">
        {editingProduct ? "Edit Fancy Ornament" : "Add New Ornament"}
      </h3>
      
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-bold text-primary-dark uppercase mb-1">Ornament Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Dreamy Pearl Nose Pin"
            className="w-full px-4 py-2 border border-border-custom rounded-xl text-xs bg-background/30 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-primary-dark uppercase mb-1">Category Type</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 border border-border-custom rounded-xl text-xs bg-background/30 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white font-medium"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-bold text-primary-dark uppercase mb-1">Price ($ USD)</label>
          <input
            type="number"
            step="0.01"
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="29.99"
            className="w-full px-4 py-2 border border-border-custom rounded-xl text-xs bg-background/30 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white"
          />
        </div>

        <div className="flex items-center pt-5">
          <label className="flex items-center space-x-3.5 cursor-pointer">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="h-4.5 w-4.5 rounded-sm border-border-custom text-primary focus:ring-primary accent-primary"
            />
            <span className="text-xs font-semibold text-primary-dark">Featured Item (appears on Homepage)</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-bold text-primary-dark uppercase mb-1">Materials (comma separated)</label>
        <input
          type="text"
          value={materials}
          onChange={(e) => setMaterials(e.target.value)}
          placeholder="e.g. 925 Sterling Silver, Rose Gold Plating, Opal Gem"
          className="w-full px-4 py-2 border border-border-custom rounded-xl text-xs bg-background/30 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white"
        />
      </div>

      <div>
        <label className="block text-[10px] font-bold text-primary-dark uppercase mb-1">Sizes (comma separated - optional)</label>
        <input
          type="text"
          value={sizes}
          onChange={(e) => setSizes(e.target.value)}
          placeholder="e.g. 6, 7, 8 (or leave empty for adjustable/one size)"
          className="w-full px-4 py-2 border border-border-custom rounded-xl text-xs bg-background/30 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white"
        />
      </div>

      <div>
        <label className="block text-[10px] font-bold text-primary-dark uppercase mb-1">Detailed Description</label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Write about the aesthetic, fit, styling suggestions..."
          className="w-full px-4 py-2 border border-border-custom rounded-xl text-xs bg-background/30 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white"
        />
      </div>

      <div className="flex justify-end gap-3 pt-3 border-t border-border-custom/50">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2 border border-border-custom text-foreground font-semibold text-xs rounded-xl hover:bg-accent-mint/10 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white font-semibold text-xs rounded-xl transition-all shadow-md shine-sweep"
        >
          {loading ? "Saving..." : editingProduct ? "Update Ornament" : "Save Ornament"}
        </button>
      </div>
    </form>
  );
}
