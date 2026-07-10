import { formatINR } from "@/utils/format";
import type { SerializedCustomer } from "@/types/admin";
import CustomerInitials from "./CustomerInitials";

export default function RecentCustomersTable({ customers }: { customers: SerializedCustomer[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border-custom/80 bg-white shadow-sm shadow-primary-dark/[0.03]">
      <div className="border-b border-border-custom/50 bg-gradient-to-r from-accent-pink/40 to-white px-5 py-4">
        <h3 className="font-serif text-sm font-semibold text-primary-dark">New Customers</h3>
        <p className="mt-0.5 text-[10px] text-muted-custom">Recently joined</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-custom/50 bg-accent-pink/20">
              <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-muted-custom">
                Customer
              </th>
              <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-muted-custom">
                Orders
              </th>
              <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-muted-custom">
                Spent
              </th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr
                key={c.id}
                className="border-b border-border-custom/30 transition-colors last:border-0 hover:bg-accent-pink/15"
              >
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <CustomerInitials name={c.name} />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-primary-dark">{c.name}</p>
                      <p className="truncate text-[10px] text-muted-custom">{c.email ?? "—"}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 text-xs tabular-nums text-primary-dark">{c.orderCount}</td>
                <td className="px-5 py-3 font-serif text-xs font-semibold tabular-nums text-primary-dark">
                  {formatINR(c.totalSpent)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
