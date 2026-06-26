import type { PaginationMeta } from "@/lib/pagination";

type AdminPaginationProps = {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
};

export default function AdminPagination({ pagination, onPageChange }: AdminPaginationProps) {
  const { page, totalPages, total } = pagination;
  if (total === 0) return null;

  const pages: number[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border-custom/50">
      <p className="text-[10px] text-muted-custom">
        Page {page} of {totalPages} · {total} total
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="px-3 py-1.5 text-xs border border-border-custom rounded-lg disabled:opacity-40 hover:bg-accent-mint/10"
        >
          Prev
        </button>
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={`px-3 py-1.5 text-xs border rounded-lg ${
              p === page
                ? "bg-primary text-white border-primary"
                : "border-border-custom hover:bg-accent-mint/10"
            }`}
          >
            {p}
          </button>
        ))}
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="px-3 py-1.5 text-xs border border-border-custom rounded-lg disabled:opacity-40 hover:bg-accent-mint/10"
        >
          Next
        </button>
      </div>
    </div>
  );
}
