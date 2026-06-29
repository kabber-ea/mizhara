import { INSTAGRAM_URL, whatsappUrl } from "@/lib/contact-links";
import type { SerializedProduct } from "@/types/catalog";

interface StorySectionProps {
  spotlightProduct?: SerializedProduct;
}

export default function StorySection({ spotlightProduct }: StorySectionProps) {
  const values = [
    "Anti-Tarnish Polish",
    "Skin-Friendly Sterling Base",
    "Premium Gift Packaging",
    "Hand-Set Cubic Zirconia",
  ];

  return (
    <section className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {spotlightProduct ? (
            <div className="relative order-2 lg:order-1 aspect-[4/5] max-w-md mx-auto lg:max-w-none w-full overflow-hidden">
              <img
                src={spotlightProduct.images[0]}
                alt={spotlightProduct.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 border border-border-custom pointer-events-none m-4 sm:m-6" />
            </div>
          ) : (
            <div className="order-2 lg:order-1 aspect-[4/5] max-w-md mx-auto lg:max-w-none w-full bg-accent-pink/20 flex items-center justify-center">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-custom">Mizhara</span>
            </div>
          )}

          <div className="order-1 lg:order-2 space-y-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-custom">Our Story</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-light text-primary-dark leading-snug tracking-tight">
              Crafted for women who shine in the details
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-accent-gold to-transparent w-14" />
            <p className="text-sm text-muted-custom leading-relaxed font-light">
              Mizhara was born from a love of dainty, fancy ornaments that feel personal — not mass-produced.
              Every piece uses a sterling silver foundation, triple-plated for lasting radiance, and finishes
              that complement both casual mornings and celebration nights.
            </p>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 pt-2">
              {values.map((v) => (
                <li key={v} className="flex items-center gap-3 text-xs text-foreground/85 font-light">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center border border-accent-gold/50 text-accent-gold text-[10px]">
                    ✓
                  </span>
                  {v}
                </li>
              ))}
            </ul>

            <blockquote className="mt-6 pl-4 border-l-2 border-accent-gold/50">
              <p className="font-serif text-base text-primary-dark/90 italic font-light leading-relaxed">
                "Delicate, sparkling, and gentle on sensitive skin — I am absolutely obsessed."
              </p>
              <footer className="text-[10px] text-muted-custom mt-2 uppercase tracking-wider">— Alisha R., Verified Customer</footer>
            </blockquote>

            <div className="flex flex-wrap gap-4 pt-2">
              {whatsappUrl() && (
                <a
                  href={whatsappUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary hover:text-primary-hover after:content-['_→']"
                >
                  WhatsApp
                </a>
              )}
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary hover:text-primary-hover after:content-['_→']"
              >
                Instagram
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
