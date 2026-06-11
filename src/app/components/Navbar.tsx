"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/app/components/CartProvider";

export default function Navbar() {
  const { cartItems, cartCount, cartTotal, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Shop catalog", path: "/products" },
    { name: "About us", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <>
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 w-full glass-nav transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="font-serif text-2xl tracking-widest text-primary-dark font-extrabold hover:opacity-90">
                MIZHARA<span className="text-primary animate-sparkle-pulse">✦</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navLinks.map((link) => {
                const isActive = pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    href={link.path}
                    className={`text-sm font-medium tracking-wide transition-colors duration-200 ${isActive
                        ? "text-primary border-b-2 border-primary pb-1 font-semibold"
                        : "text-foreground/75 hover:text-primary"
                      }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Action Bar */}
            <div className="flex items-center space-x-4">
              <Link
                href="/admin"
                className={`hidden sm:inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider transition-all duration-200 ${pathname.startsWith("/admin")
                    ? "bg-primary text-white"
                    : "bg-accent-pink/50 text-primary-dark hover:bg-accent-pink"
                  }`}
              >
                Admin Area
              </Link>

              {/* Shopping Cart Trigger */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-foreground/80 hover:text-primary transition-colors duration-200"
                aria-label="Shopping Cart"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                  />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white ring-2 ring-background animate-bounce">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-foreground/80 hover:text-primary transition-colors"
                aria-label="Toggle Menu"
              >
                {isMobileMenuOpen ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Panel */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border-custom/50 bg-background/95 backdrop-blur-md px-4 py-4 space-y-3 shadow-lg">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-base font-medium tracking-wide ${pathname === link.path
                    ? "bg-accent-pink/40 text-primary-dark font-semibold"
                    : "text-foreground/80 hover:bg-accent-pink/10 hover:text-primary"
                  }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-2 border-t border-border-custom/50 flex flex-col gap-2">
              <Link
                href="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-center px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold tracking-wider hover:bg-primary-hover transition-colors"
              >
                Admin Area
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Cart Slider Overlay */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity" onClick={() => setIsCartOpen(false)} />

          <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
            <div className="w-screen max-w-md transform transition-all duration-300 ease-in-out">
              <div className="flex h-full flex-col overflow-y-scroll bg-background shadow-2xl border-l border-border-custom">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border-custom px-4 py-6 sm:px-6">
                  <h2 className="text-lg font-serif font-bold text-primary-dark">Your Fancy Cart</h2>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="rounded-md text-muted-custom hover:text-primary transition-colors p-1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2.0"
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                  {cartItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                      <div className="p-4 bg-accent-pink/20 rounded-full text-primary animate-sparkle-pulse">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="w-10 h-10"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                          />
                        </svg>
                      </div>
                      <p className="text-muted-custom font-medium">Your cart is feeling light!</p>
                      <button
                        onClick={() => setIsCartOpen(false)}
                        className="text-sm text-primary hover:text-primary-hover font-semibold transition-colors underline underline-offset-4"
                      >
                        Start shopping
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {cartItems.map((item, idx) => (
                        <div key={`${item.id}-${item.size}`} className="flex border-b border-border-custom/50 pb-4">
                          {/* Image */}
                          <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-border-custom bg-accent-mint/30 flex items-center justify-center text-xs text-muted-custom font-semibold">
                            {/* Simple dynamic representation of image */}
                            <span className="text-[10px] text-center px-1 font-serif text-primary-dark">
                              {item.name}
                            </span>
                          </div>

                          {/* Details */}
                          <div className="ml-4 flex flex-1 flex-col">
                            <div>
                              <div className="flex justify-between text-sm font-medium">
                                <h3 className="text-foreground font-semibold line-clamp-1">{item.name}</h3>
                                <p className="ml-4 text-primary-dark font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                              </div>
                              <p className="mt-1 text-xs text-muted-custom">Size: {item.size}</p>
                            </div>
                            <div className="flex flex-1 items-end justify-between text-xs">
                              {/* Quantity Adjusters */}
                              <div className="flex items-center border border-border-custom rounded-full bg-accent-mint/20 overflow-hidden">
                                <button
                                  onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                                  className="px-2.5 py-1 text-muted-custom hover:text-primary transition-colors hover:bg-accent-pink/30 font-bold"
                                >
                                  -
                                </button>
                                <span className="px-2 text-foreground font-semibold">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                                  className="px-2.5 py-1 text-muted-custom hover:text-primary transition-colors hover:bg-accent-pink/30 font-bold"
                                >
                                  +
                                </button>
                              </div>

                              <div className="flex">
                                <button
                                  onClick={() => removeFromCart(item.id, item.size)}
                                  className="font-medium text-primary hover:text-primary-hover transition-colors underline"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                {cartItems.length > 0 && (
                  <div className="border-t border-border-custom bg-accent-pink/10 px-4 py-6 sm:px-6">
                    <div className="flex justify-between text-base font-semibold text-foreground">
                      <p>Subtotal</p>
                      <p className="text-primary-dark font-bold">${cartTotal.toFixed(2)}</p>
                    </div>
                    <p className="mt-1 text-xs text-muted-custom">Shipping and tax calculated at checkout.</p>
                    <div className="mt-6">
                      <Link
                        href="/cart"
                        onClick={() => setIsCartOpen(false)}
                        className="flex items-center justify-center rounded-lg bg-primary hover:bg-primary-hover py-3 text-sm font-semibold tracking-wide text-white transition-all duration-200 shadow-md shine-sweep"
                      >
                        Checkout Details
                      </Link>
                    </div>
                    <div className="mt-4 flex justify-center text-center text-xs">
                      <p>
                        or{" "}
                        <button
                          type="button"
                          className="font-medium text-primary hover:text-primary-hover transition-colors underline"
                          onClick={() => setIsCartOpen(false)}
                        >
                          Continue Shopping
                          <span aria-hidden="true"> &rarr;</span>
                        </button>
                      </p>
                    </div>
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
