import { useState, useEffect, useCallback } from "react";
import FieldError from "@/components/FieldError";
import FieldLabel, { fieldLabelClassLg } from "@/components/FieldLabel";
import { useFieldErrors } from "@/hooks/use-field-errors";
import { api, apiErrorMessage } from "@/lib/api";
import { fieldInputClass, fieldSectionClass } from "@/lib/form-styles";
import { isNonNegativeAmount, isNonNegativeInt, isPositiveNumber, parseAmountInput, parseNonNegativeAmountInput } from "@/lib/form-validation";
import type { Offer, OfferInput, OfferType } from "@/types/offer";
import type { AdminProduct } from "@/types/catalog";

type OfferField =
  | "name"
  | "percentage"
  | "fixedAmount"
  | "minPurchase"
  | "maxDiscount"
  | "buyQuantity"
  | "freeQuantity"
  | "products"
  | "startsAt"
  | "endsAt"
  | "submit";

interface OfferFormProps {
  products: AdminProduct[];
  editingOffer: Offer | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function OfferForm({ products, editingOffer, onSuccess, onCancel }: OfferFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<OfferType>("percentage");
  const [scope, setScope] = useState<"all" | "selected">("all");
  const [percentage, setPercentage] = useState("20");
  const [fixedAmount, setFixedAmount] = useState("500");
  const [minPurchase, setMinPurchase] = useState("");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [buyQuantity, setBuyQuantity] = useState("2");
  const [freeQuantity, setFreeQuantity] = useState("1");
  const [productIds, setProductIds] = useState<string[]>([]);
  const [code, setCode] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [loading, setLoading] = useState(false);
  const { fieldErrors, setFieldErrors, clearFieldError } = useFieldErrors<OfferField>();

  useEffect(() => {
    if (editingOffer) {
      setName(editingOffer.name);
      setDescription(editingOffer.description || "");
      setType(editingOffer.type);
      setScope(editingOffer.scope);
      setPercentage(String(editingOffer.percentage ?? 20));
      setFixedAmount(String(editingOffer.fixedAmount ?? 500));
      setMinPurchase(editingOffer.minPurchase ? String(editingOffer.minPurchase) : "");
      setMaxDiscount(editingOffer.maxDiscount ? String(editingOffer.maxDiscount) : "");
      setBuyQuantity(String(editingOffer.buyQuantity ?? 2));
      setFreeQuantity(String(editingOffer.freeQuantity ?? 1));
      setProductIds(editingOffer.productIds || []);
      setCode(editingOffer.code || "");
      setIsActive(editingOffer.isActive);
      setStartsAt(editingOffer.startsAt ? editingOffer.startsAt.slice(0, 16) : "");
      setEndsAt(editingOffer.endsAt ? editingOffer.endsAt.slice(0, 16) : "");
    } else {
      setName("");
      setDescription("");
      setType("percentage");
      setScope("all");
      setPercentage("20");
      setFixedAmount("500");
      setMinPurchase("");
      setMaxDiscount("");
      setBuyQuantity("2");
      setFreeQuantity("1");
      setProductIds([]);
      setCode("");
      setIsActive(true);
      setStartsAt("");
      setEndsAt("");
    }
    setFieldErrors({});
  }, [editingOffer, setFieldErrors]);

  const toggleProduct = (id: string) => {
    setProductIds((prev) => {
      const next = prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id];
      if (next.length > 0) clearFieldError("products");
      return next;
    });
  };

