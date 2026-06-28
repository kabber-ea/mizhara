import { useEffect, useState } from "react";
import ImageCropModal from "@/components/ImageCropModal";
import ImageFileInput from "@/components/ImageFileInput";
import ImagePreviewThumb from "@/components/ImagePreviewThumb";
import FieldError from "@/components/FieldError";
import FieldLabel from "@/components/FieldLabel";
import { api, apiErrorMessage } from "@/lib/api";
import { fieldInputClass, fieldSectionClass } from "@/lib/form-styles";
import { validateImageFile } from "@/lib/image-upload";import { uploadImageFile } from "@/lib/upload-file";
import type { Category } from "@/types/catalog";

interface CategoryManagerProps {
  categories: Category[];
  onRefresh: () => void;
}

type CropTarget =
  | { type: "new" }
  | { type: "replace"; category: Category };

type PendingCategoryImage = { file: File; preview: string };

export default function CategoryManager({ categories, onRefresh }: CategoryManagerProps) {
  const [newCategory, setNewCategory] = useState("");
  const [pendingImage, setPendingImage] = useState<PendingCategoryImage | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [listError, setListError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; image?: string; submit?: string }>({});
  const [success, setSuccess] = useState(false);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [cropTarget, setCropTarget] = useState<CropTarget | null>(null);

  useEffect(() => {
    return () => {
      if (pendingImage?.preview) {
        URL.revokeObjectURL(pendingImage.preview);
      }
    };
  }, [pendingImage]);

  const openCrop = (file: File, target: CropTarget) => {
    setCropFile(file);
    setCropTarget(target);
    setFieldErrors((prev) => ({ ...prev, image: undefined }));
  };

  const closeCrop = () => {
    setCropFile(null);
    setCropTarget(null);
  };

  const handleCropComplete = async (croppedFile: File) => {
    const target = cropTarget;
    closeCrop();
    if (!target) return;

    if (target.type === "new") {
      if (pendingImage?.preview) {
        URL.revokeObjectURL(pendingImage.preview);
      }
      setPendingImage({
        file: croppedFile,
        preview: URL.createObjectURL(croppedFile),
      });
      setFieldErrors((prev) => ({ ...prev, image: undefined }));
      return;
    }

    setUploading(true);
    setListError("");
    setUpdatingId(target.category.id);

    try {
      const url = await uploadImageFile(croppedFile);
      await api.put("/api/categories", {
        id: target.category.id,
        name: target.category.name,
        image: url,
      });
      onRefresh();
    } catch (err: unknown) {
      setListError(apiErrorMessage(err, "Failed to update category image."));
    } finally {
      setUploading(false);
      setUpdatingId(null);
    }
  };

  const handleToggleActive = async (category: Category) => {
    if (!category.image) return;
    setUpdatingId(category.id);
    setListError("");
    try {
      await api.put("/api/categories", {
        id: category.id,
        name: category.name,
        image: category.image,
        isActive: !category.isActive,
      });
      onRefresh();
    } catch (err: unknown) {
      setListError(apiErrorMessage(err, "Failed to update category status."));
    } finally {
      setUpdatingId(null);
    }
  };

  const removePendingImage = () => {
    if (pendingImage?.preview) URL.revokeObjectURL(pendingImage.preview);
    setPendingImage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);

    const errors: { name?: string; image?: string } = {};
    if (!newCategory.trim()) errors.name = "Category name is required.";
    if (!pendingImage) errors.image = "Category image is required.";
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setLoading(true);

    const image = pendingImage!;

    try {
      const imageUrl = await uploadImageFile(image.file);
      await api.post("/api/categories", { category: newCategory.trim(), image: imageUrl });
      setNewCategory("");
      if (image.preview) {
        URL.revokeObjectURL(image.preview);
      }
      setPendingImage(null);
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
      {cropFile && cropTarget && (
        <ImageCropModal
          file={cropFile}
          preset="card"
          title={cropTarget.type === "new" ? "Crop category image" : "Update category image"}
          onCancel={closeCrop}
          onComplete={handleCropComplete}
        />
      )}

      <div className="bg-white border border-border-custom rounded-2xl p-6 shadow-xs">
        <h3 className="font-serif text-base font-bold text-primary-dark mb-1">Categories</h3>
        <p className="text-xs text-muted-custom mb-6">
          Images appear on the home page shop-by-category section and in catalog filters.
        </p>

        {listError && !loading && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
            {listError}
          </div>
        )}

        {categories.length === 0 ? (
          <p className="text-sm text-muted-custom py-8 text-center">No categories yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <div key={cat.id} className={`rounded-2xl border border-border-custom overflow-hidden bg-white ${!cat.isActive ? "opacity-60" : ""}`}>
                <div className="aspect-square overflow-hidden bg-accent-pink">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-accent-pink flex items-center justify-center text-primary/30 font-serif text-2xl">
                      {cat.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="p-3 border-t border-border-custom">
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
                    {updatingId === cat.id ? "Uploading…" : "Change image"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden cursor-pointer"
                      disabled={updatingId === cat.id || !!cropFile}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        e.target.value = "";
                        if (!file) return;
                        const validationError = validateImageFile(file);
                        if (validationError) {
                          setListError(validationError);
                          return;
                        }
                        openCrop(file, { type: "replace", category: cat });
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

          <div className={fieldSectionClass(!!fieldErrors.image)}>
            <FieldLabel required className="block text-[10px] font-bold text-primary-dark uppercase mb-2">
              Category Image
            </FieldLabel>
            {!pendingImage ? (
              <ImageFileInput
                onSelect={(file) => openCrop(file, { type: "new" })}
                disabled={loading || !!cropFile || uploading}
                label="Choose file"
                preset="card"
                error={fieldErrors.image}
                errorId="category-image-error"
              />
            ) : (
              <div className="mt-1">
                <ImagePreviewThumb
                  src={pendingImage.preview}
                  pending
                  onRemove={removePendingImage}
                />
              </div>
            )}
            {pendingImage && <FieldError message={fieldErrors.image} id="category-image-error-preview" />}
          </div>
          <FieldError message={fieldErrors.submit} />
          <button
            type="submit"
            disabled={loading || uploading || !!cropFile}
            className="w-full py-2.5 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white font-semibold text-xs rounded-xl transition-all shine-sweep cursor-pointer"
          >
            {loading ? "Adding…" : "Add Category"}
          </button>
        </form>
      </div>
    </div>
  );
}
