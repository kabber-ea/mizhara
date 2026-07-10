import type { PaginationMeta } from "@/types/pagination";
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_LIMIT,
  EMPTY_PAGINATION,
} from "@/constants/pagination";

export type { PaginationMeta } from "@/types/pagination";
export { DEFAULT_PAGE, DEFAULT_PAGE_LIMIT, EMPTY_PAGINATION } from "@/constants/pagination";

export function parseListResponse<T>(data?: { items?: T[]; pagination?: PaginationMeta }) {
  return {
    items: data?.items ?? [],
    pagination: data?.pagination ?? EMPTY_PAGINATION,
  };
}

export function pageLimitParams(page: number, limit = DEFAULT_PAGE_LIMIT) {
  return { page: String(page), limit: String(limit) };
}
