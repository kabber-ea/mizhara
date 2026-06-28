import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "@/components/layout/AuthLayout";
import FieldError from "@/components/FieldError";
import FieldLabel from "@/components/FieldLabel";
import { useFieldErrors } from "@/hooks/use-field-errors";
import { api, apiErrorMessage } from "@/lib/api";
import { fieldInputClass } from "@/lib/form-styles";
import { isValidEmail } from "@/lib/form-validation";
import { loginUrl } from "@/lib/auth-url";

type ForgotField = "email" | "submit";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [devResetUrl, setDevResetUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const { fieldErrors, setFieldErrors, clearFieldError } = useFieldErrors<ForgotField>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setDevResetUrl("");

    const errors: Partial<Record<ForgotField, string>> = {};
    if (!email.trim() || !isValidEmail(email)) errors.email = "Enter a valid email address.";
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setLoading(true);

    try {
      const { data } = await api.post<{ message: string; devResetUrl?: string }>("/api/auth/forgot-password", {
        email,
      });
      setMessage(data.message);
      if (data.devResetUrl) setDevResetUrl(data.devResetUrl);
    } catch (err) {
      setFieldErrors({ submit: apiErrorMessage(err, "Something went wrong.") });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Forgot Password" subtitle="We'll email you a link to reset your password">
      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl">{message}</div>
      )}
      {devResetUrl && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl space-y-1">
          <p className="font-semibold">Dev mode — SMTP not configured</p>
          <a href={devResetUrl} className="text-primary font-semibold break-all underline">Open reset link</a>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <FieldLabel required className="block text-[10px] font-bold text-primary-dark uppercase mb-1">Email</FieldLabel>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearFieldError("email");
            }}
            placeholder="you@example.com"
            className={fieldInputClass(!!fieldErrors.email)}
          />
          <FieldError message={fieldErrors.email} />
        </div>
        <FieldError message={fieldErrors.submit} />
        <button type="submit" disabled={loading} className="w-full py-3 bg-primary text-white text-xs font-bold uppercase rounded-xl disabled:opacity-60 cursor-pointer">
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      <p className="text-center text-[10px] text-muted-custom">
        <Link to={loginUrl()} className="text-primary font-semibold hover:underline">
          Back to sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
