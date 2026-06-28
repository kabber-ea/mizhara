import { Link } from "react-router-dom";

const tiers = [
  { label: "Under ₹999", href: "/products" },
  { label: "Under ₹1,499", href: "/products" },
  { label: "Under ₹2,499", href: "/products" },
  { label: "Premium Picks", href: "/products?sort=popular" },
];

export default function BudgetSection() {
  return (
    <section className="py-14 sm:py-16 bg-white border-y border-border-custom/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-serif text-xl sm:text-2xl text-primary-dark text-center mb-8">
          Your Budget, Your Bling
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {tiers.map((tier) => (
            <Link key={tier.label} to={tier.href} className="group flex flex-col items-center justify-center text-center p-7 bg-accent-pink border border-border-custom rounded-2xl transition-all hover:border-accent-gold hover:shadow-[0_8px_24px_-12px_rgba(60,52,46,0.12)]">
              <span className="font-serif text-lg sm:text-xl text-primary-dark group-hover:text-primary transition-colors">
                {tier.label}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-custom mt-2 group-hover:text-primary">
                Shop Now →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
