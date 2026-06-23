import ResetPasswordForm from "@/ui/components/ResetPasswordForm";

export default function AdminResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <ResetPasswordForm role="admin" loginHref="/admin/login" />
    </div>
  );
}
