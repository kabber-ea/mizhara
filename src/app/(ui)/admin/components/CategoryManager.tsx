import React, { useState } from "react";
interface CategoryManagerProps {
    categories: string[];
    onRefresh: () => void;
}
export default function CategoryManager({ categories, onRefresh }: CategoryManagerProps) {
    const [newCategory, setNewCategory] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess(false);
        setLoading(true);
        if (!newCategory.trim()) {
            setError("Category name cannot be empty.");
            setLoading(false);
            return;
        }
        try {
            const res = await fetch("/api/admin/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ category: newCategory }),
            });
            if (res.ok) {
                setNewCategory("");
                setSuccess(true);
                onRefresh();
                setTimeout(() => setSuccess(false), 3000);
            } else {
                const data = await res.json();
                setError(data.error || "Failed to add category.");
            }
        } catch (e: any) {
            setError(e.message || "Network error. Failed to add category.");
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="bg-white border border-border-custom rounded-2xl p-6 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* List Categories */}
            <div className="space-y-4">
                <h3 className="font-serif text-base font-bold text-primary-dark">Active Types</h3>
                <p className="text-xs text-muted-custom">
                    These categories define filters on the catalog search sidebar and landing selections.
                </p>
                <div className="flex flex-wrap gap-2.5">
                    {categories.map((cat) => (
                        <span
                            key={cat}
                            className="inline-flex items-center px-3.5 py-1.5 rounded-xl bg-accent-pink/15 text-primary-dark text-xs font-semibold uppercase border border-border-custom"
                        >
                            ✦ {cat}
                        </span>
                    ))}
                </div>
            </div>
            {/* Form Add Category */}
            <div className="space-y-4 border-t md:border-t-0 md:border-l border-border-custom/50 pt-6 md:pt-0 md:pl-8">
                <h3 className="font-serif text-base font-bold text-primary-dark">Add New Category</h3>

                <form onSubmit={handleSubmit} className="space-y-3">
                    {error && (
                        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl">
                            ✓ Category added successfully!
                        </div>
                    )}
                    <div>
                        <label className="block text-[10px] font-bold text-primary-dark uppercase mb-1">Category Name</label>
                        <input
                            type="text"
                            required
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            placeholder="e.g. Waist Chain"
                            className="w-full px-4 py-2 border border-border-custom rounded-xl text-xs bg-background/30 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white font-semibold text-xs rounded-xl transition-all shadow-md shine-sweep"
                    >
                        {loading ? "Adding..." : "Add Category Type"}
                    </button>
                </form>
            </div>
        </div>
    );
}