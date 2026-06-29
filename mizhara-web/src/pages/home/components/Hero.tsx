import PromoBannerCarousel from "./PromoBannerCarousel";
import type { SerializedProduct } from "@/types/catalog";
import type { Offer } from "@/types/offer";

interface HeroProps {
  featuredProducts: SerializedProduct[];
  offers?: Offer[];
}

export default function Hero({ featuredProducts, offers = [] }: HeroProps) {
  return (
    <section className="bg-background">
      <PromoBannerCarousel products={featuredProducts} offers={offers} />
    </section>
  );
}
