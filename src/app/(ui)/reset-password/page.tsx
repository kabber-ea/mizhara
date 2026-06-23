"use client";

import Link from "next/link";
import Navbar from "@/ui/components/Navbar";
import Footer from "@/ui/components/Footer";
import ResetPasswordForm from "@/ui/components/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <ResetPasswordForm role="customer" loginHref="/login" />
      </main>
      <Footer />
    </div>
  );
}
