"use client";

import { useCallback, useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { formatINR } from "@/lib/format";
import { TRACKING_PROVIDERS } from "@/lib/tracking";
import type { SerializedOrder } from "@/types/admin";
import type { DeliveryStatus } from "@/models/Order";
import type { PaginationMeta } from "@/lib/pagination";
import AdminSearchInput from "@/ui/admin/components/AdminSearchInput";
import AdminPagination from "@/ui/admin/components/AdminPagination";
import StatusBadge from "@/ui/admin/components/StatusBadge";

const DELIVERY_FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "processing", label: "Processing" },
  { value: "packed", label: "Packed" },
  { value: "shipped", label: "Shipped" },
  { value: "out_for_delivery", label: "Out for delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  { value: "returned", label: "Returned" },
];

const DELIVERY_OPTIONS: DeliveryStatus[] = [
  "processing",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "returned",
];

export default function AdminOrdersPage() {
  const [search, setSearch] = useState("");
  const [deliveryFilter, setDeliveryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<SerializedOrder[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    deliveryStatus: "processing" as DeliveryStatus,
    trackingProvider: "delhivery",
    trackingNumber: "",
    trackingUrl: "",
  });

  const debouncedSearch = useDebounce(search);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
        search: debouncedSearch,
        deliveryStatus: deliveryFilter,
      });
      const res = await fetch(`/api/admin/orders?${params}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items);
        setPagination(data.pagination);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, deliveryFilter]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, deliveryFilter]);

  const openEdit = (order: SerializedOrder) => {
    setEditingId(order.id);
    setEditForm({
      deliveryStatus: order.deliveryStatus,
      trackingProvider: order.trackingProvider ?? "delhivery",
      trackingNumber: order.trackingNumber ?? "",
      trackingUrl: order.trackingUrl ?? "",
    });
  };

  const saveOrder = async (orderId: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setEditingId(null);
        await loadOrders();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-primary-dark">Orders</h1>
        <p className="text-xs text-muted-custom mt-1">Manage fulfillment, delivery status, and tracking</p>
      </div>

      <div className="bg-white border border-border-custom rounded-2xl p-6 space-y-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <h3 className="font-serif text-base font-bold text-primary-dark">Order Management</h3>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <select
              value={deliveryFilter}
              onChange={(e) => setDeliveryFilter(e.target.value)}
              className="px-4 py-2 border border-border-custom rounded-xl text-xs bg-background/50"
            >
              {DELIVERY_FILTERS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
            <AdminSearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search order #, customer..."
            />
          </div>
        </div>

        {loading ? (
          <p className="text-center py-12 text-xs text-muted-custom">Loading orders...</p>
        ) : items.length === 0 ? (
          <p className="text-center py-12 text-xs text-muted-custom">No orders found.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-xs min-w-[800px]">
                <thead>
                  <tr className="text-left text-[10px] text-muted-custom uppercase border-b border-border-custom">
                    <th className="pb-3 pr-3">Order #</th>
                    <th className="pb-3 pr-3">Customer</th>
                    <th className="pb-3 pr-3">Items</th>
                    <th className="pb-3 pr-3">Total</th>
                    <th className="pb-3 pr-3">Payment</th>
                    <th className="pb-3 pr-3">Delivery</th>
                    <th className="pb-3 pr-3">Tracking</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((o) => (
                    <OrderRow
                      key={o.id}
                      order={o}
                      expanded={expandedId === o.id}
                      editing={editingId === o.id}
                      editForm={editForm}
                      saving={saving}
                      onToggleExpand={() => setExpandedId(expandedId === o.id ? null : o.id)}
                      onEdit={() => openEdit(o)}
                      onCancelEdit={() => setEditingId(null)}
                      onSave={() => saveOrder(o.id)}
                      onFormChange={setEditForm}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            <AdminPagination pagination={pagination} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}

function OrderRow({
  order,
  expanded,
  editing,
  editForm,
  saving,
  onToggleExpand,
  onEdit,
  onCancelEdit,
  onSave,
  onFormChange,
}: {
  order: SerializedOrder;
  expanded: boolean;
  editing: boolean;
  editForm: {
    deliveryStatus: DeliveryStatus;
    trackingProvider: string;
    trackingNumber: string;
    trackingUrl: string;
  };
  saving: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSave: () => void;
  onFormChange: (f: typeof editForm) => void;
}) {
  return (
    <>
      <tr className="border-b border-border-custom/30 hover:bg-accent-mint/5">
        <td className="py-3 pr-3 font-mono text-[10px]">{order.orderNumber}</td>
        <td className="py-3 pr-3">
          <div className="font-semibold">{order.customerName}</div>
          <div className="text-[10px] text-muted-custom">{order.customerEmail}</div>
        </td>
        <td className="py-3 pr-3">{order.itemCount}</td>
        <td className="py-3 pr-3 font-semibold">{formatINR(order.total)}</td>
        <td className="py-3 pr-3">
          <StatusBadge status={order.paymentStatus} type="payment" />
        </td>
        <td className="py-3 pr-3">
          <StatusBadge status={order.deliveryStatus} />
        </td>
        <td className="py-3 pr-3">
          {order.trackingUrl ? (
            <a
              href={order.trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-semibold hover:underline text-[10px]"
            >
              Track ↗
            </a>
          ) : order.trackingNumber ? (
            <span className="text-[10px]">{order.trackingNumber}</span>
          ) : (
            <span className="text-[10px] text-muted-custom">—</span>
          )}
        </td>
        <td className="py-3">
          <div className="flex gap-2">
            <button type="button" onClick={onToggleExpand} className="text-[10px] text-primary font-semibold hover:underline">
              {expanded ? "Hide" : "View"}
            </button>
            <button type="button" onClick={onEdit} className="text-[10px] text-primary-dark font-semibold hover:underline">
              Update
            </button>
          </div>
        </td>
      </tr>

      {expanded && (
        <tr className="bg-accent-mint/5">
          <td colSpan={8} className="px-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px]">
              <div>
                <p className="font-bold text-primary-dark mb-1">Shipping Address</p>
                <p>{order.shippingAddress.name}</p>
                <p className="text-muted-custom">{order.shippingAddress.address}</p>
                <p className="text-muted-custom">
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
                </p>
                <p className="text-muted-custom">{order.shippingAddress.phone}</p>
              </div>
              <div>
                <p className="font-bold text-primary-dark mb-1">Line Items</p>
                <ul className="space-y-1">
                  {order.items.map((item, i) => (
                    <li key={i} className="flex justify-between">
                      <span>
                        {item.name} × {item.quantity} ({item.size})
                      </span>
                      <span>{formatINR(item.price * item.quantity)}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-muted-custom">
                  Placed: {new Date(order.createdAt).toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </td>
        </tr>
      )}

      {editing && (
        <tr className="bg-accent-pink/10">
          <td colSpan={8} className="px-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase mb-1">Delivery Status</label>
                <select
                  value={editForm.deliveryStatus}
                  onChange={(e) =>
                    onFormChange({ ...editForm, deliveryStatus: e.target.value as DeliveryStatus })
                  }
                  className="w-full px-3 py-2 border border-border-custom rounded-xl text-xs"
                >
                  {DELIVERY_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase mb-1">Courier</label>
                <select
                  value={editForm.trackingProvider}
                  onChange={(e) => onFormChange({ ...editForm, trackingProvider: e.target.value })}
                  className="w-full px-3 py-2 border border-border-custom rounded-xl text-xs"
                >
                  {TRACKING_PROVIDERS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase mb-1">Tracking Number</label>
                <input
                  type="text"
                  value={editForm.trackingNumber}
                  onChange={(e) => onFormChange({ ...editForm, trackingNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-border-custom rounded-xl text-xs"
                  placeholder="AWB / consignment #"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase mb-1">Custom URL (optional)</label>
                <input
                  type="url"
                  value={editForm.trackingUrl}
                  onChange={(e) => onFormChange({ ...editForm, trackingUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-border-custom rounded-xl text-xs"
                  placeholder="Override tracking link"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                type="button"
                disabled={saving}
                onClick={onSave}
                className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={onCancelEdit}
                className="px-4 py-2 border border-border-custom text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
