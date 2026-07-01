import { useMemo, useState } from "react";
import FieldError from "@/components/FieldError";
import SearchInput from "@/components/SearchInput";
import { TableDeleteButton, TableEditButton } from "@/components/TableIconButtons";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { api, apiErrorMessage } from "@/lib/api";
import { fieldInputClass } from "@/lib/form-styles";
import type { Category } from "@/types/catalog";

interface CategoryManagerProps {
  categories: Category[];
  onRefresh: () => void;
}

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden>
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden>
      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
    </svg>
  );
}

export default function CategoryManager({ categories, onRefresh }: CategoryManagerProps) {
  const { confirm, dialog } = useConfirmDialog();
  const [newCategory, setNewCategory] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editError, setEditError] = useState("");
  const [listError, setListError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; submit?: string }>({});
  const [success, setSuccess] = useState(false);

  const activeCount = categories.filter((c) => c.isActive).length;
  const inactiveCount = categories.length - activeCount;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [categories, search]);

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

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setEditName(category.name);
    setEditError("");
    setListError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditError("");
  };

  const saveEdit = async (category: Category) => {
    const name = editName.trim();
    if (!name) {
      setEditError("Name is required.");
      return;
    }
    if (name === category.name) {
      cancelEdit();
      return;
    }

    setUpdatingId(category.id);
    setEditError("");
    try {
      await api.put("/api/categories", {
        id: category.id,
        name,
        isActive: category.isActive,
      });
      cancelEdit();
      onRefresh();
    } catch (err: unknown) {
      setEditError(apiErrorMessage(err, "Failed to update category."));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (category: Category) => {
    const ok = await confirm({
      title: "Delete this category?",
      message: `“${category.name}” will be permanently removed. Categories with products cannot be deleted.`,
    });
    if (!ok) return;

    setUpdatingId(category.id);
    setListError("");
    try {
      await api.delete(`/api/categories?id=${encodeURIComponent(category.id)}`);
      if (editingId === category.id) cancelEdit();
      onRefresh();
    } catch (err: unknown) {
      setListError(apiErrorMessage(err, "Failed to delete category."));
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
    <div className="bg-white border border-border-custom rounded-2xl overflow-hidden shadow-xs">
      {dialog}

      <div className="p-6 space-y-5 border-b border-border-custom/50">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <h3 className="font-serif text-base font-bold text-primary-dark">Category Directory</h3>
            <p className="text-xs text-muted-custom mt-1">
              Organize ornaments for shop filters and the navigation strip.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-accent-mint/40 text-primary-dark">
                {categories.length} total
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700">
                {activeCount} active
              </span>
              {inactiveCount > 0 && (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-gray-100 text-gray-600">
                  {inactiveCount} inactive
                </span>
              )}
            </div>
          </div>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search categories…"
          />
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col sm:flex-row gap-2 sm:items-start">
          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => {
                setNewCategory(e.target.value);
                setFieldErrors((prev) => ({ ...prev, name: undefined, submit: undefined }));
              }}
              placeholder="New category name, e.g. Waist Chain"
              className={`${fieldInputClass(!!fieldErrors.name)} bg-background/30 w-full`}
            />
            <FieldError message={fieldErrors.name} />
            <FieldError message={fieldErrors.submit} />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="shrink-0 px-5 py-2.5 bg-primary-dark hover:bg-primary disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wide rounded-xl transition-colors"
          >
            {loading ? "Adding…" : "Add Category"}
          </button>
        </form>

        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl">
            Category added successfully.
          </div>
        )}

        {listError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
            {listError}
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-14 px-6">
          <p className="text-sm text-muted-custom">
            {search.trim() ? "No categories match your search." : "No categories yet. Add one above."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border-custom/50 text-xs text-left">
            <thead>
              <tr className="text-primary-dark bg-accent-mint/10">
                <th className="px-4 py-3 font-bold uppercase text-[10px]">Category</th>
                <th className="px-4 py-3 font-bold uppercase text-[10px] text-center">Status</th>
                <th className="px-4 py-3 font-bold uppercase text-[10px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-custom/50">
              {filtered.map((cat) => {
                const isEditing = editingId === cat.id;
                const isBusy = updatingId === cat.id;

                return (
                  <tr
                    key={cat.id}
                    className={`hover:bg-accent-pink/5 transition-colors ${!cat.isActive ? "opacity-70" : ""} ${isEditing ? "bg-accent-mint/10" : ""}`}
                  >
                    <td className="px-4 py-3 min-w-[180px]">
                      {isEditing ? (
                        <div className="space-y-1">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => {
                              setEditName(e.target.value);
                              setEditError("");
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEdit(cat);
                              if (e.key === "Escape") cancelEdit();
                            }}
                            autoFocus
                            className={`${fieldInputClass(!!editError)} py-1.5`}
                          />
                          {editError && (
                            <p className="text-[10px] text-rose-600 font-semibold">{editError}</p>
                          )}
                        </div>
                      ) : (
                        <p className="font-semibold text-foreground">{cat.name}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {!isEditing && (
                        <button
                          type="button"
                          onClick={() => handleToggleActive(cat)}
                          disabled={isBusy}
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase transition-colors ${
                            cat.isActive
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }`}
                        >
                          {isBusy ? "…" : cat.isActive ? "Active" : "Inactive"}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {isEditing ? (
                        <div className="inline-flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => saveEdit(cat)}
                            disabled={isBusy}
                            aria-label="Save"
                            title="Save"
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                          >
                            <CheckIcon />
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            aria-label="Cancel"
                            title="Cancel"
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-border-custom text-muted-custom hover:bg-accent-mint/20"
                          >
                            <CloseIcon />
                          </button>
                        </div>
                      ) : (
                        <div className="inline-flex items-center justify-end gap-1">
                          <TableEditButton onClick={() => startEdit(cat)} label="Edit category" />
                          <TableDeleteButton onClick={() => handleDelete(cat)} label="Delete category" />
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
