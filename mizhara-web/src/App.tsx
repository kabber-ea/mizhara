import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AuthProvider from "@/providers/AuthProvider";
import CartProvider from "@/providers/CartProvider";
import { CustomerRoute, GuestOnlyStore } from "@/components/ProtectedRoute";
import AdminLayout from "@/components/layout/AdminLayout";
import StoreLayout from "@/components/layout/StoreLayout";
import HomePage from "@/pages/home";
import ShopPage from "@/pages/shop";
import ProductDetailPage from "@/pages/product-detail";
import CartPage from "@/pages/cart";
import AccountPage from "@/pages/account";
import LoginPage from "@/pages/auth/login";
import SignupPage from "@/pages/auth/signup";
import ForgotPasswordPage from "@/pages/auth/forgot-password";
import ResetPasswordPage from "@/pages/reset-password";
import DashboardPage from "@/pages/dashboard";
import CatalogPage from "@/pages/catalog";
import OrdersPage from "@/pages/orders";
import CustomersPage from "@/pages/customers";
import OffersPage from "@/pages/offers";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            <Route element={<StoreLayout />}>
              <Route path="/" element={<GuestOnlyStore><HomePage /></GuestOnlyStore>} />
              <Route path="/products" element={<GuestOnlyStore><ShopPage /></GuestOnlyStore>} />
              <Route path="/products/:id" element={<GuestOnlyStore><ProductDetailPage /></GuestOnlyStore>} />
              <Route path="/cart" element={<GuestOnlyStore><CartPage /></GuestOnlyStore>} />
              <Route path="/account" element={<CustomerRoute><AccountPage /></CustomerRoute>} />
            </Route>

            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="catalog" element={<CatalogPage />} />
              <Route path="offers" element={<OffersPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="customers" element={<CustomersPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
