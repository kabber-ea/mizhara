import StatusBadge from "@/components/StatusBadge";
import ChartCard from "@/components/ChartCard";
import { formatINR } from "@/utils/format";
import type { SerializedOrder } from "@/types/admin";
import { DASHBOARD_PANEL_MIN_HEIGHT } from "@/constants/dashboard";

const rowGrid = "grid grid-cols-[4.5rem_minmax(0,1fr)_auto_4.5rem] items-center gap-x-2";

export default function RecentOrdersTable({ orders }: { orders: SerializedOrder[] }) {
  const items = orders.slice(0, 5);

  return (
    <ChartCard title="Recent Orders" subtitle="Latest transactions">
      <div className="flex h-full min-h-0 flex-1 flex-col" style={{ minHeight: DASHBOARD_PANEL_MIN_HEIGHT }}>
        {items.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-[11px] text-muted-custom">No orders yet</p>
          </div>
        ) : (
          <>
            <div className={`mb-2 shrink-0 ${rowGrid} text-[9px] font-bold uppercase tracking-[0.1em] text-muted-custom`}>
              <span>Order</span>
              <span>Customer</span>
              <span>Status</span>
              <span className="text-right">Total</span>
            </div>
            <div
              className="grid min-h-0 flex-1 gap-2"
              style={{ gridTemplateRows: `repeat(${items.length}, minmax(0, 1fr))` }}
            >
              {items.map((o) => (
                <div
                  key={o.id}
                  className={`${rowGrid} h-full min-h-0 items-center border-b border-border-custom/30 pb-2 last:border-0 last:pb-0`}
                >
                  <span className="truncate font-mono text-[10px] font-medium text-primary-dark">{o.orderNumber}</span>
                  <p className="truncate text-[11px] font-medium text-primary-dark">{o.customerName}</p>
                  <div className="flex justify-center">
                    <StatusBadge status={o.deliveryStatus} />
                  </div>
                  <p className="text-right text-[10px] font-semibold tabular-nums text-primary-dark">{formatINR(o.total)}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </ChartCard>
  );
}
