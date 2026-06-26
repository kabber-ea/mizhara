import { useState } from "react";
import { Link } from "react-router-dom";
import AuthShell from "@/components/auth/AuthShell";
import { api, apiErrorMessage } from "@/lib/api";
import { loginUrl } from "@/lib/auth-url";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [devResetUrl, setDevResetUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setDevResetUrl("");
    setLoading(true);

    try {
      const { data } = await api.post<{ message: string; devResetUrl?: string }>("/api/auth/forgot-password", {
        email,
      });
      setMessage(data.message);
      if (data.devResetUrl) setDevResetUrl(data.devResetUrl);
    } catch (err) {
      setError(apiErrorMessage(err, "Something went wrong"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Forgot Password" subtitle="We'll email you a link to reset your password">
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">{error}</div>
      )}
      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl">{message}</div>
      )}
      {devResetUrl && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl space-y-1">
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
        <button type="submit" disabled={loading} className="w-full py-3 bg-primary text-white text-xs font-bold uppercase rounded-xl disabled:opacity-60 cursor-pointer">
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      <p className="text-center text-[10px] text-muted-custom">
        <Link to={loginUrl()} className="text-primary font-semibold hover:underline">
          Back to sign in
        </Link>
      </p>
    </AuthShell>
  );
}
