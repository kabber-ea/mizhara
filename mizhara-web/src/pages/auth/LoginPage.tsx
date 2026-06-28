import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout from "@/components/layout/AuthLayout";
import FieldError from "@/components/FieldError";
import FieldLabel from "@/components/FieldLabel";
import { useAuth } from "@/providers/AuthProvider";
import { useFieldErrors } from "@/hooks/use-field-errors";
import { DEMO_ACCOUNTS, maskPassword } from "@/lib/demo-credentials";
import { api, apiErrorMessage } from "@/lib/api";
import { fieldInputClass } from "@/lib/form-styles";
import { isValidEmail } from "@/lib/form-validation";
import { forgotPasswordUrl, resolveAuthRedirect, signupUrl } from "@/lib/auth-url";

type LoginField = "identifier" | "password" | "submit";

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading, refresh } = useAuth();
  const redirectTo = resolveAuthRedirect(searchParams);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { fieldErrors, setFieldErrors, clearFieldError } = useFieldErrors<LoginField>();

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
    setFieldErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Partial<Record<LoginField, string>> = {};
    if (!identifier.trim() || !isValidEmail(identifier)) errors.identifier = "Enter a valid email address.";
    if (!password) errors.password = "Password is required.";
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setSubmitting(true);
    try {
      const { data } = await api.post<{ user?: { role?: string } }>("/api/auth/login", {
        identifier,
        password,
      });
      await finishLogin(data.user?.role);
    } catch (err) {
      setFieldErrors({ submit: apiErrorMessage(err, "Invalid credentials. Try a demo account below.") });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || user) {
    return <div className="p-8 text-xs text-muted-custom text-center">Loading...</div>;
  }

  return (
    <AuthLayout title="Sign In" subtitle="Welcome back to Mizhara">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <FieldLabel htmlFor="login-email" required className="block text-[10px] font-bold text-primary-dark uppercase mb-1">
            Email
          </FieldLabel>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            value={identifier}
            onChange={(e) => {
              setIdentifier(e.target.value);
              clearFieldError("identifier");
            }}
            className={fieldInputClass(!!fieldErrors.identifier)}
          />
          <FieldError message={fieldErrors.identifier} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <FieldLabel htmlFor="login-password" required className="block text-[10px] font-bold text-primary-dark uppercase">
              Password
            </FieldLabel>
            <Link to={forgotPasswordUrl()} className="text-[10px] text-primary font-semibold hover:underline">
              Forgot password?
            </Link>
          </div>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              clearFieldError("password");
            }}
            className={fieldInputClass(!!fieldErrors.password)}
          />
          <FieldError message={fieldErrors.password} />
        </div>
        <FieldError message={fieldErrors.submit} />
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
    </AuthLayout>
  );
}
