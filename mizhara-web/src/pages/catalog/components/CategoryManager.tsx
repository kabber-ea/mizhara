import { useState } from "react";
import { api, apiErrorMessage } from "@/lib/api";
import type { Category } from "@/types/catalog";

interface CategoryManagerProps {
  categories: Category[];
  onRefresh: () => void;
}

export default function CategoryManager({ categories, onRefresh }: CategoryManagerProps) {
  const [newCategory, setNewCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post<{ url: string }>("/api/upload", formData);
    return data.url;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const url = await uploadFile(file);
      setImageUrl(url);
    } catch (err: unknown) {
      setError(apiErrorMessage(err, "Image upload failed."));
    } finally {
      setUploading(false);
    }
  };

  const handleToggleActive = async (category: Category) => {
    if (!category.image) return;
    setUpdatingId(category.id);
    setError("");
    try {
      await api.put("/api/categories", {
        id: category.id,
        name: category.name,
        image: category.image,
        isActive: !category.isActive,
      });
      onRefresh();
    } catch (err: unknown) {
      setError(apiErrorMessage(err, "Failed to update category status."));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleReplaceImage = async (category: Category, file: File) => {
    setUpdatingId(category.id);
    setError("");
    try {
      const url = await uploadFile(file);
      await api.put("/api/categories", {
        id: category.id,
        name: category.name,
        image: url,
      });
      onRefresh();
    } catch (err: unknown) {
      setError(apiErrorMessage(err, "Failed to update category image."));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    if (!newCategory.trim()) {
      setError("Category name is required.");
      setLoading(false);
      return;
    }
    if (!imageUrl) {
      setError("Category image is required.");
      setLoading(false);
      return;
    }

    try {
      await api.post("/api/categories", { category: newCategory.trim(), image: imageUrl });
      setNewCategory("");
      setImageUrl("");
      setSuccess(true);
      onRefresh();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      setError(apiErrorMessage(err, "Failed to add category."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white border border-border-custom rounded-2xl p-6 shadow-xs">
        <h3 className="font-serif text-base font-bold text-primary-dark mb-1">Categories</h3>
        <p className="text-xs text-muted-custom mb-6">
          Images appear on the home page shop-by-category section and in catalog filters.
        </p>

        {categories.length === 0 ? (
          <p className="text-sm text-muted-custom py-8 text-center">No categories yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <div key={cat.id} className={`category-admin-card ${!cat.isActive ? "opacity-60" : ""}`}>
                <div className="category-admin-card-image">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-accent-pink flex items-center justify-center text-primary/30 font-serif text-2xl">
                      {cat.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="category-admin-card-footer">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-primary-dark truncate">
                    {cat.name}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleToggleActive(cat)}
                    disabled={updatingId === cat.id}
                    className={`mt-2 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      cat.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {cat.isActive ? "Active" : "Inactive"}
                  </button>
                  <label className="mt-2 block text-[9px] font-semibold uppercase tracking-wide text-primary cursor-pointer hover:underline">
                    {updatingId === cat.id ? "Uploading..." : "Change image"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={updatingId === cat.id}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleReplaceImage(cat, file);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white border border-border-custom rounded-2xl p-6 shadow-xs max-w-xl">
        <h3 className="font-serif text-base font-bold text-primary-dark mb-4">Add New Category</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl">
              Category added successfully.
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-primary-dark uppercase mb-1">
              Category Name
            </label>
            <input
              type="text"
              required
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="e.g. Waist Chain"
              className="w-full px-4 py-2 border border-border-custom rounded-xl text-xs bg-background/30 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-primary-dark uppercase mb-1">
              Category Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              required={!imageUrl}
              className="text-xs w-full"
            />
            {uploading && <p className="text-[10px] text-muted-custom mt-1">Uploading...</p>}
            {imageUrl && (
              <div className="mt-3 w-24 h-24 rounded-xl overflow-hidden border border-border-custom">
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || uploading}
            className="w-full py-2.5 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white font-semibold text-xs rounded-xl transition-all shine-sweep"
          >
            {loading ? "Adding..." : "Add Category"}
          </button>
        </form>
      </div>
    </div>
  );
}
