export type PaginationParams = {
  page: number;
  limit: number;
  skip: number;
  search: string;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export function parsePagination(
  searchParams: URLSearchParams,
  defaults: { page?: number; limit?: number } = {}
): PaginationParams {
  const page = Math.max(1, parseInt(searchParams.get("page") ?? String(defaults.page ?? 1), 10) || 1);
  const limit = Math.min(
    50,
    Math.max(1, parseInt(searchParams.get("limit") ?? String(defaults.limit ?? 10), 10) || 10)
  );
  const search = (searchParams.get("search") ?? "").trim();

  return { page, limit, skip: (page - 1) * limit, search };
}

export function buildPaginationMeta(page: number, limit: number, total: number): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}
