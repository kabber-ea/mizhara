import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

export default function AdminShell() {
  return (
    <div className="min-h-screen bg-accent-mint/10">
      <AdminSidebar />
      <div className="lg:pl-60">
        <main className="min-h-screen p-4 sm:p-6 lg:p-8 admin-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
