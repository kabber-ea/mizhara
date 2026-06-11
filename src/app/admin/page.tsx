"use client";
import React, { useState, useEffect } from "react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import ProductForm from "@/app/admin/components/ProductForm";
import ProductList from "@/app/admin/components/ProductList";
import CategoryManager from "@/app/admin/components/CategoryManager";
export default function AdminPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    // Dashboard Tabs: "products" | "categories"
    const [activeTab, setActiveTab] = useState<"products" | "categories">("products");

    // Form visibility
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any | null>(null);

    // Reset message feedback
    const [resetMessage, setResetMessage] = useState("");
    const loadData = async () => {
        try {
            setLoading(true);
            const [productsRes, categoriesRes] = await Promise.all([
                fetch("/api/products"),
                fetch("/api/categories"),
            ]);
            if (productsRes.ok && categoriesRes.ok) {
                const pData = await productsRes.json();
                const cData = await categoriesRes.json();
                setProducts(pData);
                setCategories(cData);
            }
        } catch (e) {
            console.error("Failed to load admin stats", e);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadData();
    }, []);
    const handleEditClick = (product: any) => {
        setEditingProduct(product);
        setShowForm(true);
    };
    const handleFormSuccess = () => {
        setShowForm(false);
        setEditingProduct(null);
        loadData();
    };
    const handleResetDatabase = async () => {
        if (confirm("This will delete any custom products or categories you added and reset everything back to the original default seed data. Proceed?")) {
            try {
                const res = await fetch("/api/reset", { method: "POST" });
                if (res.ok) {
                    setResetMessage("Database reset successfully! Reloading data...");
                    await loadData();
                    setTimeout(() => setResetMessage(""), 4000);
                }
            } catch (e) {
                console.error("Failed to reset database", e);
            }
        }
    };
    // Stats
    const totalProducts = products.length;
    const featuredProductsCount = products.filter((p) => p.isFeatured).length;
    const totalCategories = categories.length;
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Navbar />
            <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Header Title & DB Reset */}
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border-custom/50 pb-6 mb-8 gap-4">
                    <div>
                        <h1 className="font-serif text-3xl font-bold text-primary-dark">Admin Dashboard</h1>
                        <p className="text-xs text-muted-custom">Manage your fancy ornaments catalog, add categories, and toggle featured products.</p>
                    </div>
                    <button
                        onClick={handleResetDatabase}
                        className="px-4 py-2 border border-dashed border-rose-300 hover:border-rose-500 text-rose-600 hover:text-rose-700 text-xs font-semibold rounded-xl transition-colors self-start"
                    >
                        Reset Database to Default Seed
                    </button>
                </div>
                {/* Action Feedbacks */}
                {resetMessage && (
                    <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl">
                        {resetMessage}
                    </div>
                )}
                {/* Statistics Widgets */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                    <div className="p-6 bg-white border border-border-custom rounded-2xl flex flex-col justify-between shadow-2xs">
                        <span className="text-[10px] font-bold text-muted-custom uppercase">Total Ornaments</span>
                        <div className="flex items-baseline justify-between mt-2">
                            <span className="text-3xl font-extrabold text-primary-dark">{totalProducts}</span>
                            <span className="text-xl">✨</span>
                        </div>
                    </div>
                    <div className="p-6 bg-white border border-border-custom rounded-2xl flex flex-col justify-between shadow-2xs">
                        <span className="text-[10px] font-bold text-muted-custom uppercase">Featured Gems</span>
                        <div className="flex items-baseline justify-between mt-2">
                            <span className="text-3xl font-extrabold text-primary-dark">{featuredProductsCount}</span>
                            <span className="text-xl text-accent-gold">★</span>
                        </div>
                    </div>
                    <div className="p-6 bg-white border border-border-custom rounded-2xl flex flex-col justify-between shadow-2xs">
                        <span className="text-[10px] font-bold text-muted-custom uppercase">Ornament Types</span>
                        <div className="flex items-baseline justify-between mt-2">
                            <span className="text-3xl font-extrabold text-primary-dark">{totalCategories}</span>
                            <span className="text-xl">💎</span>
                        </div>
                    </div>
                </div>
                {/* Dashboard Tabs & Action */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border-custom/50 mb-8 gap-4 pb-2">
                    {/* Tab togglers */}
                    <div className="flex gap-4">
                        <button
                            onClick={() => {
                                setActiveTab("products");
                                setShowForm(false);
                                setEditingProduct(null);
                            }}
                            className={`pb-2 border-b-2 text-xs font-bold tracking-wider uppercase transition-all ${activeTab === "products" && !showForm
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-custom hover:text-foreground"
                                }`}
                        >
                            Manage Ornaments
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab("categories");
                                setShowForm(false);
                                setEditingProduct(null);
                            }}
                            className={`pb-2 border-b-2 text-xs font-bold tracking-wider uppercase transition-all ${activeTab === "categories"
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-custom hover:text-foreground"
                                }`}
                        >
                            Manage Categories
                        </button>
                    </div>
                    {/* Add Product Button (only when in products list and not editing) */}
                    {activeTab === "products" && !showForm && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="px-5 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shine-sweep"
                        >
                            Add New Product
                        </button>
                    )}
                </div>
                {/* Loading details */}
                {loading && products.length === 0 ? (
                    <div className="text-center py-20 text-xs text-muted-custom">
                        Loading dashboard data...
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Show Form when Active */}
                        {showForm && activeTab === "products" && (
                            <ProductForm
                                categories={categories}
                                editingProduct={editingProduct}
                                onSuccess={handleFormSuccess}
                                onCancel={() => {
                                    setShowForm(false);
                                    setEditingProduct(null);
                                }}
                            />
                        )}
                        {/* Product List when Tab Active and form closed */}
                        {!showForm && activeTab === "products" && (
                            <ProductList
                                products={products}
                                onEdit={handleEditClick}
                                onRefresh={loadData}
                            />
                        )}
                        {/* Category manager */}
                        {activeTab === "categories" && (
                            <CategoryManager categories={categories} onRefresh={loadData} />
                        )}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
