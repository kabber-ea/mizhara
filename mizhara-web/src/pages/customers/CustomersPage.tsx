import { Fragment, useCallback, useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { formatINR } from "@/lib/format";
import { api } from "@/lib/api";
import type { SerializedCustomer } from "@/types/admin";
import type { PaginationMeta } from "@/lib/pagination";
import SearchInput from "@/components/SearchInput";
import Pagination from "@/components/Pagination";
import TableSkeleton from "@/components/TableSkeleton";
import SortableTableHeader from "@/components/SortableTableHeader";
import { DEFAULT_SORT, nextSort, type SortState } from "@/lib/sort";

export default function AdminCustomersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortState>(DEFAULT_SORT);
  const [items, setItems] = useState<SerializedCustomer[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
        search: debouncedSearch,
        sortBy: sort.column,
        sortDir: sort.direction,
      });
      const { data } = await api.get<{ items: SerializedCustomer[]; pagination: PaginationMeta }>(
        `/api/users?${params}`
      );
      setItems(data.items);
      setPagination(data.pagination);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, sort]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, sort]);

  const handleSort = (column: string) => {
    setSort((prev) => nextSort(prev, column));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-primary-dark">Customers</h1>
        <p className="text-xs text-muted-custom mt-1">All registered customers and their order activity</p>
      </div>

      <div className="bg-white border border-border-custom rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="font-serif text-base font-bold text-primary-dark">Customer Directory</h3>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search name, email, or phone..."
          />
        </div>

        {loading && items.length === 0 ? (
          <TableSkeleton rows={6} />
        ) : items.length === 0 ? (
          <p className="text-center py-12 text-xs text-muted-custom">No customers found.</p>
        ) : (
          <div className={loading ? "opacity-60 pointer-events-none transition-opacity duration-150" : "transition-opacity duration-150"}>
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-[10px] text-muted-custom uppercase border-b border-border-custom">
                    <SortableTableHeader label="Name" column="name" sort={sort} onSort={handleSort} className="pb-3 pr-4 !px-0" />
                    <SortableTableHeader label="Email" column="email" sort={sort} onSort={handleSort} className="pb-3 pr-4 !px-0" />
                    <SortableTableHeader label="Phone" column="phone" sort={sort} onSort={handleSort} className="pb-3 pr-4 !px-0" />
                    <SortableTableHeader label="Joined" column="createdAt" sort={sort} onSort={handleSort} className="pb-3 pr-4 !px-0" />
                    <SortableTableHeader label="Orders" column="orderCount" sort={sort} onSort={handleSort} className="pb-3 pr-4 !px-0" />
                    <SortableTableHeader label="Total Spent" column="totalSpent" sort={sort} onSort={handleSort} className="pb-3 pr-4 !px-0" />
                    <th className="pb-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((c) => (
                    <Fragment key={c.id}>
                      <tr className="border-b border-border-custom/30 hover:bg-accent-mint/5">
                        <td className="py-3 pr-4 font-semibold text-primary-dark">{c.name}</td>
                        <td className="py-3 pr-4 text-muted-custom">{c.email ?? "—"}</td>
                        <td className="py-3 pr-4">{c.phone ?? "—"}</td>
                        <td className="py-3 pr-4">{new Date(c.createdAt).toLocaleDateString("en-IN")}</td>
                        <td className="py-3 pr-4">{c.orderCount}</td>
                        <td className="py-3 pr-4 font-semibold">{formatINR(c.totalSpent)}</td>
                        <td className="py-3">
                          <button
                            type="button"
                            onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                            className="text-[10px] text-primary font-semibold hover:underline"
                          >
                            {expandedId === c.id ? "Hide" : "Details"}
                          </button>
                        </td>
                      </tr>
                      {expandedId === c.id && (
                        <tr className="bg-accent-mint/5">
                          <td colSpan={7} className="px-4 py-3 text-[11px] text-muted-custom">
                            <strong className="text-primary-dark">Customer ID:</strong> {c.id} ·{" "}
                            <strong className="text-primary-dark">Member since:</strong>{" "}
                            {new Date(c.createdAt).toLocaleString("en-IN")} ·{" "}
                            <strong className="text-primary-dark">Lifetime value:</strong>{" "}
                            {formatINR(c.totalSpent)} across {c.orderCount} order
                            {c.orderCount !== 1 ? "s" : ""}
                          </td>
                        </tr>
                      )}
                    </Fragment>
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
