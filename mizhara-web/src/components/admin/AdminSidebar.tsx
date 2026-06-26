import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: "📊", exact: true },
  { href: "/admin/orders", label: "Orders", icon: "📦" },
  { href: "/admin/customers", label: "Customers", icon: "👥" },
  { href: "/admin/catalog", label: "Catalog", icon: "💎" },
];

export default function AdminSidebar() {
  const location = useLocation(); const pathname = location.pathname;
  const { logout } = useAuth();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:w-60 bg-white border-r border-border-custom">
        <div className="flex flex-col h-full">
          <div className="px-5 py-6 border-b border-border-custom/60">
            <Link to="/admin" className="font-serif text-lg tracking-widest text-primary-dark font-extrabold hover:opacity-90">
              MIZHARA<span className="text-primary">✦</span>
            </Link>
            <p className="text-[10px] font-bold text-muted-custom uppercase tracking-wider mt-1">Admin Panel</p>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors duration-150 ${
                    active
                      ? "bg-primary text-white shadow-sm"
                      : "text-foreground/75 hover:bg-accent-mint/30 hover:text-primary-dark"
                  }`}
                >
                  <span className="text-sm">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="px-3 py-4 border-t border-border-custom/60">
            <button
              type="button"
              onClick={() => logout("/login")}
              className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold text-muted-custom hover:text-rose-600 hover:bg-rose-50/50 transition-colors cursor-pointer"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:hidden sticky top-0 z-40 bg-white border-b border-border-custom shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between">
          <Link to="/admin" className="font-serif text-sm tracking-widest text-primary-dark font-extrabold">
            MIZHARA<span className="text-primary">✦</span>
          </Link>
          <span className="text-[10px] font-bold text-muted-custom uppercase">Admin</span>
        </div>
        <nav className="flex gap-1 px-3 pb-3 overflow-x-auto">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors duration-150 ${
                  active ? "bg-primary text-white" : "text-foreground/75 bg-accent-mint/20 hover:text-primary-dark"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
