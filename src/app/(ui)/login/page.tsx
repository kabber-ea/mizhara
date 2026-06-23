"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/ui/components/Navbar";
import Footer from "@/ui/components/Footer";
import { useAuth } from "@/ui/components/AuthProvider";

type SignInMode = "email" | "phone";

export default function CustomerLoginPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [mode, setMode] = useState<SignInMode>("email");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const demoEmail = process.env.NEXT_PUBLIC_CUSTOMER_EMAIL ?? "customer@mizhara.in";
  const demoPhone = process.env.NEXT_PUBLIC_CUSTOMER_PHONE ?? "9876543210";
  const demoPassword = process.env.NEXT_PUBLIC_CUSTOMER_PASSWORD ?? "Customer@123";

  const fillDemo = () => {
    setIdentifier(mode === "email" ? demoEmail : demoPhone);
    setPassword(demoPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });

    setLoading(false);

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Invalid credentials. Try the demo account below.");
      return;
    }

    await refresh();
    router.push(data.user?.role === "admin" ? "/admin" : "/products");
    router.refresh();
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md p-8 bg-white border border-border-custom rounded-3xl shadow-lg space-y-6">
          <div className="text-center space-y-2">
            <h1 className="font-serif text-2xl font-bold text-primary-dark">Welcome Back</h1>
            <p className="text-xs text-muted-custom">Sign in to shop Mizhara ornaments</p>
          </div>

          <div className="flex rounded-xl border border-border-custom overflow-hidden">
            <button type="button" onClick={() => setMode("email")} className={`flex-1 py-2 text-xs font-bold ${mode === "email" ? "bg-primary text-white" : "bg-white text-foreground"}`}>Email</button>
            <button type="button" onClick={() => setMode("phone")} className={`flex-1 py-2 text-xs font-bold ${mode === "phone" ? "bg-primary text-white" : "bg-white text-foreground"}`}>Mobile</button>
          </div>

          {error && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-primary-dark uppercase mb-1">{mode === "email" ? "Email Address" : "Mobile Number"}</label>
              <input type={mode === "email" ? "email" : "tel"} required value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder={mode === "email" ? "you@example.com" : "9876543210"} className="w-full px-4 py-2.5 border border-border-custom rounded-xl text-xs" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[10px] font-bold text-primary-dark uppercase">Password</label>
                <Link href="/forgot-password" className="text-[10px] text-primary font-semibold hover:underline">Forgot password?</Link>
              </div>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2.5 border border-border-custom rounded-xl text-xs" />
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 bg-primary text-white text-xs font-bold uppercase rounded-xl disabled:opacity-60">{loading ? "Signing in..." : "Sign In"}</button>
          </form>

          <div className="pt-4 border-t border-border-custom/50 text-center space-y-3">
            <p className="text-[10px] text-muted-custom uppercase font-bold">Demo Account</p>
            <button type="button" onClick={fillDemo} className="w-full py-2.5 border border-dashed border-primary/40 text-primary text-xs font-semibold rounded-xl">Use demo {mode === "email" ? "email" : "mobile"} &amp; password</button>
            <p className="text-[10px] text-muted-custom">
              New here? <Link href="/signup" className="text-primary font-semibold hover:underline">Sign up</Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
