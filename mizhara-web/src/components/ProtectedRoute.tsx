import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import { loginUrl } from "@/lib/auth-url";

export function CustomerRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="p-8 text-xs text-muted-custom">Loading...</div>;
  if (!user || user.role !== "customer") {
    return <Navigate to={loginUrl(location.pathname)} replace />;
  }
  return <>{children}</>;
}

export function GuestOnlyStore({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user?.role === "admin") return <Navigate to="/admin" replace />;
  return <>{children}</>;
}
