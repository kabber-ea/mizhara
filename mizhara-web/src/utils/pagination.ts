export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export const EMPTY_PAGINATION: PaginationMeta = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
};

export function parseListResponse<T>(data?: { items?: T[]; pagination?: PaginationMeta }) {
  return {
    items: data?.items ?? [],
    pagination: data?.pagination ?? EMPTY_PAGINATION,
  };
}
