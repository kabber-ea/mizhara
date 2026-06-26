import { Link } from "react-router-dom";
import type { Category } from "@/types/catalog";

interface ShopByCategoryProps {
  categories: Category[];
}

export default function ShopByCategory({ categories }: ShopByCategoryProps) {
  if (!categories.length) return null;

  return (
    <section className="py-10 sm:py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-serif text-xl sm:text-2xl text-primary-dark text-center mb-8">
          Shop by Category
        </h2>

        <div className="category-scroll scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${encodeURIComponent(cat.name)}`}
              className="category-tile group shrink-0"
            >
              <div className="category-tile-image">
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-accent-pink flex items-center justify-center">
                    <span className="font-serif text-3xl text-primary/30">{cat.name.charAt(0)}</span>
                  </div>
                )}
              </div>
              <div className="category-tile-footer">
                <p className="category-tile-label">{cat.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
