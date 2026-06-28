import { useCallback, useEffect, useState } from "react";
import ImageCropModal from "@/components/ImageCropModal";
import ImageFileInput from "@/components/ImageFileInput";
import ImagePreviewThumb from "@/components/ImagePreviewThumb";
import FormSettingToggle from "@/components/FormSettingToggle";
import FieldError from "@/components/FieldError";
import FieldLabel, { RequiredMark, fieldLabelClassLg } from "@/components/FieldLabel";
import { api, apiErrorMessage } from "@/lib/api";
import { fieldInputClass, fieldSectionClass } from "@/lib/form-styles";
import { hasFeaturedBanners, type CropPreset } from "@/lib/image-upload";
import { uploadImageFile } from "@/lib/upload-file";
import type { AdminProduct } from "@/types/catalog";

type PendingImage = { file: File; preview: string };

type ProductField =
  | "name"
  | "category"
  | "costPrice"
  | "price"
  | "stockQuantity"
  | "images"
  | "bannerDesktop"
  | "bannerMobile"
  | "featured"
  | "submit";

interface ProductFormProps {
  categories: string[];
  editingProduct: AdminProduct | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ProductForm({ categories, editingProduct, onSuccess, onCancel }: ProductFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [price, setPrice] = useState("");
  const [materials, setMaterials] = useState("");
  const [sizes, setSizes] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [stockQuantity, setStockQuantity] = useState("10");
  const [savedImages, setSavedImages] = useState<string[]>([]);
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [savedBannerDesktop, setSavedBannerDesktop] = useState("");
  const [savedBannerMobile, setSavedBannerMobile] = useState("");
  const [pendingBannerDesktop, setPendingBannerDesktop] = useState<PendingImage | null>(null);
  const [pendingBannerMobile, setPendingBannerMobile] = useState<PendingImage | null>(null);
  const [loading, setLoading] = useState(false);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [cropPreset, setCropPreset] = useState<CropPreset["id"]>("card");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<ProductField, string>>>({});

  const clearFieldError = useCallback((field: ProductField) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name || "");
      setDescription(editingProduct.description || "");
      setCategory(editingProduct.category || categories[0] || "");
      setCostPrice(editingProduct.costPrice != null ? String(editingProduct.costPrice) : "");
      setPrice(editingProduct.price ? String(editingProduct.price) : "");
      setMaterials(editingProduct.materials ? editingProduct.materials.join(", ") : "");
      setSizes(editingProduct.sizes ? editingProduct.sizes.join(", ") : "");
      setIsFeatured(!!editingProduct.isFeatured);
      setIsActive(editingProduct.isActive !== false);
      setStockQuantity(editingProduct.stockQuantity != null ? String(editingProduct.stockQuantity) : "0");
      setSavedImages(editingProduct.images || []);
      setSavedBannerDesktop(editingProduct.bannerImage || "");
      setSavedBannerMobile(editingProduct.bannerImageMobile || "");
    } else {
      setName("");
      setDescription("");
      setCategory(categories[0] || "");
      setCostPrice("");
      setPrice("");
      setMaterials("925 Sterling Silver, Cubic Zirconia");
      setSizes("");
      setIsFeatured(false);
      setIsActive(true);
      setStockQuantity("10");
      setSavedImages([]);
      setSavedBannerDesktop("");
      setSavedBannerMobile("");
    }
    setPendingImages([]);
    setPendingBannerDesktop(null);
    setPendingBannerMobile(null);
    setFieldErrors({});
  }, [editingProduct, categories]);

  useEffect(() => {
    return () => {
      pendingImages.forEach((item) => URL.revokeObjectURL(item.preview));
      if (pendingBannerDesktop?.preview) URL.revokeObjectURL(pendingBannerDesktop.preview);
      if (pendingBannerMobile?.preview) URL.revokeObjectURL(pendingBannerMobile.preview);
    };
  }, [pendingImages, pendingBannerDesktop, pendingBannerMobile]);

  const hasDesktopBanner = Boolean(savedBannerDesktop || pendingBannerDesktop);
  const hasMobileBanner = Boolean(savedBannerMobile || pendingBannerMobile);
  const hasBanners = hasFeaturedBanners(
    savedBannerDesktop,
    savedBannerMobile,
    !!pendingBannerDesktop,
    !!pendingBannerMobile,
  );
  const hasImages = savedImages.length > 0 || pendingImages.length > 0;

  const desktopBannerPreview = pendingBannerDesktop?.preview || savedBannerDesktop || null;
  const mobileBannerPreview = pendingBannerMobile?.preview || savedBannerMobile || null;

  const collectValidationErrors = useCallback((): Partial<Record<ProductField, string>> => {
    const errors: Partial<Record<ProductField, string>> = {};

    if (!name.trim()) errors.name = "Product name is required.";
    if (!category) errors.category = "Please select a category.";
    if (!costPrice.trim() || Number(costPrice) <= 0) {
      errors.costPrice = "Unit cost must be greater than zero.";
    }
    if (!price.trim() || Number(price) <= 0) {
      errors.price = "Retail price must be greater than zero.";
    }
    if (stockQuantity.trim() === "" || Number(stockQuantity) < 0) {
      errors.stockQuantity = "Enter a valid stock quantity.";
    }
    if (!hasImages) errors.images = "At least one product image is required.";

    if (isFeatured) {
      if (!hasDesktopBanner) {
        errors.bannerDesktop = "Desktop banner is required for featured items.";
      }
      if (!hasMobileBanner) {
        errors.bannerMobile = "Mobile banner is required for featured items.";
      }
      if (!hasBanners) {
        errors.featured = "Add both banner images to save as featured.";
      }
    }

    return errors;
  }, [
    name,
    category,
    costPrice,
    price,
    stockQuantity,
    hasImages,
    isFeatured,
    hasDesktopBanner,
    hasMobileBanner,
    hasBanners,
  ]);

  const openCrop = (file: File, preset: CropPreset["id"]) => {
    setCropPreset(preset);
    setCropFile(file);
  };

  const handleCropComplete = (croppedFile: File) => {
    const preview = URL.createObjectURL(croppedFile);
    setCropFile(null);

    if (cropPreset === "bannerDesktop") {
      if (pendingBannerDesktop?.preview) URL.revokeObjectURL(pendingBannerDesktop.preview);
      setPendingBannerDesktop({ file: croppedFile, preview });
      setSavedBannerDesktop("");
      clearFieldError("bannerDesktop");
      return;
    }

    if (cropPreset === "bannerMobile") {
      if (pendingBannerMobile?.preview) URL.revokeObjectURL(pendingBannerMobile.preview);
      setPendingBannerMobile({ file: croppedFile, preview });
      setSavedBannerMobile("");
      clearFieldError("bannerMobile");
      return;
    }

    setPendingImages((prev) => [...prev, { file: croppedFile, preview }]);
    clearFieldError("images");
  };

  const removePendingImage = (preview: string) => {
    setPendingImages((prev) => {
      const item = prev.find((p) => p.preview === preview);
      if (item) URL.revokeObjectURL(item.preview);
      const next = prev.filter((p) => p.preview !== preview);
      if (savedImages.length + next.length > 0) clearFieldError("images");
      return next;
    });
  };

  const removeSavedImage = (url: string) => {
    setSavedImages((prev) => {
      const next = prev.filter((img) => img !== url);
      if (next.length + pendingImages.length > 0) clearFieldError("images");
      return next;
    });
  };

  const removeBannerDesktop = () => {
    if (pendingBannerDesktop?.preview) URL.revokeObjectURL(pendingBannerDesktop.preview);
    setPendingBannerDesktop(null);
    setSavedBannerDesktop("");
  };

  const removeBannerMobile = () => {
    if (pendingBannerMobile?.preview) URL.revokeObjectURL(pendingBannerMobile.preview);
    setPendingBannerMobile(null);
    setSavedBannerMobile("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = collectValidationErrors();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    setFieldErrors({});
    setLoading(true);

    try {
      const uploadedUrls = await Promise.all(pendingImages.map((item) => uploadImageFile(item.file)));
      const images = [...savedImages, ...uploadedUrls];

      let bannerImage = savedBannerDesktop;
      if (pendingBannerDesktop) {
        bannerImage = await uploadImageFile(pendingBannerDesktop.file);
      }

      let bannerImageMobile = savedBannerMobile;
      if (pendingBannerMobile) {
        bannerImageMobile = await uploadImageFile(pendingBannerMobile.file);
      }

      const payload = {
        id: editingProduct?.id,
        name: name.trim(),
        description,
        category,
        costPrice: Number(costPrice),
        price: Number(price),
        materials: materials.split(",").map((m) => m.trim()).filter(Boolean),
        sizes: sizes.split(",").map((s) => s.trim()).filter(Boolean) || ["One Size"],
        isFeatured,
        isActive,
        stockQuantity: Math.max(0, Number(stockQuantity) || 0),
        images,
        bannerImage: bannerImage || undefined,
        bannerImageMobile: bannerImageMobile || undefined,
      };

      if (editingProduct) {
        await api.put("/api/products", payload);
      } else {
        await api.post("/api/products", payload);
      }
      onSuccess();
    } catch (err: unknown) {
      setFieldErrors({ submit: apiErrorMessage(err, "Failed to save product.") });
    } finally {
      setLoading(false);
    }
  };

  const cropModalTitle =
    cropPreset === "bannerDesktop"
      ? "Crop desktop banner"
      : cropPreset === "bannerMobile"
        ? "Crop mobile banner"
        : "Crop product image";

  return (
    <>
      {cropFile && (
        <ImageCropModal
          file={cropFile}
          preset={cropPreset}
          title={cropModalTitle}
          onCancel={() => setCropFile(null)}
          onComplete={handleCropComplete}
        />
      )}
      <form onSubmit={handleSubmit} noValidate className="p-6 bg-white border border-border-custom rounded-2xl space-y-4">
        <h3 className="font-serif text-base font-bold text-primary-dark">
          {editingProduct ? "Edit Ornament" : "Add New Ornament"}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <FieldLabel required>Name</FieldLabel>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                clearFieldError("name");
              }}
              className={fieldInputClass(!!fieldErrors.name)}
            />
            <FieldError message={fieldErrors.name} />
          </div>
          <div>
            <FieldLabel required>Category</FieldLabel>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                clearFieldError("category");
              }}
              className={fieldInputClass(!!fieldErrors.category)}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <FieldError message={fieldErrors.category} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <FieldLabel required>Unit Cost (INR ₹)</FieldLabel>
            <input
              type="number"
              step="1"
              inputMode="numeric"
              value={costPrice}
              onChange={(e) => {
                setCostPrice(e.target.value);
                clearFieldError("costPrice");
              }}
              placeholder="800"
              className={fieldInputClass(!!fieldErrors.costPrice)}
            />
            <FieldError message={fieldErrors.costPrice} />
            <p className="text-[10px] text-muted-custom mt-1">Your cost to source or make this item</p>
          </div>
          <div>
            <FieldLabel required>Retail Price (INR ₹)</FieldLabel>
            <input
              type="number"
              step="1"
              inputMode="numeric"
              value={price}
              onChange={(e) => {
                setPrice(e.target.value);
                clearFieldError("price");
              }}
              placeholder="1999"
              className={fieldInputClass(!!fieldErrors.price)}
            />
            <FieldError message={fieldErrors.price} />
            <p className="text-[10px] text-muted-custom mt-1">Price shown to customers</p>
          </div>
        </div>

        <div>
          <FieldLabel required>Stock Quantity</FieldLabel>
          <input
            type="number"
            step="1"
            inputMode="numeric"
            value={stockQuantity}
            onChange={(e) => {
              setStockQuantity(e.target.value);
              clearFieldError("stockQuantity");
            }}
            placeholder="25"
            className={`${fieldInputClass(!!fieldErrors.stockQuantity)} max-w-xs`}
          />
          <FieldError message={fieldErrors.stockQuantity} />
          <p className="text-[10px] text-muted-custom mt-1">Auto-decreases when customers complete orders</p>
        </div>

        <div className={fieldSectionClass(!!fieldErrors.images)}>
          <FieldLabel required className={fieldLabelClassLg}>
            Product Images
          </FieldLabel>
          <ImageFileInput
            onSelect={(file) => openCrop(file, "card")}
            disabled={loading || !!cropFile}
            label="Choose file"
            preset="card"
            error={fieldErrors.images}
            errorId="product-images-error"
          />
          {hasImages && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {savedImages.map((url) => (
                <ImagePreviewThumb key={url} src={url} onRemove={() => removeSavedImage(url)} />
              ))}
              {pendingImages.map((item) => (
                <ImagePreviewThumb
                  key={item.preview}
                  src={item.preview}
                  pending
                  onRemove={() => removePendingImage(item.preview)}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <FieldLabel required={isFeatured}>Banner Images</FieldLabel>
          <p className="text-[10px] text-muted-custom mb-3">
            Required when saving as featured — desktop (wide) and mobile (portrait).
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              className={`rounded-xl border p-3 bg-background/30 ${
                fieldErrors.bannerDesktop ? "border-rose-300 ring-1 ring-rose-200 bg-rose-50/20" : "border-border-custom/80"
              }`}
            >
              <p className="text-[10px] font-bold uppercase text-primary-dark mb-2">
                Desktop banner {isFeatured && <RequiredMark />}
              </p>
              {!desktopBannerPreview ? (
                <ImageFileInput
                  onSelect={(file) => openCrop(file, "bannerDesktop")}
                  disabled={loading || !!cropFile}
                  label="Choose desktop"
                  preset="bannerDesktop"
                  error={fieldErrors.bannerDesktop}
                  errorId="banner-desktop-error"
                />
              ) : (
                <>
                  <ImagePreviewThumb
                    src={desktopBannerPreview}
                    variant="wide"
                    pending={!!pendingBannerDesktop}
                    onRemove={removeBannerDesktop}
                  />
                  <FieldError message={fieldErrors.bannerDesktop} id="banner-desktop-error" />
                </>
              )}
            </div>
            <div
              className={`rounded-xl border p-3 bg-background/30 ${
                fieldErrors.bannerMobile ? "border-rose-300 ring-1 ring-rose-200 bg-rose-50/20" : "border-border-custom/80"
              }`}
            >
              <p className="text-[10px] font-bold uppercase text-primary-dark mb-2">
                Mobile banner {isFeatured && <RequiredMark />}
              </p>
              {!mobileBannerPreview ? (
                <ImageFileInput
                  onSelect={(file) => openCrop(file, "bannerMobile")}
                  disabled={loading || !!cropFile}
                  label="Choose mobile"
                  preset="bannerMobile"
                  error={fieldErrors.bannerMobile}
                  errorId="banner-mobile-error"
                />
              ) : (
                <>
                  <ImagePreviewThumb
                    src={mobileBannerPreview}
                    variant="tall"
                    pending={!!pendingBannerMobile}
                    onRemove={removeBannerMobile}
                  />
                  <FieldError message={fieldErrors.bannerMobile} id="banner-mobile-error" />
                </>
              )}
            </div>
          </div>
        </div>

        <div
          className={`rounded-2xl border bg-accent-pink/10 p-4 sm:p-5 ${
            fieldErrors.featured ? "border-rose-300 ring-1 ring-rose-200" : "border-border-custom/80"
          }`}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary-dark mb-1">
            Storefront
          </p>
          <p className="text-[10px] text-muted-custom mb-4">
            Control how this ornament appears on your shop.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormSettingToggle
              id="product-visible"
              label="Visible to customers"
              description="Hide while you prepare listing details."
              checked={isActive}
              onChange={setIsActive}
            />
            <FormSettingToggle
              id="product-featured"
              label="Featured on homepage"
              description="Requires both banner images when you save."
              checked={isFeatured}
              onChange={(checked) => {
                setIsFeatured(checked);
                clearFieldError("featured");
                clearFieldError("bannerDesktop");
                clearFieldError("bannerMobile");
              }}
              error={fieldErrors.featured}
            />
          </div>
        </div>

        <div>
          <FieldLabel>Materials (comma separated)</FieldLabel>
          <input
            type="text"
            value={materials}
            onChange={(e) => setMaterials(e.target.value)}
            className="w-full px-4 py-2 border border-border-custom rounded-xl text-xs"
          />
        </div>
        <div>
          <FieldLabel>Sizes (comma separated)</FieldLabel>
          <input
            type="text"
            value={sizes}
            onChange={(e) => setSizes(e.target.value)}
            className="w-full px-4 py-2 border border-border-custom rounded-xl text-xs"
          />
        </div>
        <div>
          <FieldLabel>Description</FieldLabel>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border border-border-custom rounded-xl text-xs"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 pt-3 border-t">
          <FieldError message={fieldErrors.submit} id="product-submit-error" />
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2 border border-border-custom text-xs font-semibold rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !!cropFile}
              className="px-6 py-2 bg-primary text-white text-xs font-semibold rounded-xl shine-sweep disabled:bg-primary/50 cursor-pointer"
            >
              {loading ? "Saving…" : editingProduct ? "Update" : "Save"}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
