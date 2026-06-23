"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";

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
    const [images, setImages] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (editingProduct) {
            setName(editingProduct.name || "");
            setDescription(editingProduct.description || "");
            setCategory(editingProduct.category || categories[0] || "");
            setPrice(editingProduct.price ? String(editingProduct.price) : "");
            setMaterials(editingProduct.materials ? editingProduct.materials.join(", ") : "");
            setSizes(editingProduct.sizes ? editingProduct.sizes.join(", ") : "");
            setIsFeatured(!!editingProduct.isFeatured);
            setImages(editingProduct.images || []);
        } else {
            setName("");
            setDescription("");
            setCategory(categories[0] || "");
            setPrice("");
            setMaterials("925 Sterling Silver, Cubic Zirconia");
            setSizes("");
            setIsFeatured(false);
            setImages([]);
        }
    }, [editingProduct, categories]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        setError("");
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Upload failed");
            setImages((prev) => [...prev, data.url]);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        if (!category) {
            setError("Please select a category first.");
            setLoading(false);
            return;
        }

        const payload = {
            id: editingProduct?.id,
            name,
            description,
            category,
            price: Number(price),
            materials: materials.split(",").map((m) => m.trim()).filter(Boolean),
            sizes: sizes.split(",").map((s) => s.trim()).filter(Boolean) || ["One Size"],
            isFeatured,
            images,
        };

        try {
            const res = await fetch("/api/admin/products", {
                method: editingProduct ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                onSuccess();
            } else {
                const errData = await res.json();
                setError(errData.error || "Failed to save product.");
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Network error.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 bg-white border border-border-custom rounded-2xl space-y-4">
            <h3 className="font-serif text-base font-bold text-primary-dark">
                {editingProduct ? "Edit Ornament" : "Add New Ornament"}
            </h3>
            {error && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">{error}</div>}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-[10px] font-bold uppercase mb-1">Name</label>
                    <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 border border-border-custom rounded-xl text-xs" />
                </div>
                <div>
                    <label className="block text-[10px] font-bold uppercase mb-1">Category</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-2 border border-border-custom rounded-xl text-xs">
                        {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-[10px] font-bold uppercase mb-1">Price (INR ₹)</label>
                    <input type="number" step="1" required value={price} onChange={(e) => setPrice(e.target.value)} placeholder="1999" className="w-full px-4 py-2 border border-border-custom rounded-xl text-xs" />
                </div>
                <div className="flex items-center pt-5">
                    <label className="flex items-center gap-3 cursor-pointer text-xs font-semibold">
                        <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="accent-primary" />
                        Featured on homepage
                    </label>
                </div>
            </div>

            <div>
                <label className="block text-[10px] font-bold uppercase mb-1">Product Images (Cloudinary)</label>
                <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="text-xs" />
                {uploading && <p className="text-[10px] text-muted-custom mt-1">Uploading...</p>}
                {images.length > 0 && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                        {images.map((url) => (
                            <div key={url} className="relative h-16 w-16 rounded-lg overflow-hidden border">
                                <Image src={url} alt="" fill className="object-cover" sizes="64px" />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div>
                <label className="block text-[10px] font-bold uppercase mb-1">Materials (comma separated)</label>
                <input type="text" value={materials} onChange={(e) => setMaterials(e.target.value)} className="w-full px-4 py-2 border border-border-custom rounded-xl text-xs" />
            </div>
            <div>
                <label className="block text-[10px] font-bold uppercase mb-1">Sizes (comma separated)</label>
                <input type="text" value={sizes} onChange={(e) => setSizes(e.target.value)} className="w-full px-4 py-2 border border-border-custom rounded-xl text-xs" />
            </div>
            <div>
                <label className="block text-[10px] font-bold uppercase mb-1">Description</label>
                <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-2 border border-border-custom rounded-xl text-xs" />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t">
                <button type="button" onClick={onCancel} className="px-5 py-2 border border-border-custom text-xs font-semibold rounded-xl">Cancel</button>
                <button type="submit" disabled={loading} className="px-6 py-2 bg-primary text-white text-xs font-semibold rounded-xl shine-sweep">
                    {loading ? "Saving..." : editingProduct ? "Update" : "Save"}
                </button>
            </div>
        </form>
    );
}
