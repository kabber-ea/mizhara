import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import StatusBadge from "@/components/StatusBadge";
import { useAuth } from "@/providers/AuthProvider";
import { forgotPasswordUrl } from "@/lib/auth-url";
import { formatINR } from "@/lib/format";
import { api, apiErrorMessage } from "@/lib/api";
import { getProviderLabel } from "@/lib/tracking";
import type { CustomerOrder, CustomerProfile, SavedAddress } from "@/types/account";

type Tab = "profile" | "address" | "orders";

export default function AccountPage() {
  const { user, refresh } = useAuth();
  const [tab, setTab] = useState<Tab>("profile");
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState<SavedAddress>({
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const loadProfile = useCallback(async () => {
    try {
      const { data } = await api.get<CustomerProfile>("/api/account/profile");
      setProfile(data);
      setName(data.name);
      setPhone(data.phone ?? "");
      setAddress({
        address: data.savedAddress?.address ?? "",
        city: data.savedAddress?.city ?? "",
        state: data.savedAddress?.state ?? "",
        pincode: data.savedAddress?.pincode ?? "",
      });
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
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const { data } = await api.patch<CustomerProfile>("/api/account/profile", { name, phone });
      setProfile(data);
      await refresh();
      setMessage("Profile updated successfully.");
    } catch (e: unknown) {
      setError(apiErrorMessage(e, "Failed to save"));
    } finally {
      setSaving(false);
    }
  };

  const saveAddress = async () => {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const { data } = await api.patch<CustomerProfile>("/api/account/profile", {
        savedAddress: address,
      });
      setProfile(data);
      setMessage("Address saved for faster checkout.");
    } catch (e: unknown) {
      setError(apiErrorMessage(e, "Failed to save address"));
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  const tabs: { id: Tab; label: string }[] = [
    { id: "profile", label: "Edit Profile" },
    { id: "address", label: "Saved Address" },
    { id: "orders", label: "My Orders" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar  />
      <main className="flex-grow max-w-3xl w-full mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-primary-dark">My Account</h1>
          <p className="text-xs text-muted-custom mt-1">Manage your profile, delivery address, and orders</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTab(t.id);
                setMessage("");
                setError("");
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

        {(message || error) && (
          <div
            className={`mb-4 p-3 rounded-xl text-xs font-semibold ${
              error
                ? "bg-rose-50 border border-rose-200 text-rose-700"
                : "bg-emerald-50 border border-emerald-200 text-emerald-700"
            }`}
          >
            {error || message}
          </div>
        )}

        {tab === "profile" && (
          <div className="bg-white border border-border-custom rounded-2xl p-6 space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 border border-border-custom rounded-xl text-xs"
               />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase mb-1">Email</label>
              <input
                type="email"
                value={profile?.email ?? ""}
                disabled
                className="w-full px-4 py-2.5 border border-border-custom rounded-xl text-xs bg-background/50 text-muted-custom"
               />
              <p className="text-[10px] text-muted-custom mt-1">Email cannot be changed here.</p>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase mb-1">Mobile</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
                className="w-full px-4 py-2.5 border border-border-custom rounded-xl text-xs"
               />
            </div>
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
          <div className="bg-white border border-border-custom rounded-2xl p-6 space-y-4">
            <p className="text-xs text-muted-custom">
              Save your default shipping address — it will pre-fill at checkout.
            </p>
            <div>
              <label className="block text-[10px] font-bold uppercase mb-1">Street Address</label>
              <input
                type="text"
                value={address.address}
                onChange={(e) => setAddress((a) => ({ ...a, address: e.target.value }))}
                className="w-full px-4 py-2.5 border border-border-custom rounded-xl text-xs"
               />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase mb-1">City</label>
                <input
                  type="text"
                  value={address.city}
                  onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-border-custom rounded-xl text-xs"
                 />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase mb-1">State</label>
                <input
                  type="text"
                  value={address.state}
                  onChange={(e) => setAddress((a) => ({ ...a, state: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-border-custom rounded-xl text-xs"
                 />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase mb-1">Pincode</label>
              <input
                type="text"
                value={address.pincode}
                onChange={(e) => setAddress((a) => ({ ...a, pincode: e.target.value }))}
                className="w-full px-4 py-2.5 border border-border-custom rounded-xl text-xs"
               />
            </div>
            <button
              type="button"
              disabled={saving}
              onClick={saveAddress}
              className="px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-xl disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Address"}
            </button>
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
                    <StatusBadge status={order.paymentStatus} type="payment"  />
                    <StatusBadge status={order.deliveryStatus}  />
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
      <Footer  />
    </div>
  );
}
