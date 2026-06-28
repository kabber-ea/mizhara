import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout from "@/components/layout/AuthLayout";
import FieldError from "@/components/FieldError";
import FieldLabel from "@/components/FieldLabel";
import { useAuth } from "@/providers/AuthProvider";
import { useFieldErrors } from "@/hooks/use-field-errors";
import { api, apiErrorMessage } from "@/lib/api";
import { fieldInputClass } from "@/lib/form-styles";
import { isValidEmail } from "@/lib/form-validation";
import { loginUrl, resolveAuthRedirect } from "@/lib/auth-url";

type SignupField = "name" | "email" | "password" | "confirmPassword" | "submit";

export default function SignupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading, refresh } = useAuth();
  const redirectTo = resolveAuthRedirect(searchParams);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { fieldErrors, setFieldErrors, clearFieldError } = useFieldErrors<SignupField>();

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
    const errors: Partial<Record<SignupField, string>> = {};
    if (!name.trim()) errors.name = "Full name is required.";
    if (!email.trim() || !isValidEmail(email)) errors.email = "Enter a valid email address.";
    if (!password) errors.password = "Password is required.";
    else if (password.length < 6) errors.password = "Password must be at least 6 characters.";
    if (!confirmPassword) errors.confirmPassword = "Confirm your password.";
    else if (password !== confirmPassword) errors.confirmPassword = "Passwords do not match.";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setSubmitting(true);
    try {
      await api.post("/api/auth/register", { name, email, password });
      await api.post("/api/auth/login", { identifier: email, password });
      await refresh();
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setFieldErrors({ submit: apiErrorMessage(err, "Sign up failed.") });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || user) {
    return <div className="p-8 text-xs text-muted-custom text-center">Loading...</div>;
  }

  return (
    <AuthLayout title="Create Account" subtitle="Join Mizhara for a sparkly shopping experience">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <FieldLabel required className="block text-[10px] font-bold text-primary-dark uppercase mb-1">Full Name</FieldLabel>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              clearFieldError("name");
            }}
            className={fieldInputClass(!!fieldErrors.name)}
          />
          <FieldError message={fieldErrors.name} />
        </div>
        <div>
          <FieldLabel required className="block text-[10px] font-bold text-primary-dark uppercase mb-1">Email</FieldLabel>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearFieldError("email");
            }}
            className={fieldInputClass(!!fieldErrors.email)}
          />
          <FieldError message={fieldErrors.email} />
        </div>
        <div>
          <FieldLabel required className="block text-[10px] font-bold text-primary-dark uppercase mb-1">Password</FieldLabel>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              clearFieldError("password");
              if (confirmPassword) clearFieldError("confirmPassword");
            }}
            className={fieldInputClass(!!fieldErrors.password)}
          />
          <FieldError message={fieldErrors.password} />
        </div>
        <div>
          <FieldLabel required className="block text-[10px] font-bold text-primary-dark uppercase mb-1">Confirm Password</FieldLabel>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              clearFieldError("confirmPassword");
            }}
            className={fieldInputClass(!!fieldErrors.confirmPassword)}
          />
          <FieldError message={fieldErrors.confirmPassword} />
        </div>
        <FieldError message={fieldErrors.submit} />
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
    </AuthLayout>
  );
}
