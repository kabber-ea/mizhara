import {
  DEFAULT_SORT,
  type SortDirection,
  type SortState,
} from "@/constants/pagination";

export type { SortDirection, SortState } from "@/constants/pagination";
export { DEFAULT_SORT } from "@/constants/pagination";

export function nextSort(current: SortState, column: string): SortState {
  if (current.column !== column) {
    return { column, direction: "asc" };
  }
  return { column, direction: current.direction === "asc" ? "desc" : "asc" };
}
