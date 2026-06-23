import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  env: {
    NEXT_PUBLIC_ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    NEXT_PUBLIC_ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    NEXT_PUBLIC_CUSTOMER_EMAIL: process.env.CUSTOMER_EMAIL,
    NEXT_PUBLIC_CUSTOMER_PASSWORD: process.env.CUSTOMER_PASSWORD,
    NEXT_PUBLIC_CUSTOMER_PHONE: process.env.CUSTOMER_PHONE,
  },
};

export default nextConfig;
