"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/ui/components/Navbar";
import Footer from "@/ui/components/Footer";
import { useAuth } from "@/ui/components/AuthProvider";

type SignInMode = "email" | "phone";

export default function SignUpPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [mode, setMode] = useState<SignInMode>("email");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email: mode === "email" ? email : undefined,
        phone: mode === "phone" ? phone : undefined,
        password,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Sign up failed");
      setLoading(false);
      return;
    }

    const identifier = mode === "email" ? email : phone;
    const loginRes = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });

    setLoading(false);

    if (!loginRes.ok) {
      router.push("/login");
      return;
    }

    await refresh();
    router.push("/products");
    router.refresh();
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md p-8 bg-white border border-border-custom rounded-3xl shadow-lg space-y-6">
          <div className="text-center space-y-2">
            <h1 className="font-serif text-2xl font-bold text-primary-dark">Sign Up</h1>
            <p className="text-xs text-muted-custom">Create your Mizhara account with email or mobile</p>
          </div>

          <div className="flex rounded-xl border border-border-custom overflow-hidden">
            <button type="button" onClick={() => setMode("email")} className={`flex-1 py-2 text-xs font-bold ${mode === "email" ? "bg-primary text-white" : "bg-white text-foreground"}`}>Email</button>
            <button type="button" onClick={() => setMode("phone")} className={`flex-1 py-2 text-xs font-bold ${mode === "phone" ? "bg-primary text-white" : "bg-white text-foreground"}`}>Mobile</button>
          </div>

          {error && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-primary-dark uppercase mb-1">Full Name</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2.5 border border-border-custom rounded-xl text-xs" />
            </div>
            {mode === "email" ? (
              <div>
                <label className="block text-[10px] font-bold text-primary-dark uppercase mb-1">Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2.5 border border-border-custom rounded-xl text-xs" />
              </div>
            ) : (
              <div>
                <label className="block text-[10px] font-bold text-primary-dark uppercase mb-1">Mobile</label>
                <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9876543210" className="w-full px-4 py-2.5 border border-border-custom rounded-xl text-xs" />
              </div>
            )}
            <div>
              <label className="block text-[10px] font-bold text-primary-dark uppercase mb-1">Password</label>
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2.5 border border-border-custom rounded-xl text-xs" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-primary-dark uppercase mb-1">Confirm Password</label>
              <input type="password" required minLength={6} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-2.5 border border-border-custom rounded-xl text-xs" />
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 bg-primary text-white text-xs font-bold uppercase rounded-xl disabled:opacity-60">
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <p className="text-center text-[10px] text-muted-custom">
            Already have an account? <Link href="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
