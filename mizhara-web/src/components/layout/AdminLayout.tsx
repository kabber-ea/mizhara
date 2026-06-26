import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import { loginUrl } from "@/lib/auth-url";
import Sidebar from "@/components/layout/Sidebar";

export default function AdminLayout() {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-8 text-xs text-muted-custom">Loading...</div>;
  if (!user || user.role !== "admin") {
    return <Navigate to={loginUrl()} replace />;
  }

  return (
    <div className="min-h-screen bg-accent-mint/10">
      <Sidebar />
      <div className="lg:pl-60">
        <main className="min-h-screen p-4 sm:p-6 lg:p-8 admin-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
