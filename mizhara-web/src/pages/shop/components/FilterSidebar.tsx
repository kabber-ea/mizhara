import type { Offer } from "@/types/offer";
import { getOfferCardHeadline } from "@/lib/offer-label";

interface FilterSidebarProps {
  search: string;
  setSearch: (s: string) => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  priceRange: number;
  setPriceRange: (p: number) => void;
  categories: string[];
  maxPrice: number;
  offers: Offer[];
  selectedOfferIds: string[];
  setSelectedOfferIds: (ids: string[]) => void;
  onReset: () => void;
}

export default function FilterSidebar({
  search,
  setSearch,
  selectedCategory,
  setSelectedCategory,
  priceRange,
  setPriceRange,
  categories,
  maxPrice,
  offers,
  selectedOfferIds,
  setSelectedOfferIds,
  onReset,
}: FilterSidebarProps) {
  const toggleOffer = (id: string) => {
    setSelectedOfferIds(
      selectedOfferIds.includes(id)
        ? selectedOfferIds.filter((x) => x !== id)
        : [...selectedOfferIds, id]
    );
  };

  return (
    <div className="space-y-6 p-6 bg-white border border-border-custom rounded-2xl shadow-xs">
      <div>
        <label htmlFor="search" className="block text-xs font-bold uppercase tracking-wider text-primary-dark mb-2">
          Search
        </label>
        <div className="relative">
          <input
            type="text"
            id="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search rings, anklets..."
            className="w-full px-4 py-2.5 border border-border-custom rounded-xl text-xs bg-background/50 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-2.5 text-muted-custom hover:text-primary transition-colors text-xs font-bold cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-primary-dark mb-2">
          Category
        </label>
        <div className="flex flex-wrap lg:flex-col gap-2">
          <button
            type="button"
            onClick={() => setSelectedCategory("All")}
            className={`px-3 py-1.5 rounded-lg text-left text-xs font-medium tracking-wide transition-all cursor-pointer ${
              selectedCategory === "All"
                ? "bg-primary text-white shadow-xs font-semibold"
                : "bg-accent-pink/10 hover:bg-accent-pink/30 text-primary-dark"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-left text-xs font-medium tracking-wide transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-primary text-white shadow-xs font-semibold"
                  : "bg-accent-pink/10 hover:bg-accent-pink/30 text-primary-dark"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label htmlFor="price" className="block text-xs font-bold uppercase tracking-wider text-primary-dark">
            Price
          </label>
          <span className="text-xs font-bold text-primary">₹{priceRange.toLocaleString("en-IN")}</span>
        </div>
        <input
          type="range"
          id="price"
          min={0}
          max={maxPrice || 100}
          value={priceRange}
          onChange={(e) => setPriceRange(Number(e.target.value))}
          className="w-full h-1 bg-accent-pink rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <div className="flex justify-between text-[10px] text-muted-custom mt-1">
          <span>₹0</span>
          <span>₹{(maxPrice || 10000).toLocaleString("en-IN")}</span>
        </div>
      </div>

      {offers.length > 0 && (
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-primary-dark mb-2">
            Offers
          </label>
          <ul className="space-y-2">
            {offers.map((offer) => {
              const checked = selectedOfferIds.includes(offer.id);
              const label = getOfferCardHeadline(offer).replace("\n", " ");
              return (
                <li key={offer.id}>
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-primary-dark">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleOffer(offer.id)}
                      className="mt-0.5 accent-primary shrink-0"
                    />
                    <span className={checked ? "font-semibold" : "font-medium"}>{label}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <button
        type="button"
        onClick={onReset}
        className="w-full py-2 border border-dashed border-primary/50 hover:border-primary text-primary hover:text-primary-hover font-semibold text-xs rounded-xl transition-all cursor-pointer"
      >
        Reset Filters
      </button>
    </div>
  );
}