  const collectValidationErrors = useCallback((): Partial<Record<OfferField, string>> => {
    const errors: Partial<Record<OfferField, string>> = {};
    if (!name.trim()) errors.name = "Offer title is required.";

    if (type === "percentage") {
      const pct = Number(percentage);
      if (!isPositiveNumber(percentage) || pct > 100) {
        errors.percentage = "Enter a discount between 1 and 100.";
      }
    } else if (type === "fixed") {
      if (!isPositiveNumber(fixedAmount)) {
        errors.fixedAmount = "Enter a fixed discount greater than 0.";
      }
    } else {
      if (!isPositiveNumber(buyQuantity)) errors.buyQuantity = "Buy quantity must be at least 1.";
      if (!isPositiveNumber(freeQuantity)) errors.freeQuantity = "Free quantity must be at least 1.";
    }

    if (minPurchase.trim() && !isNonNegativeAmount(minPurchase)) {
      errors.minPurchase = "Enter a valid minimum purchase amount.";
    }
    if (maxDiscount.trim() && !isNonNegativeAmount(maxDiscount)) {
      errors.maxDiscount = "Enter a valid maximum discount amount.";
    }
    if (type !== "percentage" && maxDiscount.trim()) {
      errors.maxDiscount = "Maximum discount applies to percentage offers only.";
    }

    if (scope === "selected" && productIds.length === 0) {
      errors.products = "Select at least one product.";
    }

    if (startsAt && endsAt && new Date(endsAt) < new Date(startsAt)) {
      errors.endsAt = "End date must be after start date.";
    }

    return errors;
  }, [name, type, percentage, fixedAmount, minPurchase, maxDiscount, buyQuantity, freeQuantity, scope, productIds, startsAt, endsAt]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = collectValidationErrors();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    setFieldErrors({});
    setLoading(true);

    const payload: OfferInput = {
      id: editingOffer?.id,
      name: name.trim(),
      description,
      type,
      scope,
      percentage: Number(percentage) || 0,
      fixedAmount: parseAmountInput(fixedAmount) ?? 0,
      minPurchase: minPurchase.trim() ? (parseNonNegativeAmountInput(minPurchase) ?? 0) : 0,
      maxDiscount: type === "percentage" && maxDiscount.trim() ? (parseNonNegativeAmountInput(maxDiscount) ?? 0) : 0,
      buyQuantity: Number(buyQuantity) || 0,
      freeQuantity: Number(freeQuantity) || 0,
      productIds: scope === "selected" ? productIds : [],
      code: code.trim(),
      isActive,
      startsAt: startsAt ? new Date(startsAt).toISOString() : null,
      endsAt: endsAt ? new Date(endsAt).toISOString() : null,
    };

    try {
      if (editingOffer) {
        await api.put("/api/offers", payload);
      } else {
        await api.post("/api/offers", payload);
      }
      onSuccess();
    } catch (err: unknown) {
      setFieldErrors({ submit: apiErrorMessage(err, "Failed to save offer.") });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="p-6 bg-white border border-border-custom rounded-2xl space-y-5">
      <h3 className="font-serif text-base font-bold text-primary-dark">
        {editingOffer ? "Edit Offer" : "New Offer"}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <FieldLabel required>Offer Title</FieldLabel>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              clearFieldError("name");
            }}
            placeholder="Festive Offer"
            className={fieldInputClass(!!fieldErrors.name)}
          />
          <p className="text-[10px] text-muted-custom mt-1.5">
            Shown in the top announcement bar (e.g. Festive Offer - Upto 20% off on all items).
          </p>
          <FieldError message={fieldErrors.name} />
        </div>
        <div>
          <FieldLabel>Coupon Code (optional)</FieldLabel>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Leave empty to auto-apply"
            className="w-full px-4 py-2 border border-border-custom rounded-xl text-xs uppercase"
          />
          <p className="text-[10px] text-muted-custom mt-1">No code = best deal auto-applies at checkout</p>
        </div>
      </div>

