export type SortDirection = "asc" | "desc";

export type SortState = {
  column: string;
  direction: SortDirection;
};

export function nextSort(current: SortState, column: string): SortState {
  if (current.column !== column) {
    return { column, direction: "asc" };
  }
  return { column, direction: current.direction === "asc" ? "desc" : "asc" };
}

export const DEFAULT_SORT: SortState = { column: "createdAt", direction: "desc" };
