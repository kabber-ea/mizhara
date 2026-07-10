import { useCallback, useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { formatINR, formatOrderDateTime } from "@/utils/format";
import { api, apiErrorMessage } from "@/lib/api";
import { TRACKING_PROVIDERS, buildTrackingUrl } from "@/utils/tracking";
import { DELIVERY_FILTERS, DELIVERY_LABELS, DELIVERY_OPTIONS } from "@/constants/delivery";
import { DEFAULT_FULFILLMENT_FORM, type FulfillmentForm } from "@/constants/order";
import type { TrackingProvider } from "@/types/order";
import type { SerializedOrder } from "@/types/admin";
import type { DeliveryStatus } from "@/types/order";
import type { PaginationMeta } from "@/utils/pagination";
import { EMPTY_PAGINATION, pageLimitParams, parseListResponse } from "@/utils/pagination";
import { DEFAULT_SORT, nextSort, type SortState } from "@/utils/sort";
import SearchInput from "@/components/SearchInput";
import Pagination from "@/components/Pagination";
import TableSkeleton from "@/components/TableSkeleton";
import StatusBadge from "@/components/StatusBadge";
import SortableTableHeader from "@/components/SortableTableHeader";
import AdminPageHeader from "@/components/AdminPageHeader";
import { TableEditButton } from "@/components/TableIconButtons";

export default function AdminOrdersPage() {
  const [search, setSearch] = useState("");
  const [deliveryFilter, setDeliveryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortState>(DEFAULT_SORT);
  const [items, setItems] = useState<SerializedOrder[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>(EMPTY_PAGINATION);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [editForm, setEditForm] = useState({ ...DEFAULT_FULFILLMENT_FORM });

  const debouncedSearch = useDebounce(search);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...pageLimitParams(page),
        search: debouncedSearch,
        deliveryStatus: deliveryFilter,
        sortBy: sort.column,
        sortDir: sort.direction,
      });
      const { data } = await api.get<{ items: SerializedOrder[]; pagination: PaginationMeta }>(
        `/api/orders?${params}`
      );
      const parsed = parseListResponse(data);
      setItems(parsed.items);
      setPagination(parsed.pagination);
    } catch (e) {
      console.error(e);
      setItems([]);
      setPagination(EMPTY_PAGINATION);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, deliveryFilter, sort.column, sort.direction]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, deliveryFilter, sort.column, sort.direction]);

  const handleSort = (column: string) => {
    setSort((prev) => nextSort(prev, column));
  };

  const openEdit = (order: SerializedOrder) => {
    setSaveError("");
    setEditingId(order.id);
    const baseForm = {
      deliveryStatus: order.deliveryStatus,
      trackingProvider: order.trackingProvider ?? DEFAULT_FULFILLMENT_FORM.trackingProvider,
      trackingNumber: order.trackingNumber ?? "",
      trackingUrl: order.trackingUrl ?? "",
    };
    setEditForm(order.deliveryStatus === "shipped" ? withTrackingUrl(baseForm, {}) : baseForm);
  };

  const saveOrder = async (orderId: string) => {
    setSaveError("");
    setSaving(true);
    try {
      let payload:
        | { deliveryStatus: DeliveryStatus; trackingProvider?: string; trackingNumber?: string; trackingUrl?: string };

      if (editForm.deliveryStatus === "shipped") {
        const trackingNumber = editForm.trackingNumber.trim();
        const trackingProvider = editForm.trackingProvider as TrackingProvider;
        const trackingUrl =
          trackingProvider === "other"
            ? editForm.trackingUrl.trim()
            : buildTrackingUrl(trackingProvider, trackingNumber);

        if (!trackingNumber) {
          setSaveError("Tracking number is required for shipped orders.");
          return;
        }
        if (!trackingUrl) {
          setSaveError(
            trackingProvider === "other"
              ? "Tracking URL is required when courier is Other."
              : "Could not build tracking URL. Check courier and tracking number.",
          );
          return;
        }

        payload = {
          deliveryStatus: "shipped",
          trackingProvider,
          trackingNumber,
          trackingUrl,
        };
      } else if (editForm.deliveryStatus === "delivered") {
        payload = { deliveryStatus: "delivered" };
      } else {
        payload = {
          deliveryStatus: "processing",
          trackingProvider: "",
          trackingNumber: "",
          trackingUrl: "",
        };
      }

      await api.patch(`/api/orders/${orderId}`, payload);
      setEditingId(null);
      await loadOrders();
    } catch (e) {
      setSaveError(apiErrorMessage(e, "Failed to save order"));
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Orders"
        description="Manage fulfillment, delivery status, and tracking"
      />

      <div className="space-y-4 overflow-hidden rounded-2xl border border-border-custom bg-white p-6 shadow-xs">
        <div className="flex flex-col items-start justify-between gap-4 border-b border-border-custom/50 pb-4 lg:flex-row lg:items-center">
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
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search order #, customer..."
            />
          </div>
        </div>

        {loading && items.length === 0 ? (
          <TableSkeleton rows={6} />
        ) : items.length === 0 ? (
          <p className="text-center py-12 text-xs text-muted-custom">No orders found.</p>
        ) : (
          <div className={loading ? "opacity-60 pointer-events-none transition-opacity duration-150" : "transition-opacity duration-150"}>
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-xs min-w-[920px]">
                <thead>
                  <tr className="text-left text-[10px] text-muted-custom uppercase border-b border-border-custom">
                    <SortableTableHeader label="Order #" column="orderNumber" sort={sort} onSort={handleSort} className="pb-3 pr-3 !px-0" />
                    <SortableTableHeader label="Customer" column="customerName" sort={sort} onSort={handleSort} className="pb-3 pr-3 !px-0" />
                    <SortableTableHeader label="Order Date" column="createdAt" sort={sort} onSort={handleSort} className="pb-3 pr-3 !px-0" />
                    <SortableTableHeader label="Items" column="itemCount" sort={sort} onSort={handleSort} className="pb-3 pr-3 !px-0" />
                    <SortableTableHeader label="Total" column="total" sort={sort} onSort={handleSort} className="pb-3 pr-3 !px-0" />
                    <SortableTableHeader label="Delivery" column="deliveryStatus" sort={sort} onSort={handleSort} className="pb-3 pr-3 !px-0" />
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
                      saveError={saveError}
                      onToggleExpand={() => setExpandedId(expandedId === o.id ? null : o.id)}
                      onEdit={() => openEdit(o)}
                      onCancelEdit={() => {
                        setEditingId(null);
                        setSaveError("");
                      }}
                      onSave={() => saveOrder(o.id)}
                      onFormChange={setEditForm}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination pagination={pagination} onPageChange={setPage} />
          </>
          </div>
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
  saveError,
  onToggleExpand,
  onEdit,
  onCancelEdit,
  onSave,
  onFormChange,
}: {
  order: SerializedOrder;
  expanded: boolean;
  editing: boolean;
  editForm: FulfillmentForm;
  saving: boolean;
  saveError: string;
  onToggleExpand: () => void;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSave: () => void;
  onFormChange: (f: FulfillmentForm) => void;
}) {
  return (
    <>
      <tr className="border-b border-border-custom/30 hover:bg-accent-mint/5">
        <td className="py-3 pr-3 font-mono text-[10px]">{order.orderNumber}</td>
        <td className="py-3 pr-3">
          <div className="font-semibold">{order.customerName}</div>
          <div className="text-[10px] text-muted-custom">{order.customerEmail}</div>
        </td>
        <td className="py-3 pr-3 whitespace-nowrap text-[10px] tabular-nums text-muted-custom">
          {formatOrderDateTime(order.createdAt)}
        </td>
        <td className="py-3 pr-3">{order.itemCount}</td>
        <td className="py-3 pr-3 font-semibold">{formatINR(order.total)}</td>
        <td className="py-3 pr-3">
          <div className="flex justify-start">
            <StatusBadge status={order.deliveryStatus} />
          </div>
        </td>
        <td className="py-3 pr-3">
          {order.deliveryStatus === "shipped" || order.deliveryStatus === "delivered" ? (
            order.trackingUrl ? (
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
            )
          ) : (
            <span className="text-[10px] text-muted-custom">—</span>
          )}
        </td>
        <td className="py-3">
          <div className="flex items-center gap-2">
            <button type="button" onClick={onToggleExpand} className="text-[10px] text-primary font-semibold hover:underline">
              {expanded ? "Hide" : "View"}
            </button>
            <TableEditButton onClick={onEdit} label="Update order" />
          </div>
        </td>
      </tr>

      {expanded && (
        <tr className="bg-accent-mint/5">
          <td colSpan={8} className="px-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px]">
              <div>
                <p className="font-bold text-primary-dark mb-1">Shipping Address</p>
                <p>{order.shippingAddress?.name ?? "—"}</p>
                <p className="text-muted-custom">{order.shippingAddress?.address ?? "—"}</p>
                <p className="text-muted-custom">
                  {[order.shippingAddress?.city, order.shippingAddress?.state, order.shippingAddress?.pincode]
                    .filter(Boolean)
                    .join(", ") || "—"}
                </p>
                <p className="text-muted-custom">{order.shippingAddress?.phone ?? "—"}</p>
              </div>
              <div>
                <p className="font-bold text-primary-dark mb-1">Line Items</p>
                <ul className="space-y-1">
                  {order.items?.map((item, i) => (
                    <li key={i} className="flex justify-between">
                      <span>
                        {item.name} × {item.quantity} ({item.size})
                      </span>
                      <span>{formatINR(item.price * item.quantity)}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-muted-custom">
                  Placed: {formatOrderDateTime(order.createdAt)}
                </p>
              </div>
            </div>
          </td>
        </tr>
      )}

      {editing && (
        <tr className="bg-accent-pink/10">
          <td colSpan={8} className="px-4 py-3">
            <OrderFulfillmentEditor
              editForm={editForm}
              saving={saving}
              saveError={saveError}
              onFormChange={onFormChange}
              onSave={onSave}
              onCancel={onCancelEdit}
            />
          </td>
        </tr>
      )}
    </>
  );
}

const fulfillmentFieldClass =
  "w-full rounded-xl border border-border-custom/80 bg-white px-3 py-2 text-xs text-primary-dark shadow-sm shadow-primary-dark/[0.02] transition focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/10";

const fulfillmentLabelClass = "mb-1 block text-[10px] font-bold uppercase tracking-[0.1em] text-muted-custom";

function withTrackingUrl(form: FulfillmentForm, updates: Partial<FulfillmentForm>): FulfillmentForm {
  const next = { ...form, ...updates };
  if (next.deliveryStatus !== "shipped") return next;

  const provider = next.trackingProvider as TrackingProvider;
  if (provider === "other") {
    if (updates.trackingProvider === "other") {
      next.trackingUrl = "";
    }
    return next;
  }

  next.trackingUrl = buildTrackingUrl(provider, next.trackingNumber);
  return next;
}

function OrderFulfillmentEditor({
  editForm,
  saving,
  saveError,
  onFormChange,
  onSave,
  onCancel,
}: {
  editForm: FulfillmentForm;
  saving: boolean;
  saveError: string;
  onFormChange: (f: FulfillmentForm) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const showTracking = editForm.deliveryStatus === "shipped";
  const isOtherProvider = editForm.trackingProvider === "other";

  const handleStatusChange = (status: DeliveryStatus) => {
    if (status !== "shipped") {
      onFormChange({
        deliveryStatus: status,
        trackingProvider: DEFAULT_FULFILLMENT_FORM.trackingProvider,
        trackingNumber: "",
        trackingUrl: "",
      });
      return;
    }
    onFormChange(withTrackingUrl({ ...editForm, deliveryStatus: status }, { deliveryStatus: status }));
  };

  return (
    <>
      <div className="space-y-3">
        {showTracking ? (
          <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className={fulfillmentLabelClass}>Delivery status</label>
              <select
                value={editForm.deliveryStatus}
                onChange={(e) => handleStatusChange(e.target.value as DeliveryStatus)}
                className={fulfillmentFieldClass}
              >
                {DELIVERY_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {DELIVERY_LABELS[status]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={fulfillmentLabelClass}>Courier</label>
              <select
                value={editForm.trackingProvider}
                onChange={(e) =>
                  onFormChange(
                    withTrackingUrl(editForm, { trackingProvider: e.target.value as TrackingProvider })
                  )
                }
                className={fulfillmentFieldClass}
              >
                {TRACKING_PROVIDERS.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={fulfillmentLabelClass}>Tracking number</label>
              <input
                type="text"
                value={editForm.trackingNumber}
                onChange={(e) =>
                  onFormChange(withTrackingUrl(editForm, { trackingNumber: e.target.value }))
                }
                className={fulfillmentFieldClass}
                placeholder="AWB / consignment #"
                required
              />
            </div>
            <div>
              <label className={fulfillmentLabelClass}>
                Tracking URL {isOtherProvider ? "" : "(auto)"}
              </label>
              <input
                type="url"
                value={editForm.trackingUrl}
                onChange={(e) => onFormChange({ ...editForm, trackingUrl: e.target.value })}
                readOnly={!isOtherProvider}
                className={`${fulfillmentFieldClass} ${!isOtherProvider ? "bg-accent-pink/20 text-muted-custom" : ""}`}
                placeholder={isOtherProvider ? "https://..." : "Auto-filled from courier"}
                required={isOtherProvider}
              />
            </div>
          </div>
        ) : (
          <div className="w-full sm:w-48">
            <label className={fulfillmentLabelClass}>Delivery status</label>
            <select
              value={editForm.deliveryStatus}
              onChange={(e) => handleStatusChange(e.target.value as DeliveryStatus)}
              className={fulfillmentFieldClass}
            >
              {DELIVERY_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {DELIVERY_LABELS[status]}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {saveError && <p className="mt-2 text-[11px] font-medium text-rose-600">{saveError}</p>}

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          disabled={saving}
          onClick={onSave}
          className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-border-custom/80 bg-white px-4 py-2 text-xs font-semibold text-primary-dark"
        >
          Cancel
        </button>
      </div>
    </>
  );
}
