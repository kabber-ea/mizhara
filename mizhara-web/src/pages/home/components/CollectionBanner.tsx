import { Link } from "react-router-dom";
import type { SerializedProduct } from "@/types/catalog";

interface CollectionBannerProps {
  products: SerializedProduct[];
  eyebrow?: string;
  title?: string;
  description?: string;
  href?: string;
  cta?: string;
}

export default function CollectionBanner({
  products,
  eyebrow = "Curated Edit",
  title = "Featured Collection",
  description = "Handpicked rings, chains, and anklets — the pieces our stylists reach for first.",
  href = "/products?sort=popular",
  cta = "Shop Collection",
}: CollectionBannerProps) {
  const showcase = products.slice(0, 4);
  if (showcase.length === 0) return null;

  return (
    <section className="py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="collection-banner rounded-2xl sm:rounded-3xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            <div className="collection-banner-copy p-8 sm:p-10 lg:p-14 flex flex-col justify-center">
              <p className="section-label text-[9px] mb-3">{eyebrow}</p>
              <h2 className="font-serif text-3xl sm:text-4xl font-light text-primary-dark leading-tight">
                {title}
              </h2>
              <p className="text-sm text-muted-custom mt-4 leading-relaxed max-w-md font-light">
                {description}
              </p>
              <Link
                to={href}
                className="inline-flex items-center self-start mt-8 text-[10px] font-bold uppercase tracking-[0.18em] text-primary-dark hover:text-primary transition-colors"
              >
                {cta} →
              </Link>
            </div>

            <div className="collection-banner-grid grid grid-cols-2 gap-2 p-4 sm:p-6 lg:p-8">
              {showcase.map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="collection-banner-item group overflow-hidden rounded-xl"
                >
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
