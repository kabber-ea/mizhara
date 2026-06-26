export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export function parsePagination(searchParams: URLSearchParams) {
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  let limit = Number(searchParams.get("limit")) || 10;
  if (limit > 50) limit = 50;
  const search = searchParams.get("search") || "";
  return { page, limit, skip: (page - 1) * limit, search };
}

export function buildPaginationMeta(page: number, limit: number, total: number): PaginationMeta {
  return { page, limit, total, totalPages: limit > 0 ? Math.ceil(total / limit) : 0 };
}
