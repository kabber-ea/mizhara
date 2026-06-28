import { Link } from "react-router-dom";

const categories = [
  "Chains",
  "Bracelets",
  "Waist Chains",
  "Anklets",
  "Rings",
  "Nose Pins",
  "Earrings",
  "Bangles",
];

export default function CategoryStrip() {
  return (
    <nav
      aria-label="Shop by category"
      className="border-b border-border-custom/60 bg-white/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-custom shrink-0">
            Browse
          </span>
          <span className="h-3 w-px bg-border-custom shrink-0" aria-hidden />
          {categories.map((name) => (
            <Link
              key={name}
              to={`/products?category=${encodeURIComponent(name)}`}
              className="shrink-0 px-3.5 py-1.5 border border-primary-dark/10 rounded-full text-[10px] font-semibold uppercase tracking-wider text-primary-dark bg-white transition-colors hover:border-accent-gold hover:text-primary hover:bg-accent-pink/60"
            >
              {name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
