"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/app/components/CartProvider";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export default function CartPage() {
  const { cartItems, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();

  // Checkout flow state: "cart" | "shipping" | "payment" | "success"
  const [step, setStep] = useState<"cart" | "shipping" | "payment" | "success">("cart");
  const [orderId, setOrderId] = useState("");

  // Form values
  const [shippingForm, setShippingForm] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    zipCode: "",
    phone: ""
  });

  const [paymentForm, setPaymentForm] = useState({
    cardNumber: "",
    expiry: "",
    cvv: ""
  });

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("payment");
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const generatedId = `MIZ-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderId(generatedId);
    clearCart();
    setStep("success");
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-grow max-w-5xl w-full mx-auto px-4 py-10">
        {/* Step Indicator Header (Hide on Success) */}
        {step !== "success" && (
          <div className="mb-10">
            <h1 className="font-serif text-3xl font-bold text-center text-primary-dark mb-6">Checkout Checkout</h1>

            <div className="flex items-center justify-center max-w-md mx-auto">
              <div className="flex items-center">
                <span className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${step === "cart" ? "bg-primary text-white" : "bg-primary/20 text-primary"
                  }`}>1</span>
                <span className="ml-2 text-xs font-semibold text-foreground/80 hidden sm:inline">Bag</span>
              </div>
              <span className="flex-grow h-0.5 bg-border-custom mx-4" />
              <div className="flex items-center">
                <span className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${step === "shipping" ? "bg-primary text-white" : step === "payment" ? "bg-primary/20 text-primary" : "bg-border-custom text-muted-custom"
                  }`}>2</span>
                <span className="ml-2 text-xs font-semibold text-foreground/80 hidden sm:inline">Shipping</span>
              </div>
              <span className="flex-grow h-0.5 bg-border-custom mx-4" />
              <div className="flex items-center">
                <span className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${step === "payment" ? "bg-primary text-white" : "bg-border-custom text-muted-custom"
                  }`}>3</span>
                <span className="ml-2 text-xs font-semibold text-foreground/80 hidden sm:inline">Payment</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 1: Bag Overview */}
        {step === "cart" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {cartItems.length === 0 ? (
              <div className="lg:col-span-3 text-center py-20 bg-white border border-border-custom rounded-2xl space-y-4">
                <span className="text-5xl animate-bounce">👜</span>
                <h3 className="font-serif text-lg font-bold text-primary-dark">Your Bag is Empty</h3>
                <p className="text-xs text-muted-custom max-w-xs mx-auto">
                  Looks like you haven't added any fancy ornaments to your shopping bag yet.
                </p>
                <Link
                  href="/products"
                  className="inline-block px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl shadow-md transition-colors"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <>
                {/* List Items */}
                <div className="lg:col-span-2 space-y-4">
                  {cartItems.map((item) => (
                    <div key={`${item.id}-${item.size}`} className="flex p-4 bg-white border border-border-custom rounded-2xl items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="h-16 w-16 bg-accent-pink/15 rounded-xl border border-border-custom flex items-center justify-center text-[8px] font-bold text-primary-dark px-1 text-center font-serif leading-tight">
                          {item.name}
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold tracking-wide text-foreground">{item.name}</h3>
                          <p className="text-xs text-muted-custom">Size: {item.size}</p>
                          <button
                            onClick={() => removeFromCart(item.id, item.size)}
                            className="text-[10px] text-primary hover:text-primary-hover transition-colors underline pt-1 font-medium block"
                          >
                            Remove Item
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6">
                        {/* Quantity controls */}
                        <div className="flex items-center border border-border-custom rounded-full bg-accent-mint/10 overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                            className="px-2.5 py-1 text-muted-custom hover:text-primary hover:bg-accent-pink/20 font-bold"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-bold text-foreground">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                            className="px-2.5 py-1 text-muted-custom hover:text-primary hover:bg-accent-pink/20 font-bold"
                          >
                            +
                          </button>
                        </div>
                        {/* Price */}
                        <p className="text-sm font-bold text-primary-dark min-w-[70px] text-right">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total Summary */}
                <div className="lg:col-span-1">
                  <div className="p-6 bg-white border border-border-custom rounded-2xl space-y-4">
                    <h3 className="font-serif text-base font-bold text-primary-dark border-b border-border-custom pb-3">Order Summary</h3>

                    <div className="flex justify-between text-xs text-muted-custom">
                      <span>Subtotal</span>
                      <span className="font-semibold text-foreground">${cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-custom">
                      <span>Shipping</span>
                      <span className="text-emerald-600 font-semibold uppercase">Free</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-custom border-b border-border-custom pb-3">
                      <span>Tax</span>
                      <span className="font-semibold text-foreground">$0.00</span>
                    </div>

                    <div className="flex justify-between text-sm font-extrabold text-foreground pt-1">
                      <span>Total Amount</span>
                      <span className="text-primary-dark">${cartTotal.toFixed(2)}</span>
                    </div>

                    <button
                      onClick={() => setStep("shipping")}
                      className="w-full py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shine-sweep text-center"
                    >
                      Proceed to Shipping
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* STEP 2: Shipping Form */}
        {step === "shipping" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <form onSubmit={handleShippingSubmit} className="p-6 bg-white border border-border-custom rounded-2xl space-y-4">
                <h3 className="font-serif text-base font-bold text-primary-dark border-b border-border-custom pb-3">Shipping Details</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-primary-dark uppercase mb-1">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={shippingForm.name}
                      onChange={handleFormChange}
                      placeholder="Jane Doe"
                      className="w-full px-4 py-2.5 border border-border-custom rounded-xl text-xs bg-background/50 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-primary-dark uppercase mb-1">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={shippingForm.email}
                      onChange={handleFormChange}
                      placeholder="jane@example.com"
                      className="w-full px-4 py-2.5 border border-border-custom rounded-xl text-xs bg-background/50 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-primary-dark uppercase mb-1">Street Address</label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={shippingForm.address}
                    onChange={handleFormChange}
                    placeholder="123 Sparkle Lane"
                    className="w-full px-4 py-2.5 border border-border-custom rounded-xl text-xs bg-background/50 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-primary-dark uppercase mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={shippingForm.city}
                      onChange={handleFormChange}
                      placeholder="Shinetown"
                      className="w-full px-4 py-2.5 border border-border-custom rounded-xl text-xs bg-background/50 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-primary-dark uppercase mb-1">Zip / Postal Code</label>
                    <input
                      type="text"
                      name="zipCode"
                      required
                      value={shippingForm.zipCode}
                      onChange={handleFormChange}
                      placeholder="10023"
                      className="w-full px-4 py-2.5 border border-border-custom rounded-xl text-xs bg-background/50 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-primary-dark uppercase mb-1">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={shippingForm.phone}
                      onChange={handleFormChange}
                      placeholder="+1 (555) 123-4567"
                      className="w-full px-4 py-2.5 border border-border-custom rounded-xl text-xs bg-background/50 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-border-custom/50">
                  <button
                    type="button"
                    onClick={() => setStep("cart")}
                    className="px-6 py-2.5 border border-border-custom text-foreground text-xs font-semibold rounded-xl hover:bg-accent-mint/10"
                  >
                    Back to Bag
                  </button>
                  <button
                    type="submit"
                    className="flex-grow py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shine-sweep text-center"
                  >
                    Continue to Payment
                  </button>
                </div>
              </form>
            </div>

            {/* Total Review Sidebar */}
            <div className="lg:col-span-1">
              <div className="p-6 bg-white border border-border-custom rounded-2xl space-y-4">
                <h3 className="font-serif text-base font-bold text-primary-dark border-b border-border-custom pb-3">Review Order</h3>
                <div className="max-h-60 overflow-y-auto space-y-3 pr-2">
                  {cartItems.map(item => (
                    <div key={`${item.id}-${item.size}`} className="flex justify-between text-xs">
                      <span className="text-muted-custom font-medium line-clamp-1">{item.name} x {item.quantity}</span>
                      <span className="font-bold text-primary-dark">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border-custom pt-3 flex justify-between text-sm font-extrabold text-foreground">
                  <span>Total</span>
                  <span className="text-primary-dark">${cartTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Payment Form */}
        {step === "payment" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <form onSubmit={handlePaymentSubmit} className="p-6 bg-white border border-border-custom rounded-2xl space-y-4">
                <h3 className="font-serif text-base font-bold text-primary-dark border-b border-border-custom pb-3">Payment Options</h3>

                {/* Mock Card Form */}
                <div className="p-4 bg-accent-pink/10 border border-primary/20 rounded-xl space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-bold text-primary-dark uppercase">
                    <span>Credit / Debit Card</span>
                    <span className="text-lg">💳</span>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-muted-custom uppercase mb-1">Card Number</label>
                    <input
                      type="text"
                      name="cardNumber"
                      required
                      value={paymentForm.cardNumber}
                      onChange={handlePaymentChange}
                      placeholder="4000 1234 5678 9010"
                      maxLength={19}
                      className="w-full px-4 py-2 border border-border-custom rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-bold text-muted-custom uppercase mb-1">Expiration</label>
                      <input
                        type="text"
                        name="expiry"
                        required
                        value={paymentForm.expiry}
                        onChange={handlePaymentChange}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full px-4 py-2 border border-border-custom rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-muted-custom uppercase mb-1">CVV Code</label>
                      <input
                        type="password"
                        name="cvv"
                        required
                        value={paymentForm.cvv}
                        onChange={handlePaymentChange}
                        placeholder="•••"
                        maxLength={4}
                        className="w-full px-4 py-2 border border-border-custom rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-border-custom/50">
                  <button
                    type="button"
                    onClick={() => setStep("shipping")}
                    className="px-6 py-2.5 border border-border-custom text-foreground text-xs font-semibold rounded-xl hover:bg-accent-mint/10"
                  >
                    Back to Shipping
                  </button>
                  <button
                    type="submit"
                    className="flex-grow py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shine-sweep text-center"
                  >
                    Place Mock Order (${cartTotal.toFixed(2)})
                  </button>
                </div>
              </form>
            </div>

            {/* Total Review Sidebar */}
            <div className="lg:col-span-1">
              <div className="p-6 bg-white border border-border-custom rounded-2xl space-y-4">
                <h3 className="font-serif text-base font-bold text-primary-dark border-b border-border-custom pb-3">Shipment to</h3>
                <div className="text-xs text-muted-custom space-y-1">
                  <p className="font-bold text-foreground">{shippingForm.name}</p>
                  <p>{shippingForm.email}</p>
                  <p>{shippingForm.address}</p>
                  <p>{shippingForm.city}, {shippingForm.zipCode}</p>
                  <p>Phone: {shippingForm.phone}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Success state */}
        {step === "success" && (
          <div className="max-w-md mx-auto text-center py-16 px-6 bg-white border border-border-custom rounded-3xl shadow-xl space-y-6">
            <span className="text-6xl block animate-bounce">✨🎉✨</span>
            <h2 className="font-serif text-2xl font-bold text-primary-dark">Your Order is Confirmed!</h2>
            <p className="text-xs text-muted-custom max-w-sm mx-auto leading-relaxed">
              Thank you for shopping at Mizhara. Your mock order was placed successfully. Get ready to sparkle!
            </p>

            {/* Info details */}
            <div className="p-4 bg-accent-pink/15 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold text-muted-custom uppercase">Order Number</span>
              <p className="text-lg font-bold text-primary-dark tracking-wider">{orderId}</p>
            </div>

            <div className="text-xs text-muted-custom space-y-1 max-w-xs mx-auto">
              <p>We've sent a mock confirmation email to:</p>
              <p className="font-bold text-foreground">{shippingForm.email}</p>
            </div>

            <div className="pt-4">
              <Link
                href="/products"
                onClick={() => setStep("cart")}
                className="inline-block px-8 py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shine-sweep"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
