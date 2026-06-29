import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AuthProvider from "@/providers/AuthProvider";
import CartProvider from "@/providers/CartProvider";
import { CustomerRoute, GuestOnlyStore } from "@/components/ProtectedRoute";
import AdminLayout from "@/components/layout/AdminLayout";
import HomePage from "@/pages/home/HomePage";
import ShopPage from "@/pages/shop/ShopPage";
import ProductDetailPage from "@/pages/product-detail/ProductDetailPage";
import CartPage from "@/pages/cart/CartPage";
import AccountPage from "@/pages/account/AccountPage";
import LoginPage from "@/pages/auth/LoginPage";
import SignupPage from "@/pages/auth/SignupPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/reset-password/ResetPasswordPage";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import CatalogPage from "@/pages/catalog/CatalogPage";
import OrdersPage from "@/pages/orders/OrdersPage";
import CustomersPage from "@/pages/customers/CustomersPage";
import OffersPage from "@/pages/offers/OffersPage";

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

            <Route path="/" element={<GuestOnlyStore><HomePage /></GuestOnlyStore>} />
            <Route path="/products" element={<GuestOnlyStore><ShopPage /></GuestOnlyStore>} />
            <Route path="/products/:id" element={<GuestOnlyStore><ProductDetailPage /></GuestOnlyStore>} />
            <Route path="/cart" element={<GuestOnlyStore><CartPage /></GuestOnlyStore>} />
            <Route path="/account" element={<CustomerRoute><AccountPage /></CustomerRoute>} />

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
