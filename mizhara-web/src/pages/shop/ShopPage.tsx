import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "react-router-dom";
import FilterSidebar from "@/pages/shop/components/FilterSidebar";
import ProductGrid from "@/pages/shop/components/ProductGrid";
import SortDropdown from "@/pages/shop/components/SortDropdown";
import { api } from "@/lib/api";
import { offerAppliesToProduct } from "@/lib/offer-label";
import type { Offer } from "@/types/offer";
import type { Category, SerializedProduct } from "@/types/catalog";

const SORT_OPTIONS = [
  { value: "popular", label: "Featured" },
  { value: "rating", label: "Best Selling" },
  { value: "price-low", label: "Price, Low to High" },
  { value: "price-high", label: "Price, High to Low" },
  { value: "newest", label: "Date, New to Old" },
] as const;

function FilterIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
    </svg>
  );
}

function CatalogContent() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "All";
  const initialSort = searchParams.get("sort") || "popular";

  const [products, setProducts] = useState<SerializedProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<SerializedProduct[]>([]);
  const [activeOffers, setActiveOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [priceRange, setPriceRange] = useState(10000);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [sortBy, setSortBy] = useState(initialSort);
  const [selectedOfferIds, setSelectedOfferIds] = useState<string[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [{ data: productsData }, { data: categoriesData }, { data: offersData }] = await Promise.all([
          api.get<SerializedProduct[]>("/api/products"),
          api.get<Category[]>("/api/categories"),
          api.get<Offer[]>("/api/offers/active"),
        ]);

        setProducts(productsData ?? []);
        setCategories(categoriesData ?? []);
        setActiveOffers(offersData ?? []);

        if ((productsData ?? []).length > 0) {
          const prices = (productsData ?? []).map((p) => p.price);
          const highest = Math.ceil(Math.max(...prices));
          setMaxPrice(highest);
          setPriceRange(highest);
        }
      } catch (error) {
        console.error("Failed to load catalog data", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    setSelectedCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    setSortBy(initialSort);
  }, [initialSort]);

  useEffect(() => {
    const offerParam = searchParams.get("offer");
    if (!offerParam) {
      setSelectedOfferIds([]);
      return;
    }
    const ids = offerParam.split(",").filter(Boolean);
    if (activeOffers.length === 0) {
      setSelectedOfferIds(ids);
      return;
    }
    setSelectedOfferIds(ids.filter((id) => activeOffers.some((o) => o.id === id)));
  }, [searchParams, activeOffers]);

  useEffect(() => {
    let result = [...products];

    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.materials.some((m) => m.toLowerCase().includes(query))
      );
    }

    if (selectedCategory !== "All") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    result = result.filter((p) => p.price <= priceRange);

    if (selectedOfferIds.length > 0) {
      result = result.filter((p) =>
        selectedOfferIds.some((offerId) => {
          const offer = activeOffers.find((o) => o.id === offerId);
          return offer ? offerAppliesToProduct(p.id, offer) : false;
        })
      );
    }

    if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "newest") {
      // API default order preserved
    } else {
      result.sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return b.rating - a.rating;
      });
    }

    setFilteredProducts(result);
  }, [products, search, selectedCategory, priceRange, sortBy, selectedOfferIds, activeOffers]);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    const next = new URLSearchParams(searchParams);
    if (cat === "All") next.delete("category");
    else next.set("category", cat);
    setSearchParams(next, { replace: true });
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    const next = new URLSearchParams(searchParams);
    if (value === "popular") next.delete("sort");
    else next.set("sort", value);
    setSearchParams(next, { replace: true });
  };

  const handleOfferFilterChange = (ids: string[]) => {
    setSelectedOfferIds(ids);
    const next = new URLSearchParams(searchParams);
    if (ids.length === 0) next.delete("offer");
    else next.set("offer", ids.join(","));
    setSearchParams(next, { replace: true });
  };

  const resetFilters = () => {
    setSearch("");
    setSelectedCategory("All");
    setPriceRange(maxPrice);
    setSortBy("popular");
    setSelectedOfferIds([]);
    const next = new URLSearchParams(searchParams);
    next.delete("category");
    next.delete("sort");
    next.delete("offer");
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 text-center space-y-2">
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold tracking-tight text-primary-dark">
          The Mizhara Collection
        </h1>
        <p className="text-xs text-muted-custom max-w-md mx-auto leading-relaxed">
          Glimmer with delicate rings, sparkling nose pins, lovely double anklets, and hand-layered chains.
        </p>
      </div>

      <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-border-custom/70">
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          className="inline-flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-[0.14em] text-primary-dark hover:text-primary transition-colors cursor-pointer shrink-0"
        >
          <FilterIcon />
          {filtersOpen ? "Hide Filters" : "Show Filters"}
        </button>

        <p className="font-serif text-sm sm:text-base italic text-primary-dark text-center">
          Showing {loading ? "…" : filteredProducts.length} Products
        </p>

        <SortDropdown value={sortBy} options={SORT_OPTIONS} onChange={handleSortChange} />
      </div>

      <div className={`grid gap-8 ${filtersOpen ? "lg:grid-cols-4" : "grid-cols-1"}`}>
        {filtersOpen && (
          <div className="lg:col-span-1">
            <FilterSidebar
              search={search}
              setSearch={setSearch}
              selectedCategory={selectedCategory}
              setSelectedCategory={handleCategoryChange}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              categories={categories.map((c) => c.name)}
              maxPrice={maxPrice}
              offers={activeOffers}
              selectedOfferIds={selectedOfferIds}
              setSelectedOfferIds={handleOfferFilterChange}
              onReset={resetFilters}
            />
          </div>
        )}

        <div className={filtersOpen ? "lg:col-span-3" : ""}>
          <ProductGrid
            products={filteredProducts}
            loading={loading}
            offers={activeOffers}
            filtersOpen={filtersOpen}
          />
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <main className="flex-grow">
      <Suspense
        fallback={
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center text-xs text-muted-custom">
            Loading the Mizhara Collection...
          </div>
        }
      >
        <CatalogContent />
      </Suspense>
    </main>
  );
}
