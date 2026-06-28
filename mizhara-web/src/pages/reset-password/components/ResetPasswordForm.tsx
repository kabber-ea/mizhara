import { useState, Suspense } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import FieldError from "@/components/FieldError";
import FieldLabel from "@/components/FieldLabel";
import { useFieldErrors } from "@/hooks/use-field-errors";
import { api, apiErrorMessage } from "@/lib/api";
import { fieldInputClass } from "@/lib/form-styles";
import { forgotPasswordUrl, loginUrl } from "@/lib/auth-url";

type ResetField = "password" | "confirmPassword" | "submit";

function ResetPasswordContent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { fieldErrors, setFieldErrors, clearFieldError } = useFieldErrors<ResetField>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!token) {
      setFieldErrors({ submit: "Invalid reset link. Request a new one." });
      return;
    }

    const errors: Partial<Record<ResetField, string>> = {};
    if (!password) errors.password = "Password is required.";
    else if (password.length < 6) errors.password = "Password must be at least 6 characters.";
    if (!confirmPassword) errors.confirmPassword = "Confirm your password.";
    else if (password !== confirmPassword) errors.confirmPassword = "Passwords do not match.";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
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
      setFieldErrors({ submit: apiErrorMessage(err, "Failed to reset password.") });
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

      {message && <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl">{message}</div>}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <FieldLabel required className="block text-[10px] font-bold text-primary-dark uppercase mb-1">New Password</FieldLabel>
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