      <div>
        <FieldLabel>Description</FieldLabel>
        <textarea
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-2 border border-border-custom rounded-xl text-xs"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <FieldLabel>Offer Type</FieldLabel>
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value as OfferType);
              clearFieldError("percentage");
              clearFieldError("fixedAmount");
              clearFieldError("buyQuantity");
              clearFieldError("freeQuantity");
              clearFieldError("maxDiscount");
            }}
            className="w-full px-4 py-2 border border-border-custom rounded-xl text-xs"
          >
            <option value="percentage">Percentage off</option>
            <option value="fixed">Fixed amount off</option>
            <option value="bogo">Buy X Get Y Free</option>
          </select>
        </div>
        <div>
          <FieldLabel>Applies To</FieldLabel>
          <select
            value={scope}
            onChange={(e) => {
              setScope(e.target.value as "all" | "selected");
              clearFieldError("products");
            }}
            className="w-full px-4 py-2 border border-border-custom rounded-xl text-xs"
          >
            <option value="all">All products</option>
            <option value="selected">Selected products only</option>
          </select>
        </div>
      </div>

      {type === "percentage" ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
          <div>
            <FieldLabel required>Discount %</FieldLabel>
            <input
              type="number"
              step="1"
              inputMode="numeric"
              value={percentage}
              onChange={(e) => {
                setPercentage(e.target.value);
                clearFieldError("percentage");
              }}
              className={fieldInputClass(!!fieldErrors.percentage)}
            />
            <FieldError message={fieldErrors.percentage} />
          </div>
          <div>
            <FieldLabel>Min. purchase (₹)</FieldLabel>
            <input
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              value={minPurchase}
              onChange={(e) => {
                setMinPurchase(e.target.value);
                clearFieldError("minPurchase");
              }}
              placeholder="Optional"
              className={fieldInputClass(!!fieldErrors.minPurchase)}
            />
            <FieldError message={fieldErrors.minPurchase} />
          </div>
          <div>
            <FieldLabel>Max discount (₹)</FieldLabel>
            <input
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              value={maxDiscount}
              onChange={(e) => {
                setMaxDiscount(e.target.value);
                clearFieldError("maxDiscount");
              }}
              placeholder="Optional"
              className={fieldInputClass(!!fieldErrors.maxDiscount)}
            />
            <FieldError message={fieldErrors.maxDiscount} />
          </div>
        </div>
      ) : type === "fixed" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
          <div>
            <FieldLabel required>Discount amount (₹)</FieldLabel>
            <input
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              value={fixedAmount}
              onChange={(e) => {
                setFixedAmount(e.target.value);
                clearFieldError("fixedAmount");
              }}
              className={fieldInputClass(!!fieldErrors.fixedAmount)}
            />
            <FieldError message={fieldErrors.fixedAmount} />
          </div>
          <div>
            <FieldLabel>Min. purchase (₹)</FieldLabel>
            <input
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              value={minPurchase}
              onChange={(e) => {
                setMinPurchase(e.target.value);
                clearFieldError("minPurchase");
              }}
              placeholder="Optional"
              className={fieldInputClass(!!fieldErrors.minPurchase)}
            />
            <FieldError message={fieldErrors.minPurchase} />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 max-w-md">
          <div>
            <FieldLabel required>Buy Quantity</FieldLabel>
            <input
              type="number"
              step="1"
              inputMode="numeric"
              value={buyQuantity}
              onChange={(e) => {
                setBuyQuantity(e.target.value);
                clearFieldError("buyQuantity");
              }}
              className={fieldInputClass(!!fieldErrors.buyQuantity)}
            />
            <FieldError message={fieldErrors.buyQuantity} />
          </div>
          <div>
            <FieldLabel required>Get Free</FieldLabel>
            <input
              type="number"
              step="1"
              inputMode="numeric"
              value={freeQuantity}
              onChange={(e) => {
                setFreeQuantity(e.target.value);
                clearFieldError("freeQuantity");
              }}
              className={fieldInputClass(!!fieldErrors.freeQuantity)}
            />
            <FieldError message={fieldErrors.freeQuantity} />
          </div>
        </div>
      )}

      {scope === "selected" && (
        <div className={fieldSectionClass(!!fieldErrors.products)}>
          <FieldLabel required className={fieldLabelClassLg}>
            Select Products
          </FieldLabel>
          <div
            className={`max-h-48 overflow-y-auto border rounded-xl p-3 space-y-2 ${
              fieldErrors.products ? "border-rose-400 ring-1 ring-rose-200" : "border-border-custom"
            }`}
          >
            {(products ?? []).length === 0 ? (
              <p className="text-xs text-muted-custom">No products in catalog yet.</p>
            ) : (
              (products ?? []).map((p) => (
                <label key={p.id} className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productIds.includes(p.id)}
                    onChange={() => toggleProduct(p.id)}
                    className="accent-primary"
                  />
                  <span className="line-clamp-1">{p.name}</span>
                  <span className="text-muted-custom shrink-0">({p.category})</span>
                </label>
              ))
            )}
          </div>
          <FieldError message={fieldErrors.products} />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <FieldLabel>Starts At (optional)</FieldLabel>
          <input
            type="datetime-local"
            value={startsAt}
            onChange={(e) => {
              setStartsAt(e.target.value);
              clearFieldError("startsAt");
              clearFieldError("endsAt");
            }}
            className={fieldInputClass(!!fieldErrors.startsAt)}
          />
          <FieldError message={fieldErrors.startsAt} />
        </div>
        <div>
          <FieldLabel>Ends At (optional)</FieldLabel>
          <input
            type="datetime-local"
            value={endsAt}
            onChange={(e) => {
              setEndsAt(e.target.value);
              clearFieldError("endsAt");
            }}
            className={fieldInputClass(!!fieldErrors.endsAt)}
          />
          <FieldError message={fieldErrors.endsAt} />
        </div>
      </div>

      <label className="flex items-center gap-3 cursor-pointer text-xs font-semibold">
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="accent-primary" />
        Active (live on storefront when within date range)
      </label>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 pt-3 border-t">
        <FieldError message={fieldErrors.submit} />
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="px-5 py-2 border border-border-custom text-xs font-semibold rounded-xl">
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary-dark text-white text-xs font-semibold rounded-xl shine-sweep"
          >
            {loading ? "Saving..." : editingOffer ? "Update Offer" : "Create Offer"}
          </button>
        </div>
      </div>
    </form>
  );
}
