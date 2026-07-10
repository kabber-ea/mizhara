import StatusBadge from "@/components/StatusBadge";
import { formatINR } from "@/utils/format";
import type { SerializedOrder } from "@/types/admin";

export default function RecentOrdersTable({ orders }: { orders: SerializedOrder[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border-custom/80 bg-white shadow-sm shadow-primary-dark/[0.03]">
      <div className="border-b border-border-custom/50 bg-gradient-to-r from-accent-pink/40 to-white px-5 py-4">
        <h3 className="font-serif text-sm font-semibold text-primary-dark">Recent Orders</h3>
        <p className="mt-0.5 text-[10px] text-muted-custom">Latest transactions</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-custom/50 bg-accent-pink/20">
              <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-muted-custom">
                Order
              </th>
              <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-muted-custom">
                Customer
              </th>
              <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-muted-custom">
                Total
              </th>
              <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-muted-custom">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr
                key={o.id}
                className="border-b border-border-custom/30 transition-colors last:border-0 hover:bg-accent-pink/15"
              >
                <td className="px-5 py-3">
                  <span className="rounded-md bg-accent-pink/50 px-2 py-0.5 font-mono text-[10px] font-medium text-primary-dark">
                    {o.orderNumber}
                  </span>
                </td>
                <td className="px-3 py-3 text-xs font-medium text-primary-dark">{o.customerName}</td>
                <td className="px-3 py-3 font-serif text-xs font-semibold tabular-nums text-primary-dark">
                  {formatINR(o.total)}
                </td>
                <td className="px-5 py-3">
                  <StatusBadge status={o.deliveryStatus} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
