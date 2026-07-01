import type { SortDirection, SortState } from "@/lib/sort";

type SortableTableHeaderProps = {
  label: string;
  column: string;
  sort: SortState;
  onSort: (column: string) => void;
  align?: "left" | "center" | "right";
  className?: string;
};

function SortIcon({ active, direction }: { active: boolean; direction: SortDirection }) {
  return (
    <span className="inline-flex flex-col gap-px ml-1.5 shrink-0" aria-hidden>
      <svg
        viewBox="0 0 8 5"
        className={`w-2 h-1.5 ${active && direction === "asc" ? "text-primary" : "text-muted-custom/40"}`}
        fill="currentColor"
      >
        <path d="M4 0 8 5H0z" />
      </svg>
      <svg
        viewBox="0 0 8 5"
        className={`w-2 h-1.5 ${active && direction === "desc" ? "text-primary" : "text-muted-custom/40"}`}
        fill="currentColor"
      >
        <path d="M4 5 0 0h8z" />
      </svg>
    </span>
  );
}

export default function SortableTableHeader({
  label,
  column,
  sort,
  onSort,
  align = "left",
  className = "",
}: SortableTableHeaderProps) {
  const active = sort.column === column;
  const alignClass =
    align === "center" ? "justify-center" : align === "right" ? "justify-end" : "justify-start";

  return (
    <th className={`px-4 py-3 ${className}`}>
      <button
        type="button"
        onClick={() => onSort(column)}
        className={`inline-flex items-center ${alignClass} w-full font-bold text-inherit hover:text-primary transition-colors cursor-pointer uppercase tracking-wide text-[10px]`}
        aria-sort={active ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}
      >
        <span>{label}</span>
        <SortIcon active={active} direction={sort.direction} />
      </button>
    </th>
  );
}
