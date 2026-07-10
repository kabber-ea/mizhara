export const DEFAULT_MAX_PRICE = 10_000;

export const SHOP_SORT_OPTIONS = [
  { value: "popular", label: "Featured" },
  { value: "rating", label: "Best Selling" },
  { value: "price-low", label: "Price, Low to High" },
  { value: "price-high", label: "Price, High to Low" },
  { value: "newest", label: "Date, New to Old" },
] as const;
