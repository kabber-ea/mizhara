"use client";

import Link from "next/link";
import Navbar from "@/ui/components/Navbar";
import Footer from "@/ui/components/Footer";
import ForgotPasswordForm from "@/ui/components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <ForgotPasswordForm
          role="customer"
          backHref="/signup"
          backLabel="Create an account"
          loginHref="/login"
        />
      </main>
      <Footer />
    </div>
  );
}
