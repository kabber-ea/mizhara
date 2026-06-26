import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import { loginUrl } from "@/lib/auth-url";
import { useCart } from "@/providers/CartProvider";
import { formatINR } from "@/lib/format";

export default function Navbar() {
  const { cartItems, cartCount, cartTotal, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart } = useCart();
  const { user, loading, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const pathname = location.pathname;

  const isCustomer = user?.role === "customer";
  const showStoreNav = !loading && user?.role !== "admin";

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/products" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link
              to="/"
              className="font-serif text-[1.35rem] sm:text-2xl tracking-[0.18em] text-primary-dark font-semibold hover:opacity-80 transition-opacity"
            >
              MIZHARA
            </Link>

            {showStoreNav && (
              <>
                <nav className="hidden md:flex items-center gap-1">
                  {navLinks.map((link) => {
                    const isActive = pathname === link.path;
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        className={`px-4 py-2 text-sm font-medium tracking-wide transition-colors ${
                          isActive
                            ? "text-primary-dark border-b-2 border-accent-gold"
                            : "text-muted-custom hover:text-primary-dark"
                        }`}
                      >
                        {link.name}
                      </Link>
                    );
                  })}
                </nav>

                <div className="flex items-center gap-2 sm:gap-3">
                  {isCustomer ? (
                    <>
                      <Link
                        to="/account"
                        className="hidden sm:inline text-xs font-semibold text-muted-custom hover:text-primary"
                      >
                        Account
                      </Link>
                      <button
                        type="button"
                        onClick={() => logout("/login")}
                        className="hidden sm:inline text-xs font-semibold text-muted-custom hover:text-primary cursor-pointer"
                      >
                        Sign out
                      </button>
                    </>
                  ) : (
                    <Link
                      to={loginUrl()}
                      className="hidden sm:inline text-xs font-semibold text-primary hover:text-primary-hover"
                    >
                      Sign in
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsCartOpen(true)}
                    className="relative p-2 text-muted-custom hover:text-primary-dark transition-colors cursor-pointer"
                    aria-label="Shopping Cart"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                    {cartCount > 0 && (
                      <span className="absolute top-0.5 right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary-dark text-[10px] font-bold text-white ring-2 ring-background">
                        {cartCount}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="md:hidden p-2 rounded-xl text-foreground/80 hover:text-primary cursor-pointer"
                    aria-label="Toggle Menu"
                  >
                    {isMobileMenuOpen ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                      </svg>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {showStoreNav && isMobileMenuOpen && (
          <div className="md:hidden border-t border-border-custom/50 bg-background/95 backdrop-blur-md px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-3 text-sm font-medium ${
                  pathname === link.path ? "text-primary-dark border-l-2 border-accent-gold" : "text-muted-custom hover:text-primary-dark"
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-3 mt-2 border-t border-border-custom/50 flex flex-col gap-2">
              {isCustomer ? (
                <>
                  <Link to="/account" onClick={() => setIsMobileMenuOpen(false)} className="block text-center px-4 py-2.5 rounded-xl text-sm font-semibold border border-border-custom">
                    My Account
                  </Link>
                  <button
                    type="button"
                    onClick={() => { logout("/login"); setIsMobileMenuOpen(false); }}
                    className="text-center text-sm font-semibold text-muted-custom py-2 cursor-pointer"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <Link
                  to={loginUrl()}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full text-center px-4 py-2.5 text-sm font-semibold bg-primary-dark text-white"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {showStoreNav && isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <button
            type="button"
            aria-label="Close cart"
            className="absolute inset-0 bg-black/40 backdrop-blur-xs cursor-pointer"
            onClick={() => setIsCartOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 flex max-w-full pl-10 pointer-events-none">
            <div className="w-screen max-w-md pointer-events-auto">
              <div className="flex h-full flex-col bg-background shadow-2xl border-l border-border-custom">
                <div className="flex items-center justify-between border-b border-border-custom px-5 py-5">
                  <h2 className="text-base font-serif font-bold text-primary-dark">Your Bag</h2>
                  <button type="button" onClick={() => setIsCartOpen(false)} className="p-2 text-muted-custom hover:text-primary cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto px-5 py-5">
                  {cartItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-12">
                      <p className="text-sm text-muted-custom">Your bag is empty</p>
                      <Link to="/products" onClick={() => setIsCartOpen(false)} className="text-sm text-primary font-semibold hover:underline">
                        Start shopping
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex gap-3 p-3 rounded-xl border border-border-custom">
                          <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-border-custom bg-accent-pink/10">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="object-cover w-full h-full object-cover" />
                            ) : (
                              <div className="flex h-full items-center justify-center text-lg">✨</div>
                            )}
                          </div>
                          <div className="flex flex-1 flex-col min-w-0">
                            <div className="flex justify-between gap-2">
                              <h3 className="text-sm font-semibold line-clamp-2">{item.name}</h3>
                              <p className="text-sm font-bold text-primary-dark whitespace-nowrap">{formatINR(item.price * item.quantity)}</p>
                            </div>
                            <div className="mt-auto pt-2 flex items-center justify-between">
                              <div className="flex items-center border border-border-custom rounded-lg overflow-hidden">
                                <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 py-1 font-bold text-xs cursor-pointer">−</button>
                                <span className="px-2 text-xs font-semibold">{item.quantity}</span>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  disabled={item.quantity >= item.maxStock}
                                  className="px-2 py-1 font-bold text-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  +
                                </button>
                              </div>
                              <button type="button" onClick={() => removeFromCart(item.id)} className="text-[10px] font-semibold text-primary cursor-pointer">Remove</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {cartItems.length > 0 && (
                  <div className="border-t border-border-custom px-5 py-5 space-y-4">
                    <div className="flex justify-between font-semibold">
                      <span className="text-sm text-muted-custom">Subtotal</span>
                      <span className="text-lg font-extrabold text-primary-dark">{formatINR(cartTotal)}</span>
                    </div>
                    <Link to="/cart" onClick={() => setIsCartOpen(false)} className="block w-full py-3 bg-primary-dark text-white text-center text-xs font-semibold uppercase tracking-[0.12em]">
                      View Bag
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
