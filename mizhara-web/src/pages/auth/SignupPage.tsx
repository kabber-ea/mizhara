import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthShell from "@/components/auth/AuthShell";
import { useAuth } from "@/components/AuthProvider";
import { api, apiErrorMessage } from "@/lib/api";
import { loginUrl, resolveAuthRedirect } from "@/lib/auth-url";

export default function SignupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading, refresh } = useAuth();
  const redirectTo = resolveAuthRedirect(searchParams);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (user?.role === "admin") {
      navigate("/admin", { replace: true });
      return;
    }
    if (user?.role === "customer") {
      navigate(redirectTo, { replace: true });
    }
  }, [user, loading, navigate, redirectTo]);

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

    setSubmitting(true);
    try {
      await api.post("/api/auth/register", { name, email, password });
      await api.post("/api/auth/login", { identifier: email, password });
      await refresh();
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err, "Sign up failed"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || user) {
    return <div className="p-8 text-xs text-muted-custom text-center">Loading...</div>;
  }

  return (
    <AuthShell title="Create Account" subtitle="Join Mizhara for a sparkly shopping experience">
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-primary-dark uppercase mb-1">Full Name</label>
          <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2.5 border border-border-custom rounded-xl text-xs" />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-primary-dark uppercase mb-1">Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2.5 border border-border-custom rounded-xl text-xs" />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-primary-dark uppercase mb-1">Password</label>
          <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2.5 border border-border-custom rounded-xl text-xs" />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-primary-dark uppercase mb-1">Confirm Password</label>
          <input type="password" required minLength={6} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-2.5 border border-border-custom rounded-xl text-xs" />
        </div>
        <button type="submit" disabled={submitting} className="w-full py-3 bg-primary text-white text-xs font-bold uppercase rounded-xl disabled:opacity-60 cursor-pointer">
          {submitting ? "Creating..." : "Sign Up"}
        </button>
      </form>

      <div className="space-y-3 text-center text-[10px] text-muted-custom">
        <p>
          Already have an account?{" "}
          <Link to={loginUrl(redirectTo !== "/" ? redirectTo : undefined)} className="text-primary font-semibold hover:underline">
            Sign in
          </Link>
        </p>
        <button
          type="button"
          onClick={() => navigate(redirectTo)}
          className="w-full py-2.5 border border-border-custom text-xs font-semibold text-foreground rounded-xl hover:bg-accent-mint/20 transition-colors cursor-pointer"
        >
          Continue without signing in
        </button>
      </div>
    </AuthShell>
  );
}
