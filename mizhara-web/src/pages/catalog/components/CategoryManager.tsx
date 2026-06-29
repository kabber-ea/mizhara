import { useState } from "react";
import FieldError from "@/components/FieldError";
import FieldLabel from "@/components/FieldLabel";
import { api, apiErrorMessage } from "@/lib/api";
import { fieldInputClass } from "@/lib/form-styles";
import type { Category } from "@/types/catalog";

interface CategoryManagerProps {
  categories: Category[];
  onRefresh: () => void;
}

export default function CategoryManager({ categories, onRefresh }: CategoryManagerProps) {
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [listError, setListError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; submit?: string }>({});
  const [success, setSuccess] = useState(false);

  const handleToggleActive = async (category: Category) => {
    setUpdatingId(category.id);
    setListError("");
    try {
      await api.put("/api/categories", {
        id: category.id,
        name: category.name,
        isActive: !category.isActive,
      });
      onRefresh();
    } catch (err: unknown) {
      setListError(apiErrorMessage(err, "Failed to update category status."));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);

    if (!newCategory.trim()) {
      setFieldErrors({ name: "Category name is required." });
      return;
    }

    setFieldErrors({});
    setLoading(true);

    try {
      await api.post("/api/categories", { category: newCategory.trim() });
      setNewCategory("");
      setSuccess(true);
      onRefresh();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      setFieldErrors({ submit: apiErrorMessage(err, "Failed to add category.") });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white border border-border-custom rounded-2xl p-6 shadow-xs">
        <h3 className="font-serif text-base font-bold text-primary-dark mb-1">Categories</h3>
        <p className="text-xs text-muted-custom mb-6">
          Categories appear in the shop filter and navigation strip.
        </p>

        {listError && !loading && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
            {listError}
          </div>
        )}

        {categories.length === 0 ? (
          <p className="text-sm text-muted-custom py-8 text-center">No categories yet.</p>
        ) : (
          <ul className="divide-y divide-border-custom border border-border-custom rounded-xl overflow-hidden">
            {categories.map((cat) => (
              <li
                key={cat.id}
                className={`flex items-center justify-between gap-4 px-4 py-3 bg-white ${!cat.isActive ? "opacity-60" : ""}`}
              >
                <p className="text-sm font-semibold text-primary-dark">{cat.name}</p>
                <button
                  type="button"
                  onClick={() => handleToggleActive(cat)}
                  disabled={updatingId === cat.id}
                  className={`shrink-0 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                    cat.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {updatingId === cat.id ? "Saving…" : cat.isActive ? "Active" : "Inactive"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white border border-border-custom rounded-2xl p-6 shadow-xs max-w-xl">
        <h3 className="font-serif text-base font-bold text-primary-dark mb-4">Add New Category</h3>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl">
              Category added successfully.
            </div>
          )}

          <div>
            <FieldLabel required className="block text-[10px] font-bold text-primary-dark uppercase mb-1">
              Category Name
            </FieldLabel>
            <input
              type="text"
              value={newCategory}
              onChange={(e) => {
                setNewCategory(e.target.value);
                setFieldErrors((prev) => ({ ...prev, name: undefined }));
              }}
              placeholder="e.g. Waist Chain"
              className={`${fieldInputClass(!!fieldErrors.name)} bg-background/30`}
            />
            <FieldError message={fieldErrors.name} />
          </div>

          <FieldError message={fieldErrors.submit} />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white font-semibold text-xs rounded-xl transition-all shine-sweep cursor-pointer"
          >
            {loading ? "Adding…" : "Add Category"}
          </button>
        </form>
      </div>
    </div>
  );
}
