import { Link } from "react-router-dom";
import PromoBannerCarousel from "./PromoBannerCarousel";
import type { SerializedProduct } from "@/types/catalog";
import type { Offer } from "@/types/offer";

const categoryLinks = [
  { label: "Rings", href: "/products?category=Rings" },
  { label: "Anklets", href: "/products?category=Anklets" },
  { label: "Chains", href: "/products?category=Chains" },
  { label: "Earrings", href: "/products?category=Earrings" },
  { label: "Bracelets", href: "/products?category=Bracelets" },
  { label: "Bangles", href: "/products?category=Bangles" },
  { label: "All Products", href: "/products" },
];

interface HeroProps {
  featuredProducts: SerializedProduct[];
  offers?: Offer[];
}

export default function Hero({ featuredProducts, offers = [] }: HeroProps) {
  return (
    <section className="hero-promo pt-4 sm:pt-6 pb-2 bg-background">
      <nav
        aria-label="Shop by category"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4 sm:mb-6 overflow-x-auto scrollbar-hide"
      >
        <div className="flex items-center justify-center gap-5 sm:gap-8 min-w-max mx-auto">
          {categoryLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] text-muted-custom hover:text-primary-dark whitespace-nowrap transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>

      <PromoBannerCarousel products={featuredProducts} offers={offers} />
    </section>
  );
}
