import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import { loginUrl } from "@/lib/auth-url";
import { useCart } from "@/providers/CartProvider";
import FieldError from "@/components/FieldError";
import FieldLabel from "@/components/FieldLabel";
import { useFieldErrors } from "@/hooks/use-field-errors";
import { formatINR } from "@/lib/format";
import { api, apiErrorMessage } from "@/lib/api";
import { fieldInputClass } from "@/lib/form-styles";
import { isValidEmail, isValidPhone, isValidPincode } from "@/lib/form-validation";
import type { CustomerProfile, SavedAddress } from "@/types/account";
import { getDefaultSavedAddress } from "@/types/account";
import type { OfferPreview } from "@/types/offer";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export default function CartPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlCode = searchParams.get("code")?.trim().toUpperCase() ?? "";
  const { cartItems, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const [step, setStep] = useState<"cart" | "shipping" | "payment" | "success">("cart");
  const [orderId, setOrderId] = useState("");
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [couponError, setCouponError] = useState("");
  const [offerPreview, setOfferPreview] = useState<OfferPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const [shippingForm, setShippingForm] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
  });
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const { fieldErrors: shippingErrors, setFieldErrors: setShippingErrors, clearFieldError: clearShippingError } =
    useFieldErrors<"name" | "email" | "address" | "city" | "state" | "pincode" | "phone">();

  useEffect(() => {
    if (urlCode) {
      setCouponInput(urlCode);
      setAppliedCoupon(urlCode);
    }
  }, [urlCode]);

  useEffect(() => {
    if ((!user || user.role !== "customer") && step !== "cart" && step !== "success") {
      setStep("cart");
    }
  }, [user, step]);

  useEffect(() => {
    if (!user || user.role !== "customer") return;

    api
      .get<CustomerProfile>("/api/account/profile")
      .then(({ data: profile }) => {
        const addresses = profile.savedAddresses ?? [];
        setSavedAddresses(addresses);
        const defaultAddr = getDefaultSavedAddress(addresses);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
        }
        setShippingForm((prev) => ({
          name: profile.name ?? prev.name,
          email: profile.email ?? prev.email,
          phone: profile.phone ?? prev.phone,
          address: defaultAddr?.address ?? profile.savedAddress?.address ?? prev.address,
          city: defaultAddr?.city ?? profile.savedAddress?.city ?? prev.city,
          state: defaultAddr?.state ?? profile.savedAddress?.state ?? prev.state,
          pincode: defaultAddr?.pincode ?? profile.savedAddress?.pincode ?? prev.pincode,
        }));
      })
      .catch(() => undefined);
  }, [user]);

  useEffect(() => {
    if (cartItems.length === 0) {
      setOfferPreview(null);
      return;
    }
    setPreviewLoading(true);
    api
      .post<OfferPreview>("/api/offers/preview", {
        items: cartItems.map((item) => ({ productId: item.id, quantity: item.quantity })),
        offerCode: appliedCoupon || undefined,
      })
      .then(({ data }) => {
        setOfferPreview(data);
        if (appliedCoupon && data.discountAmount === 0) {
          setCouponError("This code doesn't apply to your bag.");
        } else {
          setCouponError("");
        }
      })
      .catch(() => setOfferPreview(null))
      .finally(() => setPreviewLoading(false));
  }, [cartItems, appliedCoupon]);

  const subtotal = offerPreview?.subtotal ?? cartTotal;
  const discount = offerPreview?.discountAmount ?? 0;
  const orderTotal = offerPreview?.total ?? cartTotal;

  const handleApplyCoupon = () => {
    setCouponError("");
    if (!couponInput.trim()) {
      setAppliedCoupon("");
      return;
    }
    setAppliedCoupon(couponInput.trim().toUpperCase());
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon("");
    setCouponInput("");
    setCouponError("");
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingForm((prev) => ({ ...prev, [name]: value }));
    clearShippingError(name as keyof typeof shippingForm);
    if (name !== "name" && name !== "email" && name !== "phone") {
      setSelectedAddressId("");
    }
  };

  const applySavedAddress = (addr: SavedAddress) => {
    setSelectedAddressId(addr.id);
    setShippingForm((prev) => ({
      ...prev,
      address: addr.address,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
    }));
    setShippingErrors({});
  };

  const handleProceedToCheckout = () => {
    if (!user || user.role !== "customer") {
      navigate(loginUrl("/cart"));
      return;
    }
    setStep("shipping");
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.role !== "customer") {
      navigate(loginUrl("/cart"));
      return;
    }

    const errors: Partial<Record<keyof typeof shippingForm, string>> = {};
    if (!shippingForm.name.trim()) errors.name = "Full name is required.";
    if (!shippingForm.email.trim() || !isValidEmail(shippingForm.email)) {
      errors.email = "Enter a valid email address.";
    }
    if (!shippingForm.address.trim()) errors.address = "Address is required.";
    if (!shippingForm.city.trim()) errors.city = "City is required.";
    if (!shippingForm.state.trim()) errors.state = "State is required.";
    if (!shippingForm.pincode.trim() || !isValidPincode(shippingForm.pincode)) {
      errors.pincode = "Enter a valid 6-digit pincode.";
    }
    if (!shippingForm.phone.trim() || !isValidPhone(shippingForm.phone)) {
      errors.phone = "Enter a valid phone number.";
    }

    if (Object.keys(errors).length > 0) {
      setShippingErrors(errors);
      return;
    }

    setShippingErrors({});
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
        size: "Standard",
        image: item.image,
      }));

      const { data } = await api.post<{
        key: string;
        amount: number;
        currency: string;
        razorpayOrderId: string;
      }>("/api/payment", {
        items,
        shippingAddress: shippingForm,
        subtotal,
        total: orderTotal,
        discountAmount: discount,
        offerId: appliedCoupon ? "" : offerPreview?.offerId ?? "",
        offerCode: appliedCoupon,
      });

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
        theme: { color: "#3c342e" },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const { data: verifyData } = await api.put<{ orderNumber: string }>("/api/payment", {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            setOrderId(verifyData.orderNumber);
            clearCart();
            setStep("success");
            setPaying(false);
          } catch (verifyError) {
            setError(apiErrorMessage(verifyError, "Payment verification failed"));
            setPaying(false);
          }
        },
        modal: {
          ondismiss: () => setPaying(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: unknown) {
      setError(apiErrorMessage(err, "Payment failed"));
      setPaying(false);
    }
  };

  return (
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
                <Link to="/products" className="inline-block px-6 py-2.5 bg-primary text-white text-xs font-semibold rounded-xl">Start Shopping</Link>
              </div>
            ) : (
              <>
                <div className="lg:col-span-2 space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex p-4 bg-white border border-border-custom rounded-2xl items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="relative h-16 w-16 rounded-xl border border-border-custom overflow-hidden bg-accent-pink/10">
                          {item.image && (
                            <img src={item.image} alt={item.name} className="object-cover w-full h-full object-cover" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold">{item.name}</h3>
                          <button onClick={() => removeFromCart(item.id)} className="text-[10px] text-primary underline pt-1">Remove</button>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center border border-border-custom rounded-full overflow-hidden">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2.5 py-1 font-bold">-</button>
                          <span className="px-2 text-xs font-bold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.maxStock}
                            className="px-2.5 py-1 font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            +
                          </button>
                        </div>
                        <p className="text-sm font-bold text-primary-dark min-w-[90px] text-right">{formatINR(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="lg:col-span-1">
                  <div className="p-6 bg-white border border-border-custom rounded-2xl space-y-4">
                    <h3 className="font-serif text-base font-bold text-primary-dark border-b pb-3">Order Summary</h3>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase text-muted-custom">Promo Code</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          placeholder="Enter code"
                          className="flex-1 px-3 py-2 border border-border-custom rounded-xl text-xs uppercase"
                        />
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          className="px-3 py-2 bg-primary-dark text-white text-[10px] font-bold uppercase rounded-xl"
                        >
                          Apply
                        </button>
                      </div>
                      {appliedCoupon && (
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-primary font-semibold">{appliedCoupon} applied</span>
                          <button type="button" onClick={handleRemoveCoupon} className="text-muted-custom underline">Remove</button>
                        </div>
                      )}
                      {couponError && <p className="text-[10px] text-rose-600">{couponError}</p>}
                      <p className="text-[10px] text-muted-custom leading-relaxed">
                        One offer per order. A coupon replaces any automatic deal.
                      </p>
                    </div>

                    {offerPreview && discount > 0 && (
                      <div className="p-3 bg-accent-pink/30 border border-border-custom rounded-xl text-[10px]">
                        <p className="font-bold text-primary-dark">{offerPreview.offerName}</p>
                        <p className="text-muted-custom mt-0.5">{offerPreview.offerLabel}</p>
                      </div>
                    )}

                    <div className="flex justify-between text-xs"><span>Subtotal</span><span className="font-semibold">{formatINR(subtotal)}</span></div>
                    {discount > 0 && (
                      <div className="flex justify-between text-xs text-emerald-700">
                        <span>Discount</span>
                        <span className="font-semibold">−{formatINR(discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xs"><span>Shipping</span><span className="text-emerald-600 font-semibold">Free</span></div>
                    <div className="flex justify-between text-sm font-extrabold border-t pt-3">
                      <span>Total</span>
                      <span className="text-primary-dark">{previewLoading ? "…" : formatINR(orderTotal)}</span>
                    </div>
                    <button type="button" onClick={handleProceedToCheckout} className="w-full py-3 bg-primary text-white text-xs font-bold uppercase rounded-xl shine-sweep">
                      {user?.role === "customer" ? "Proceed to Shipping" : "Sign in to Checkout"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {step === "shipping" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <form onSubmit={handleShippingSubmit} noValidate className="p-6 bg-white border border-border-custom rounded-2xl space-y-4">
                <h3 className="font-serif text-base font-bold text-primary-dark border-b pb-3">Shipping Details (India)</h3>

                {savedAddresses.length > 0 && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase mb-2">Saved Addresses</label>
                    <div className="flex flex-wrap gap-2">
                      {savedAddresses.map((addr) => (
                        <button
                          key={addr.id}
                          type="button"
                          onClick={() => applySavedAddress(addr)}
                          className={`px-3 py-2 rounded-xl border text-left text-[10px] font-semibold transition-colors ${
                            selectedAddressId === addr.id
                              ? "border-primary bg-accent-pink/20 text-primary-dark"
                              : "border-border-custom text-muted-custom hover:border-primary/40"
                          }`}
                        >
                          {addr.label?.trim() || "Address"}
                          {addr.isDefault && <span className="ml-1 text-primary">· Default</span>}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-custom mt-2">
                      Pick a saved address or edit the fields below.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <FieldLabel required>Full Name</FieldLabel>
                    <input type="text" name="name" value={shippingForm.name} onChange={handleFormChange} className={fieldInputClass(!!shippingErrors.name)} />
                    <FieldError message={shippingErrors.name} />
                  </div>
                  <div>
                    <FieldLabel required>Email</FieldLabel>
                    <input type="email" name="email" value={shippingForm.email} onChange={handleFormChange} className={fieldInputClass(!!shippingErrors.email)} />
                    <FieldError message={shippingErrors.email} />
                  </div>
                </div>
                <div>
                  <FieldLabel required>Address</FieldLabel>
                  <input type="text" name="address" value={shippingForm.address} onChange={handleFormChange} className={fieldInputClass(!!shippingErrors.address)} />
                  <FieldError message={shippingErrors.address} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <FieldLabel required>City</FieldLabel>
                    <input type="text" name="city" value={shippingForm.city} onChange={handleFormChange} className={fieldInputClass(!!shippingErrors.city)} />
                    <FieldError message={shippingErrors.city} />
                  </div>
                  <div>
                    <FieldLabel required>State</FieldLabel>
                    <input type="text" name="state" value={shippingForm.state} onChange={handleFormChange} placeholder="Maharashtra" className={fieldInputClass(!!shippingErrors.state)} />
                    <FieldError message={shippingErrors.state} />
                  </div>
                  <div>
                    <FieldLabel required>PIN Code</FieldLabel>
                    <input type="text" name="pincode" inputMode="numeric" value={shippingForm.pincode} onChange={handleFormChange} placeholder="400001" className={fieldInputClass(!!shippingErrors.pincode)} />
                    <FieldError message={shippingErrors.pincode} />
                  </div>
                </div>
                <div>
                  <FieldLabel required>Phone</FieldLabel>
                  <input type="tel" name="phone" value={shippingForm.phone} onChange={handleFormChange} placeholder="+91 98765 43210" className={fieldInputClass(!!shippingErrors.phone)} />
                  <FieldError message={shippingErrors.phone} />
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setStep("cart")} className="px-6 py-2.5 border border-border-custom text-xs font-semibold rounded-xl">Back</button>
                  <button type="submit" className="flex-grow py-2.5 bg-primary text-white text-xs font-bold uppercase rounded-xl shine-sweep">Continue to Payment</button>
                </div>
              </form>
            </div>
            <div className="p-6 bg-white border border-border-custom rounded-2xl">
              <h3 className="font-serif text-base font-bold mb-3">Total: {formatINR(orderTotal)}</h3>
              {discount > 0 && (
                <p className="text-xs text-emerald-700 mb-1">You save {formatINR(discount)}</p>
              )}
              <p className="text-xs text-muted-custom">All prices in Indian Rupees (INR)</p>
            </div>
          </div>
        )}

        {step === "payment" && (
          <div className="max-w-lg mx-auto p-8 bg-white border border-border-custom rounded-2xl space-y-6 text-center">
            <h3 className="font-serif text-xl font-bold text-primary-dark">Pay with Razorpay</h3>
            <p className="text-xs text-muted-custom">Secure UPI, cards, netbanking — all in INR</p>
            <p className="text-2xl font-extrabold text-primary-dark">{formatINR(orderTotal)}</p>
            {discount > 0 && <p className="text-xs text-emerald-700">Includes {formatINR(discount)} savings</p>}
            {error && <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl">{error}</div>}
            <button onClick={handleRazorpayPayment} disabled={paying} className="w-full py-3 bg-primary text-white text-xs font-bold uppercase rounded-xl shine-sweep disabled:opacity-60">
              {paying ? "Opening Razorpay..." : `Pay ${formatINR(orderTotal)}`}
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
            <Link to="/products" className="inline-block px-8 py-3 bg-primary text-white text-xs font-bold uppercase rounded-xl">Continue Shopping</Link>
          </div>
        )}
    </main>
  );
}
