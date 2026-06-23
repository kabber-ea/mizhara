"use client";

import { useState } from "react";
import Link from "next/link";

type ForgotPasswordProps = {
  role: "customer" | "admin";
  backHref: string;
  backLabel: string;
  loginHref: string;
};

export default function ForgotPasswordForm({
  role,
  backHref,
  backLabel,
  loginHref,
}: ForgotPasswordProps) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [devResetUrl, setDevResetUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setDevResetUrl("");
    setLoading(true);

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Something went wrong");
      return;
    }

    setMessage(data.message);
    if (data.devResetUrl) {
      setDevResetUrl(data.devResetUrl);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white border border-border-custom rounded-3xl shadow-lg space-y-6">
      <div className="text-center space-y-2">
        <h1 className="font-serif text-2xl font-bold text-primary-dark">Forgot Password</h1>
        <p className="text-xs text-muted-custom">Enter your email and we&apos;ll send a reset link</p>
      </div>

      {error && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">{error}</div>}
      {message && <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl">{message}</div>}

      {devResetUrl && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl space-y-2">
          <p className="font-semibold">Dev mode — SMTP not configured</p>
          <a href={devResetUrl} className="text-primary font-semibold break-all underline">Open reset link</a>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-primary-dark uppercase mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-2.5 border border-border-custom rounded-xl text-xs"
          />
        </div>
        <button type="submit" disabled={loading} className="w-full py-3 bg-primary text-white text-xs font-bold uppercase rounded-xl disabled:opacity-60">
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      <div className="text-center space-y-2 text-[10px] text-muted-custom">
        <Link href={loginHref} className="text-primary font-semibold hover:underline">Back to sign in</Link>
        <span className="block">
          <Link href={backHref} className="hover:text-primary">{backLabel}</Link>
        </span>
      </div>
    </div>
  );
}
