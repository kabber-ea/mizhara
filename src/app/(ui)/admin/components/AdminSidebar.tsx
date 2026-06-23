"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/ui/components/AuthProvider";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: "📊", exact: true },
  { href: "/admin/orders", label: "Orders", icon: "📦" },
  { href: "/admin/customers", label: "Customers", icon: "👥" },
  { href: "/admin/catalog", label: "Catalog", icon: "💎" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside className="w-full lg:w-56 shrink-0">
      <div className="bg-white border border-border-custom rounded-2xl p-4 space-y-1 sticky top-20">
        <p className="text-[10px] font-bold text-muted-custom uppercase px-3 pb-2">Admin Panel</p>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              isActive(item.href, item.exact)
                ? "bg-primary text-white"
                : "text-foreground/75 hover:bg-accent-mint/20 hover:text-primary-dark"
            }`}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
        <div className="pt-3 mt-3 border-t border-border-custom/50 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-muted-custom hover:text-primary"
          >
            ← Back to store
          </Link>
          <button
            type="button"
            onClick={() => logout("/admin/login")}
            className="w-full text-left px-3 py-2 rounded-xl text-xs text-muted-custom hover:text-rose-600"
          >
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}
