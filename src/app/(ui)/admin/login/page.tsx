"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/ui/components/AuthProvider";

export default function AdminLoginPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const demoEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "admin@mizhara.in";
  const demoPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "Admin@123";

  const fillDemo = () => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: email, password }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Invalid admin credentials.");
      return;
    }

    await refresh();
    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md p-8 bg-white border border-border-custom rounded-3xl shadow-lg space-y-6">
        <div className="text-center space-y-2">
          <span className="text-3xl">✨</span>
          <h1 className="font-serif text-2xl font-bold text-primary-dark">Admin Login</h1>
          <p className="text-xs text-muted-custom">Email &amp; password only</p>
        </div>

        {error && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-primary-dark uppercase mb-1">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@mizhara.in" className="w-full px-4 py-2.5 border border-border-custom rounded-xl text-xs" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[10px] font-bold text-primary-dark uppercase">Password</label>
              <Link href="/admin/forgot-password" className="text-[10px] text-primary font-semibold hover:underline">Forgot password?</Link>
            </div>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2.5 border border-border-custom rounded-xl text-xs" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 bg-primary text-white text-xs font-bold uppercase rounded-xl disabled:opacity-60">{loading ? "Signing in..." : "Sign In to Admin"}</button>
        </form>

        <div className="pt-4 border-t border-border-custom/50 text-center space-y-3">
          <p className="text-[10px] text-muted-custom uppercase font-bold">Demo Admin Account</p>
          <button type="button" onClick={fillDemo} className="w-full py-2.5 border border-dashed border-primary/40 text-primary text-xs font-semibold rounded-xl">Use demo email &amp; password</button>
          <Link href="/" className="block text-[10px] text-muted-custom hover:text-primary">&larr; Back to store</Link>
        </div>
      </div>
    </div>
  );
}
