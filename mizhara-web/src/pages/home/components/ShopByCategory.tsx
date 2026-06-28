import { Link } from "react-router-dom";
import type { Category } from "@/types/catalog";

interface ShopByCategoryProps {
  categories: Category[];
}

export default function ShopByCategory({ categories }: ShopByCategoryProps) {
  const active = categories.filter((cat) => cat.isActive !== false);
  if (!active.length) return null;

  return (
    <section className="py-10 sm:py-12 bg-white border-y border-border-custom/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4 mb-5 sm:mb-6">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-custom mb-1.5">Collections</p>
            <h2 className="font-serif text-xl sm:text-2xl font-light text-primary-dark tracking-tight">
              Shop by Category
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-accent-gold to-transparent w-12 mt-2" />
          </div>
          <Link to="/products" className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary hover:text-primary-hover after:content-['_→'] shrink-0">
            View all
          </Link>
        </div>

        <div
          className="flex flex-nowrap gap-3 sm:gap-3.5 overflow-x-auto snap-x snap-mandatory pb-1 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 scrollbar-hide"
        >
          {active.map((cat, index) => (
            <Link
              key={cat.id}
              to={`/products?category=${encodeURIComponent(cat.name)}`}
              className="group flex flex-col shrink-0 snap-start w-[6.5rem] sm:w-[7.5rem] md:w-[8.25rem] text-center"
            >
              <div className="aspect-square w-full overflow-hidden rounded-2xl border border-border-custom bg-accent-pink/50 transition-all duration-200 group-hover:border-accent-gold/50 group-hover:shadow-md group-hover:-translate-y-0.5">
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    loading={index < 8 ? "eager" : "lazy"}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent-pink to-secondary/60">
                    <span className="font-serif text-2xl sm:text-3xl text-primary/30">{cat.name.charAt(0)}</span>
                  </div>
                )}
              </div>
              <p className="mt-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.12em] text-primary-dark leading-snug line-clamp-2 px-0.5">
                {cat.name}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
