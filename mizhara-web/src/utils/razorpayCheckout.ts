declare global {
  interface Window {
    Razorpay: new (options: RazorpayCheckoutOptions) => RazorpayCheckoutInstance;
  }
}

type RazorpayCheckoutInstance = {
  open: () => void;
  on: (event: "payment.failed", handler: (response: RazorpayFailedResponse) => void) => void;
};

type RazorpayCheckoutOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  handler: (response: RazorpayHandlerResponse) => void;
  prefill?: { name?: string; email?: string; contact?: string };
  notes?: Record<string, string>;
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
};

type RazorpayFailedResponse = {
  error?: { description?: string; reason?: string };
};

export type PaymentSession = {
  key: string;
  amount: number;
  currency: string;
  razorpayOrderId: string;
  orderId: string;
};

export type RazorpayHandlerResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type OpenRazorpayCheckoutOptions = {
  session: PaymentSession;
  contact: { name: string; email: string; phone: string };
  onSuccess: (response: RazorpayHandlerResponse) => void | Promise<void>;
  onDismiss?: () => void;
  onFailure?: (message: string) => void;
};

const RAZORPAY_THEME_COLOR = "#9a7358";

function ensureRazorpay() {
  if (!window.Razorpay) {
    throw new Error("Razorpay script not loaded. Check your connection.");
  }
}

export function openRazorpayCheckout({
  session,
  contact,
  onSuccess,
  onDismiss,
  onFailure,
}: OpenRazorpayCheckoutOptions) {
  ensureRazorpay();

  const rzp = new window.Razorpay({
    key: session.key,
    amount: session.amount,
    currency: session.currency,
    name: "Mizhara",
    description: "Jewelry & ornaments",
    order_id: session.razorpayOrderId,
    prefill: {
      name: contact.name,
      email: contact.email,
      contact: contact.phone.replace(/\s/g, ""),
    },
    notes: { orderId: session.orderId },
    theme: { color: RAZORPAY_THEME_COLOR },
    handler: (response) => {
      void onSuccess(response);
    },
    modal: {
      ondismiss: onDismiss,
    },
  });

  rzp.on("payment.failed", (response) => {
    const message =
      response.error?.description || response.error?.reason || "Payment failed. Please try again.";
    onFailure?.(message);
  });

  rzp.open();
}
