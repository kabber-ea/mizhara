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
  { label: "All", href: "/products" },
];

interface HeroProps {
  featuredProducts: SerializedProduct[];
  offers?: Offer[];
}

export default function Hero({ featuredProducts, offers = [] }: HeroProps) {
  return (
    <section className="bg-background">
      <nav
        aria-label="Shop by category"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6 pb-4 sm:pb-5 overflow-x-auto scrollbar-hide"
      >
        <div className="flex items-center justify-center gap-6 sm:gap-10 min-w-max mx-auto">
          {categoryLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className="text-[11px] sm:text-xs font-medium tracking-[0.12em] text-muted-custom hover:text-primary-dark whitespace-nowrap transition-colors"
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
