import { Outlet } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function StoreLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
}
