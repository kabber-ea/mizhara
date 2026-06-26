import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthShell from "@/components/auth/AuthShell";
import { useAuth } from "@/components/AuthProvider";
import { DEMO_ACCOUNTS, maskPassword } from "@/lib/demo-credentials";
import { api, apiErrorMessage } from "@/lib/api";
import { forgotPasswordUrl, resolveAuthRedirect, signupUrl } from "@/lib/auth-url";

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading, refresh } = useAuth();
  const redirectTo = resolveAuthRedirect(searchParams);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
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

  const finishLogin = async (loginRole?: string) => {
    const sessionUser = await refresh();
    const role = sessionUser?.role ?? loginRole ?? "customer";
    if (role === "admin") {
      navigate("/admin", { replace: true });
      return;
    }
    navigate(redirectTo, { replace: true });
  };

  const fillDemo = (email: string, pwd: string) => {
    setIdentifier(email);
    setPassword(pwd);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const { data } = await api.post<{ user?: { role?: string } }>("/api/auth/login", {
        identifier,
        password,
      });
      await finishLogin(data.user?.role);
    } catch (err) {
      setError(apiErrorMessage(err, "Invalid credentials. Try a demo account below."));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || user) {
    return <div className="p-8 text-xs text-muted-custom text-center">Loading...</div>;
  }

  return (
    <AuthShell title="Sign In" subtitle="Welcome back to Mizhara">
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="login-email" className="block text-[10px] font-bold text-primary-dark uppercase mb-1">Email</label>
          <input
            id="login-email"
            type="email"
            required
            autoComplete="email"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full px-4 py-2.5 border border-border-custom rounded-xl text-xs"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="login-password" className="block text-[10px] font-bold text-primary-dark uppercase">Password</label>
            <Link to={forgotPasswordUrl()} className="text-[10px] text-primary font-semibold hover:underline">
              Forgot password?
            </Link>
          </div>
          <input
            id="login-password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 border border-border-custom rounded-xl text-xs"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-primary text-white text-xs font-bold uppercase rounded-xl disabled:opacity-60 cursor-pointer"
        >
          {submitting ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className="space-y-2 pt-2 border-t border-border-custom/50">
        <p className="text-[10px] text-muted-custom uppercase font-bold text-center tracking-wider">Demo Accounts</p>
        <button
          type="button"
          onClick={() => fillDemo(DEMO_ACCOUNTS.customer.email, DEMO_ACCOUNTS.customer.password)}
          className="w-full text-left p-2.5 border border-border-custom rounded-lg hover:border-primary/40 hover:bg-accent-pink/5 transition-colors cursor-pointer"
        >
          <p className="text-[10px] font-bold text-primary-dark uppercase">Customer</p>
          <p className="text-[11px] text-foreground mt-0.5">{DEMO_ACCOUNTS.customer.email}</p>
          <p className="text-[10px] text-muted-custom">Password: {maskPassword(DEMO_ACCOUNTS.customer.password)}</p>
        </button>
        <button
          type="button"
          onClick={() => fillDemo(DEMO_ACCOUNTS.admin.email, DEMO_ACCOUNTS.admin.password)}
          className="w-full text-left p-2.5 border border-border-custom rounded-lg hover:border-primary/40 hover:bg-accent-pink/5 transition-colors cursor-pointer"
        >
          <p className="text-[10px] font-bold text-primary-dark uppercase">Admin</p>
          <p className="text-[11px] text-foreground mt-0.5">{DEMO_ACCOUNTS.admin.email}</p>
          <p className="text-[10px] text-muted-custom">Password: {maskPassword(DEMO_ACCOUNTS.admin.password)}</p>
        </button>
      </div>

      <div className="space-y-3 text-center text-[10px] text-muted-custom">
        <p>
          New here?{" "}
          <Link to={signupUrl(redirectTo !== "/" ? redirectTo : undefined)} className="text-primary font-semibold hover:underline">
            Create account
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
