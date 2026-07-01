import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StatusBadge from "@/components/StatusBadge";
import FieldError from "@/components/FieldError";
import FieldLabel from "@/components/FieldLabel";
import { useAuth } from "@/providers/AuthProvider";
import { useFieldErrors } from "@/hooks/use-field-errors";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { forgotPasswordUrl } from "@/lib/auth-url";
import { formatINR } from "@/lib/format";
import { api, apiErrorMessage } from "@/lib/api";
import { fieldInputClass } from "@/lib/form-styles";
import { isValidPincode } from "@/lib/form-validation";
import { getProviderLabel } from "@/lib/tracking";
import type { CustomerOrder, CustomerProfile, SavedAddress } from "@/types/account";
import { MAX_SAVED_ADDRESSES, getDefaultSavedAddress, newSavedAddressId } from "@/types/account";

type Tab = "profile" | "address" | "orders";

type ProfileField = "name" | "phone" | "submit";
type AddressField = "label" | "address" | "city" | "state" | "pincode" | "submit";

const emptyAddressDraft = (): SavedAddress => ({
  id: newSavedAddressId(),
  label: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  isDefault: false,
});

export default function AccountPage() {
  const { user, refresh } = useAuth();
  const { confirm, dialog } = useConfirmDialog();
  const [tab, setTab] = useState<Tab>("profile");
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const {
    fieldErrors: profileErrors,
    setFieldErrors: setProfileErrors,
    clearFieldError: clearProfileError,
  } = useFieldErrors<ProfileField>();

  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressDraft, setAddressDraft] = useState<SavedAddress | null>(null);
  const {
    fieldErrors: addressErrors,
    setFieldErrors: setAddressErrors,
    clearFieldError: clearAddressError,
    clearAllFieldErrors: clearAllAddressErrors,
  } = useFieldErrors<AddressField>();

  const loadProfile = useCallback(async () => {
    try {
      const { data } = await api.get<CustomerProfile>("/api/account/profile");
      setProfile(data);
      setName(data.name);
      setPhone(data.phone ?? "");
      setSavedAddresses(data.savedAddresses ?? []);
    } catch {
      // ignore
    }
  }, []);

  const loadOrders = useCallback(async () => {
    try {
      const { data } = await api.get<{ items: CustomerOrder[] }>("/api/account/orders");
      setOrders(data.items);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (user?.role === "customer") {
      loadProfile();
      loadOrders();
    }
  }, [user, loadProfile, loadOrders]);

  const saveProfile = async () => {
    const errors: Partial<Record<ProfileField, string>> = {};
    if (!name.trim()) errors.name = "Full name is required.";
    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors);
      return;
    }

    setProfileErrors({});
    setSaving(true);
    setMessage("");
    try {
      const { data } = await api.patch<CustomerProfile>("/api/account/profile", { name, phone });
      setProfile(data);
      setName(data.name);
      setPhone(data.phone ?? "");
      await refresh();
      setMessage("Profile updated successfully.");
    } catch (e: unknown) {
      setProfileErrors({ submit: apiErrorMessage(e, "Failed to save profile.") });
    } finally {
      setSaving(false);
    }
  };

  const startAddAddress = () => {
    if (savedAddresses.length >= MAX_SAVED_ADDRESSES) return;
    clearAllAddressErrors();
    const draft = emptyAddressDraft();
    draft.isDefault = savedAddresses.length === 0;
    setAddressDraft(draft);
    setEditingAddressId("new");
  };

  const startEditAddress = (addr: SavedAddress) => {
    clearAllAddressErrors();
    setAddressDraft({ ...addr });
    setEditingAddressId(addr.id);
  };

  const cancelAddressEdit = () => {
    setEditingAddressId(null);
    setAddressDraft(null);
    clearAllAddressErrors();
  };

  const collectAddressErrors = (draft: SavedAddress): Partial<Record<AddressField, string>> => {
    const errors: Partial<Record<AddressField, string>> = {};
    if (!draft.address.trim()) errors.address = "Street address is required.";
    if (!draft.city.trim()) errors.city = "City is required.";
    if (!draft.state.trim()) errors.state = "State is required.";
    if (!draft.pincode.trim() || !isValidPincode(draft.pincode)) {
      errors.pincode = "Enter a valid 6-digit pincode.";
    }
    return errors;
  };

  const saveAddressDraft = async () => {
    if (!addressDraft) return;
    const validation = collectAddressErrors(addressDraft);
    if (Object.keys(validation).length > 0) {
      setAddressErrors(validation);
      return;
    }

    const trimmed: SavedAddress = {
      ...addressDraft,
      label: addressDraft.label?.trim() || "",
      address: addressDraft.address.trim(),
      city: addressDraft.city.trim(),
      state: addressDraft.state.trim(),
      pincode: addressDraft.pincode.trim(),
    };

    let next: SavedAddress[];
    if (editingAddressId === "new") {
      next = [...savedAddresses, trimmed];
    } else {
      next = savedAddresses.map((a) => (a.id === trimmed.id ? trimmed : a));
    }

    if (trimmed.isDefault) {
      next = next.map((a) => ({ ...a, isDefault: a.id === trimmed.id }));
    } else if (!next.some((a) => a.isDefault) && next.length > 0) {
      next[0] = { ...next[0], isDefault: true };
    }

    setAddressErrors({});
    setSaving(true);
    setMessage("");
    try {
      const { data } = await api.patch<CustomerProfile>("/api/account/profile", {
        savedAddresses: next,
      });
      setProfile(data);
      setSavedAddresses(data.savedAddresses ?? next);
      cancelAddressEdit();
      setMessage("Address saved for faster checkout.");
    } catch (e: unknown) {
      setAddressErrors({ submit: apiErrorMessage(e, "Failed to save address.") });
    } finally {
      setSaving(false);
    }
  };

  const deleteAddress = async (id: string) => {
    const ok = await confirm({
      title: "Remove this address?",
      message: "This saved address will be deleted from your account.",
      confirmLabel: "Remove",
    });
    if (!ok) return;

    const next = savedAddresses.filter((a) => a.id !== id);
    if (next.length > 0 && !next.some((a) => a.isDefault)) {
      next[0] = { ...next[0], isDefault: true };
    }
    setSaving(true);
    setMessage("");
    try {
      const { data } = await api.patch<CustomerProfile>("/api/account/profile", {
        savedAddresses: next,
      });
      setProfile(data);
      setSavedAddresses(data.savedAddresses ?? next);
      if (editingAddressId === id) cancelAddressEdit();
      setMessage("Address removed.");
    } catch (e: unknown) {
      setAddressErrors({ submit: apiErrorMessage(e, "Failed to remove address.") });
    } finally {
      setSaving(false);
    }
  };

  const setDefaultAddress = async (id: string) => {
    const next = savedAddresses.map((a) => ({ ...a, isDefault: a.id === id }));
    setSaving(true);
    setMessage("");
    try {
      const { data } = await api.patch<CustomerProfile>("/api/account/profile", {
        savedAddresses: next,
      });
      setProfile(data);
      setSavedAddresses(data.savedAddresses ?? next);
      setMessage("Default address updated.");
    } catch (e: unknown) {
      setAddressErrors({ submit: apiErrorMessage(e, "Failed to update default address.") });
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  const tabs: { id: Tab; label: string }[] = [
    { id: "profile", label: "Edit Profile" },
    { id: "address", label: "Saved Addresses" },
    { id: "orders", label: "My Orders" },
  ];

  const defaultAddr = getDefaultSavedAddress(savedAddresses);

  return (
    <>
      {dialog}
      <main className="flex-grow max-w-3xl w-full mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-primary-dark">My Account</h1>
          <p className="text-xs text-muted-custom mt-1">Manage your profile, delivery addresses, and orders</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTab(t.id);
                setMessage("");
                setProfileErrors({});
                clearAllAddressErrors();
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase ${
                tab === t.id
                  ? "bg-primary text-white"
                  : "bg-white border border-border-custom text-muted-custom hover:text-primary"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {message && (
          <div className="mb-4 p-3 rounded-xl text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700">
            {message}
          </div>
        )}

        {tab === "profile" && (
          <div className="bg-white border border-border-custom rounded-2xl p-6 space-y-4">
            <div>
              <FieldLabel required>Full Name</FieldLabel>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  clearProfileError("name");
                }}
                className={fieldInputClass(!!profileErrors.name)}
              />
              <FieldError message={profileErrors.name} />
            </div>
            <div>
              <FieldLabel>Email</FieldLabel>
              <input
                type="email"
                value={profile?.email ?? ""}
                disabled
                className="w-full px-4 py-2.5 border border-border-custom rounded-xl text-xs bg-background/50 text-muted-custom"
              />
              <p className="text-[10px] text-muted-custom mt-1">Email cannot be changed here.</p>
            </div>
            <div>
              <FieldLabel>Mobile</FieldLabel>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  clearProfileError("phone");
                }}
                placeholder="9876543210"
                className={fieldInputClass(!!profileErrors.phone)}
              />
              <FieldError message={profileErrors.phone} />
            </div>
            <FieldError message={profileErrors.submit} />
            <button
              type="button"
              disabled={saving}
              onClick={saveProfile}
              className="px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-xl disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
            <p className="text-[10px] text-muted-custom pt-2 border-t border-border-custom/50">
              Need to update your password?{" "}
              <Link to={forgotPasswordUrl()} className="text-primary font-semibold hover:underline">
                Change password
              </Link>
            </p>
          </div>
        )}

        {tab === "address" && (
          <div className="space-y-4">
            <div className="bg-white border border-border-custom rounded-2xl p-6">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <h3 className="font-serif text-base font-bold text-primary-dark">Saved Addresses</h3>
                  <p className="text-xs text-muted-custom mt-1">
                    Save up to {MAX_SAVED_ADDRESSES} addresses — they pre-fill at checkout.
                  </p>
                </div>
                {savedAddresses.length < MAX_SAVED_ADDRESSES && !editingAddressId && (
                  <button
                    type="button"
                    onClick={startAddAddress}
                    className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl"
                  >
                    Add Address
                  </button>
                )}
              </div>

              {savedAddresses.length === 0 && !editingAddressId ? (
                <p className="text-xs text-muted-custom text-center py-6">No saved addresses yet.</p>
              ) : (
                <div className="space-y-3">
                  {savedAddresses.map((addr) =>
                    editingAddressId === addr.id ? null : (
                      <div
                        key={addr.id}
                        className={`rounded-xl border p-4 ${
                          addr.isDefault ? "border-primary/30 bg-accent-pink/10" : "border-border-custom"
                        }`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-primary-dark">
                              {addr.label?.trim() || "Address"}
                              {addr.isDefault && (
                                <span className="ml-2 text-[9px] uppercase text-primary font-bold">Default</span>
                              )}
                            </p>
                            <p className="text-[11px] text-muted-custom mt-1 leading-relaxed">
                              {addr.address}, {addr.city}, {addr.state} — {addr.pincode}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {!addr.isDefault && (
                              <button
                                type="button"
                                disabled={saving}
                                onClick={() => setDefaultAddress(addr.id)}
                                className="text-[10px] font-semibold text-primary hover:underline"
                              >
                                Set default
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => startEditAddress(addr)}
                              className="text-[10px] font-semibold text-primary hover:underline"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              disabled={saving}
                              onClick={() => deleteAddress(addr.id)}
                              className="text-[10px] font-semibold text-rose-600 hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              )}

              {defaultAddr && savedAddresses.length > 0 && !editingAddressId && (
                <p className="text-[10px] text-muted-custom mt-4 pt-4 border-t border-border-custom/50">
                  Default address is used first at checkout.
                </p>
              )}
            </div>

            {editingAddressId && addressDraft && (
              <div className="bg-white border border-border-custom rounded-2xl p-6 space-y-4">
                <h4 className="font-serif text-sm font-bold text-primary-dark">
                  {editingAddressId === "new" ? "Add Address" : "Edit Address"}
                </h4>
                <div>
                  <FieldLabel>Label (optional)</FieldLabel>
                  <input
                    type="text"
                    value={addressDraft.label ?? ""}
                    onChange={(e) => {
                      setAddressDraft((d) => (d ? { ...d, label: e.target.value } : d));
                      clearAddressError("label");
                    }}
                    placeholder="Home, Office..."
                    className={fieldInputClass(!!addressErrors.label)}
                  />
                  <FieldError message={addressErrors.label} />
                </div>
                <div>
                  <FieldLabel required>Street Address</FieldLabel>
                  <input
                    type="text"
                    value={addressDraft.address}
                    onChange={(e) => {
                      setAddressDraft((d) => (d ? { ...d, address: e.target.value } : d));
                      clearAddressError("address");
                    }}
                    className={fieldInputClass(!!addressErrors.address)}
                  />
                  <FieldError message={addressErrors.address} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <FieldLabel required>City</FieldLabel>
                    <input
                      type="text"
                      value={addressDraft.city}
                      onChange={(e) => {
                        setAddressDraft((d) => (d ? { ...d, city: e.target.value } : d));
                        clearAddressError("city");
                      }}
                      className={fieldInputClass(!!addressErrors.city)}
                    />
                    <FieldError message={addressErrors.city} />
                  </div>
                  <div>
                    <FieldLabel required>State</FieldLabel>
                    <input
                      type="text"
                      value={addressDraft.state}
                      onChange={(e) => {
                        setAddressDraft((d) => (d ? { ...d, state: e.target.value } : d));
                        clearAddressError("state");
                      }}
                      className={fieldInputClass(!!addressErrors.state)}
                    />
                    <FieldError message={addressErrors.state} />
                  </div>
                </div>
                <div>
                  <FieldLabel required>Pincode</FieldLabel>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={addressDraft.pincode}
                    onChange={(e) => {
                      setAddressDraft((d) => (d ? { ...d, pincode: e.target.value } : d));
                      clearAddressError("pincode");
                    }}
                    className={fieldInputClass(!!addressErrors.pincode)}
                  />
                  <FieldError message={addressErrors.pincode} />
                </div>
                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!addressDraft.isDefault}
                    onChange={(e) =>
                      setAddressDraft((d) => (d ? { ...d, isDefault: e.target.checked } : d))
                    }
                    className="accent-primary"
                  />
                  Use as default address
                </label>
                <FieldError message={addressErrors.submit} />
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={cancelAddressEdit}
                    className="px-5 py-2 border border-border-custom text-xs font-semibold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={saveAddressDraft}
                    className="px-6 py-2 bg-primary text-white text-xs font-bold rounded-xl disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save Address"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "orders" && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="bg-white border border-border-custom rounded-2xl p-8 text-center text-xs text-muted-custom">
                No orders yet.{" "}
                <Link to="/products" className="text-primary font-semibold hover:underline">
                  Start shopping
                </Link>
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white border border-border-custom rounded-2xl p-5 space-y-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-mono text-xs font-bold text-primary-dark">{order.orderNumber}</p>
                      <p className="text-[10px] text-muted-custom mt-0.5">
                        {new Date(order.createdAt).toLocaleString("en-IN")} · {order.itemCount} item
                        {order.itemCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <p className="font-bold text-sm text-primary-dark">{formatINR(order.total)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge status={order.paymentStatus} type="payment" />
                    <StatusBadge status={order.deliveryStatus} />
                  </div>
                  <ul className="text-[11px] text-muted-custom space-y-1">
                    {order.items.map((item, i) => (
                      <li key={i}>
                        {item.name} × {item.quantity}
                      </li>
                    ))}
                  </ul>
                  {order.trackingUrl ? (
                    <a
                      href={order.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      Track shipment
                      {order.trackingProvider && (
                        <span className="text-muted-custom font-normal">
                          ({getProviderLabel(order.trackingProvider)}
                          {order.trackingNumber ? ` · ${order.trackingNumber}` : ""})
                        </span>
                      )}
                      <span>↗</span>
                    </a>
                  ) : order.deliveryStatus === "shipped" ||
                    order.deliveryStatus === "out_for_delivery" ||
                    order.deliveryStatus === "delivered" ? (
                    <p className="text-[10px] text-muted-custom">Tracking will appear once added by our team.</p>
                  ) : null}
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </>
  );
}
