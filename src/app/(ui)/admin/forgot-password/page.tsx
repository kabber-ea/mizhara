import ForgotPasswordForm from "@/ui/components/ForgotPasswordForm";
import Link from "next/link";

export default function AdminForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <ForgotPasswordForm
        role="admin"
        backHref="/"
        backLabel="Back to store"
        loginHref="/admin/login"
      />
    </div>
  );
}
