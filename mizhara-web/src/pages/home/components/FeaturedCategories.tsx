import { Link } from "react-router-dom";
import SectionHeader from "./SectionHeader";

const categories = [
  { name: "Rings", description: "Adjustable bands", query: "Rings", tone: "from-secondary/80 to-accent-pink/40" },
  { name: "Anklets", description: "Layered chains", query: "Anklets", tone: "from-accent-pink/50 to-secondary/60" },
  { name: "Chains", description: "Neck & chokers", query: "Chains", tone: "from-secondary to-background" },
  { name: "Waist Chains", description: "Dewdrop styles", query: "Waist Chains", tone: "from-accent-pink/30 to-secondary/70" },
  { name: "Nose Pins", description: "Studs & hooks", query: "Nose Pins", tone: "from-secondary/90 to-accent-pink/20" },
  { name: "Bracelets", description: "Dainty links", query: "Bracelets", tone: "from-accent-pink/40 to-secondary/50" },
];

export default function FeaturedCategories() {
  return (
    <section className="py-20 sm:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          index="01"
          label="Collections"
          title="Shop by Style"
          subtitle="From delicate everyday pieces to statement ornaments — find what speaks to you."
          align="center"
        />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to={`/products?category=${encodeURIComponent(cat.query)}`}
              className="home-category-card group relative overflow-hidden aspect-[3/4] flex flex-col justify-end p-4 sm:p-5"
            >
              <div className={`absolute inset-0 bg-gradient-to-b ${cat.tone} transition-transform duration-500 group-hover:scale-105`} />
              <div className="absolute inset-0 border border-border-custom/80 group-hover:border-accent-gold/40 transition-colors" />
              <div className="relative z-10">
                <span className="font-serif text-3xl sm:text-4xl text-primary/25 group-hover:text-accent-gold/50 transition-colors leading-none">
                  {cat.name.charAt(0)}
                </span>
                <h3 className="font-serif text-sm sm:text-base text-primary-dark mt-3 tracking-wide">{cat.name}</h3>
                <p className="text-[10px] text-muted-custom mt-1 font-light">{cat.description}</p>
                <span className="inline-block mt-3 text-[9px] font-bold uppercase tracking-[0.15em] text-primary opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  Shop →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
