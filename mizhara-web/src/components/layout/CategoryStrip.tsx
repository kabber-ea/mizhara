import { Link } from "react-router-dom";
import type { Category } from "@/types/catalog";

interface CategoryStripProps {
  categories: Category[];
}

const linkClass =
  "text-[11px] sm:text-xs font-medium tracking-[0.12em] whitespace-nowrap text-muted-custom hover:text-primary-dark transition-colors";

export default function CategoryStrip({ categories }: CategoryStripProps) {
  const active = categories.filter((c) => c.isActive !== false);
  if (!active.length) return null;

  const links = [
    { label: "All", href: "/products" },
    ...active.map((c) => ({
      label: c.name,
      href: `/products?category=${encodeURIComponent(c.name)}`,
    })),
  ];

  return (
    <nav
      aria-label="Shop by category"
      className="w-full border-b border-border-custom/60 bg-white/90 backdrop-blur-sm overflow-x-auto scrollbar-hide"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-5 sm:gap-8 min-w-max mx-auto py-3">
          {links.map((link) => (
            <Link key={link.label} to={link.href} className={linkClass}>
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
