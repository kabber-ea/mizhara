"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { useAuth } from "@/ui/components/AuthProvider";
import { useCart } from "@/ui/components/CartProvider";
import Navbar from "@/ui/components/Navbar";
import Footer from "@/ui/components/Footer";
import { formatINR } from "@/lib/format";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export default function CartPage() {
  const { user } = useAuth();
  const { cartItems, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const [step, setStep] = useState<"cart" | "shipping" | "payment" | "success">("cart");
  const [orderId, setOrderId] = useState("");
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  const [shippingForm, setShippingForm] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
  });

  useEffect(() => {
    if (!user || user.role !== "customer") return;

    fetch("/api/account/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((profile) => {
        if (!profile) return;
        setShippingForm((prev) => ({
          name: profile.name ?? prev.name,
          email: profile.email ?? prev.email,
          phone: profile.phone ?? prev.phone,
          address: profile.savedAddress?.address ?? prev.address,
          city: profile.savedAddress?.city ?? prev.city,
          state: profile.savedAddress?.state ?? prev.state,
          pincode: profile.savedAddress?.pincode ?? prev.pincode,
        }));
      })
      .catch(() => undefined);
  }, [user]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("payment");
  };

  const handleRazorpayPayment = async () => {
    setError("");
    setPaying(true);

    try {
      const items = cartItems.map((item) => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        image: item.image,
      }));

      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          shippingAddress: shippingForm,
          subtotal: cartTotal,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payment setup failed");

      if (!window.Razorpay) {
        throw new Error("Razorpay script not loaded. Check your connection.");
      }

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "Mizhara",
        description: "Fancy Ornaments Order",
        order_id: data.razorpayOrderId,
        prefill: {
          name: shippingForm.name,
          email: shippingForm.email,
          contact: shippingForm.phone,
        },
        theme: { color: "#c9184a" },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          const verifyRes = await fetch("/api/payment", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }),
          });

          const verifyData = await verifyRes.json();
          if (!verifyRes.ok) {
            setError(verifyData.error || "Payment verification failed");
            setPaying(false);
            return;
          }

          setOrderId(verifyData.orderNumber);
          clearCart();
          setStep("success");
          setPaying(false);
        },
        modal: {
          ondismiss: () => setPaying(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Payment failed");
      setPaying(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <Navbar />

      <main className="flex-grow max-w-5xl w-full mx-auto px-4 py-10">
        {step !== "success" && (
          <div className="mb-10">
            <h1 className="font-serif text-3xl font-bold text-center text-primary-dark mb-6">Checkout</h1>
            <div className="flex items-center justify-center max-w-md mx-auto">
              {["Bag", "Shipping", "Payment"].map((label, i) => {
                const keys = ["cart", "shipping", "payment"] as const;
                const active = step === keys[i];
                const done = keys.indexOf(step) > i;
                return (
                  <React.Fragment key={label}>
                    {i > 0 && <span className="flex-grow h-0.5 bg-border-custom mx-4" />}
                    <div className="flex items-center">
                      <span className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${active || done ? "bg-primary text-white" : "bg-border-custom text-muted-custom"}`}>{i + 1}</span>
                      <span className="ml-2 text-xs font-semibold hidden sm:inline">{label}</span>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {step === "cart" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {cartItems.length === 0 ? (
              <div className="lg:col-span-3 text-center py-20 bg-white border border-border-custom rounded-2xl space-y-4">
                <span className="text-5xl">👜</span>
                <h3 className="font-serif text-lg font-bold text-primary-dark">Your Bag is Empty</h3>
                <Link href="/products" className="inline-block px-6 py-2.5 bg-primary text-white text-xs font-semibold rounded-xl">Start Shopping</Link>
              </div>
            ) : (
              <>
                <div className="lg:col-span-2 space-y-4">
                  {cartItems.map((item) => (
                    <div key={`${item.id}-${item.size}`} className="flex p-4 bg-white border border-border-custom rounded-2xl items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="relative h-16 w-16 rounded-xl border border-border-custom overflow-hidden bg-accent-pink/10">
                          {item.image && (
                            <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold">{item.name}</h3>
                          <p className="text-xs text-muted-custom">Size: {item.size}</p>
                          <button onClick={() => removeFromCart(item.id, item.size)} className="text-[10px] text-primary underline pt-1">Remove</button>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center border border-border-custom rounded-full overflow-hidden">
                          <button onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)} className="px-2.5 py-1 font-bold">-</button>
                          <span className="px-2 text-xs font-bold">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)} className="px-2.5 py-1 font-bold">+</button>
                        </div>
                        <p className="text-sm font-bold text-primary-dark min-w-[90px] text-right">{formatINR(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="lg:col-span-1">
                  <div className="p-6 bg-white border border-border-custom rounded-2xl space-y-4">
                    <h3 className="font-serif text-base font-bold text-primary-dark border-b pb-3">Order Summary</h3>
                    <div className="flex justify-between text-xs"><span>Subtotal</span><span className="font-semibold">{formatINR(cartTotal)}</span></div>
                    <div className="flex justify-between text-xs"><span>Shipping</span><span className="text-emerald-600 font-semibold">Free</span></div>
                    <div className="flex justify-between text-sm font-extrabold border-t pt-3"><span>Total</span><span className="text-primary-dark">{formatINR(cartTotal)}</span></div>
                    <button onClick={() => setStep("shipping")} className="w-full py-3 bg-primary text-white text-xs font-bold uppercase rounded-xl shine-sweep">Proceed to Shipping</button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {step === "shipping" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <form onSubmit={handleShippingSubmit} className="p-6 bg-white border border-border-custom rounded-2xl space-y-4">
                <h3 className="font-serif text-base font-bold text-primary-dark border-b pb-3">Shipping Details (India)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase mb-1">Full Name</label>
                    <input type="text" name="name" required value={shippingForm.name} onChange={handleFormChange} className="w-full px-4 py-2.5 border border-border-custom rounded-xl text-xs" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase mb-1">Email</label>
                    <input type="email" name="email" required value={shippingForm.email} onChange={handleFormChange} className="w-full px-4 py-2.5 border border-border-custom rounded-xl text-xs" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-1">Address</label>
                  <input type="text" name="address" required value={shippingForm.address} onChange={handleFormChange} className="w-full px-4 py-2.5 border border-border-custom rounded-xl text-xs" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase mb-1">City</label>
                    <input type="text" name="city" required value={shippingForm.city} onChange={handleFormChange} className="w-full px-4 py-2.5 border border-border-custom rounded-xl text-xs" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase mb-1">State</label>
                    <input type="text" name="state" required value={shippingForm.state} onChange={handleFormChange} placeholder="Maharashtra" className="w-full px-4 py-2.5 border border-border-custom rounded-xl text-xs" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase mb-1">PIN Code</label>
                    <input type="text" name="pincode" required pattern="[0-9]{6}" value={shippingForm.pincode} onChange={handleFormChange} placeholder="400001" className="w-full px-4 py-2.5 border border-border-custom rounded-xl text-xs" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-1">Phone</label>
                  <input type="tel" name="phone" required value={shippingForm.phone} onChange={handleFormChange} placeholder="+91 98765 43210" className="w-full px-4 py-2.5 border border-border-custom rounded-xl text-xs" />
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setStep("cart")} className="px-6 py-2.5 border border-border-custom text-xs font-semibold rounded-xl">Back</button>
                  <button type="submit" className="flex-grow py-2.5 bg-primary text-white text-xs font-bold uppercase rounded-xl shine-sweep">Continue to Payment</button>
                </div>
              </form>
            </div>
            <div className="p-6 bg-white border border-border-custom rounded-2xl">
              <h3 className="font-serif text-base font-bold mb-3">Total: {formatINR(cartTotal)}</h3>
              <p className="text-xs text-muted-custom">All prices in Indian Rupees (INR)</p>
            </div>
          </div>
        )}

        {step === "payment" && (
          <div className="max-w-lg mx-auto p-8 bg-white border border-border-custom rounded-2xl space-y-6 text-center">
            <h3 className="font-serif text-xl font-bold text-primary-dark">Pay with Razorpay</h3>
            <p className="text-xs text-muted-custom">Secure UPI, cards, netbanking — all in INR</p>
            <p className="text-2xl font-extrabold text-primary-dark">{formatINR(cartTotal)}</p>
            {error && <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl">{error}</div>}
            <button onClick={handleRazorpayPayment} disabled={paying} className="w-full py-3 bg-primary text-white text-xs font-bold uppercase rounded-xl shine-sweep disabled:opacity-60">
              {paying ? "Opening Razorpay..." : `Pay ${formatINR(cartTotal)}`}
            </button>
            <button type="button" onClick={() => setStep("shipping")} className="text-xs text-muted-custom hover:text-primary">Back to shipping</button>
          </div>
        )}

        {step === "success" && (
          <div className="max-w-md mx-auto text-center py-16 px-6 bg-white border border-border-custom rounded-3xl shadow-xl space-y-6">
            <span className="text-6xl block">✨🎉✨</span>
            <h2 className="font-serif text-2xl font-bold text-primary-dark">Order Confirmed!</h2>
            <p className="text-xs text-muted-custom">Thank you for shopping at Mizhara.</p>
            <div className="p-4 bg-accent-pink/15 rounded-2xl">
              <span className="text-[10px] font-bold text-muted-custom uppercase">Order Number</span>
              <p className="text-lg font-bold text-primary-dark">{orderId}</p>
            </div>
            <Link href="/products" className="inline-block px-8 py-3 bg-primary text-white text-xs font-bold uppercase rounded-xl">Continue Shopping</Link>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
