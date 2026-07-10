export const DEMO_ACCOUNTS = {
  customer: {
    email: import.meta.env.VITE_CUSTOMER_EMAIL || "customer@mizhara.in",
    password: import.meta.env.VITE_CUSTOMER_PASSWORD || "Customer@123",
  },
  admin: {
    email: import.meta.env.VITE_ADMIN_EMAIL || "admin@mizhara.in",
    password: import.meta.env.VITE_ADMIN_PASSWORD || "Admin@123",
  },
} as const;

export function maskPassword(password: string) {
  return "*".repeat(Math.max(password.length, 8));
}
