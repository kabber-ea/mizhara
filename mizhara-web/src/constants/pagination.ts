import type { PaginationMeta } from "@/types/pagination";

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_LIMIT = 10;

export type SortDirection = "asc" | "desc";

export type SortState = {
  column: string;
  direction: SortDirection;
};

export const DEFAULT_SORT: SortState = { column: "createdAt", direction: "desc" };

export const EMPTY_PAGINATION: PaginationMeta = {
  page: DEFAULT_PAGE,
  limit: DEFAULT_PAGE_LIMIT,
  total: 0,
  totalPages: 1,
};
