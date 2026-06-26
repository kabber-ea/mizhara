import { useState, Suspense } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api, apiErrorMessage } from "@/lib/api";
import { forgotPasswordUrl, loginUrl } from "@/lib/auth-url";

function ResetPasswordContent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!token) {
      setError("Invalid reset link. Request a new one.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post<{ message: string }>("/api/auth/reset-password", {
        token,
        password,
      });
      setMessage(data.message);
      setTimeout(() => {
        navigate(loginUrl());
      }, 2000);
    } catch (err) {
      setError(apiErrorMessage(err, "Failed to reset password"));
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="w-full max-w-md p-8 bg-white border border-border-custom rounded-3xl shadow-lg text-center space-y-4">
        <p className="text-sm text-rose-600 font-semibold">Invalid or missing reset token.</p>
        <Link to={forgotPasswordUrl()} className="text-primary text-xs font-semibold underline">
          Request a new reset link
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md p-8 bg-white border border-border-custom rounded-3xl shadow-lg space-y-6">
      <div className="text-center space-y-2">
        <h1 className="font-serif text-2xl font-bold text-primary-dark">Change Password</h1>
        <p className="text-xs text-muted-custom">Choose a new password for your account</p>
      </div>

      {error && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">{error}</div>}
      {message && <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl">{message}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-primary-dark uppercase mb-1">New Password</label>
          <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2.5 border border-border-custom rounded-xl text-xs" />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-primary-dark uppercase mb-1">Confirm Password</label>
          <input type="password" required minLength={6} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-2.5 border border-border-custom rounded-xl text-xs" />
        </div>
        <button type="submit" disabled={loading || !!message} className="w-full py-3 bg-primary text-white text-xs font-bold uppercase rounded-xl disabled:opacity-60 cursor-pointer">
          {loading ? "Saving..." : "Update Password"}
        </button>
      </form>

      <p className="text-center text-[10px] text-muted-custom">
        <Link to={loginUrl()} className="text-primary font-semibold hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordForm() {
  return (
    <Suspense fallback={<div className="text-xs text-muted-custom">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
