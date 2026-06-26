import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  quantity: number;
  maxStock: number;
}

export type AddToCartResult = { ok: true } | { ok: false; message: string };

interface CartProduct {
  id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  stockQuantity?: number;
  inStock?: boolean;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: CartProduct, quantity?: number) => AddToCartResult;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => AddToCartResult;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function getMaxStock(product: CartProduct): number {
  if (product.inStock === false) return 0;
  if (typeof product.stockQuantity === "number" && product.stockQuantity >= 0) {
    return product.stockQuantity;
  }
  return 99;
}

function normalizeLegacyCart(raw: unknown[]): CartItem[] {
  const merged = new Map<string, CartItem>();
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const item = entry as Record<string, unknown>;
    const id = String(item.id ?? "");
    if (!id) continue;
    const qty = Math.max(0, Number(item.quantity) || 0);
    const maxStock = Math.max(0, Number(item.maxStock ?? item.stockQuantity) || 99);
    const existing = merged.get(id);
    if (existing) {
      existing.quantity = Math.min(existing.quantity + qty, existing.maxStock);
    } else {
      merged.set(id, {
        id,
        name: String(item.name ?? "").replace(/\s*\([^)]*\)\s*$/, ""),
        price: Number(item.price) || 0,
        image: String(item.image ?? ""),
        category: String(item.category ?? ""),
        quantity: Math.min(qty, maxStock),
        maxStock,
      });
    }
  }
  return Array.from(merged.values()).filter((i) => i.quantity > 0);
}

export default function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const storedCart = localStorage.getItem("mizhara_cart");
    if (storedCart) {
      try {
        setCartItems(normalizeLegacyCart(JSON.parse(storedCart)));
      } catch (e) {
        console.error("Failed to parse cart data from localStorage", e);
      }
    }
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("mizhara_cart", JSON.stringify(cartItems));
    }
  }, [cartItems, isMounted]);

  const addToCart = (product: CartProduct, quantity = 1): AddToCartResult => {
    if (!product.images?.[0]) {
      return { ok: false, message: "This item is unavailable." };
    }

    const maxStock = getMaxStock(product);
    if (maxStock <= 0) {
      return { ok: false, message: "This item is out of stock." };
    }

    let result: AddToCartResult = { ok: true };

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.id === product.id);

      if (existingIndex > -1) {
        const existing = prevItems[existingIndex];
        const cappedMax = Math.min(existing.maxStock, maxStock);
        const newQty = Math.min(existing.quantity + quantity, cappedMax);

        if (newQty === existing.quantity) {
          result = { ok: false, message: "Maximum available quantity already in your bag." };
          return prevItems;
        }

        const newItems = [...prevItems];
        newItems[existingIndex] = {
          ...existing,
          quantity: newQty,
          maxStock: cappedMax,
          name: product.name,
          price: product.price,
          image: product.images[0],
        };
        return newItems;
      }

      const newQty = Math.min(quantity, maxStock);
      return [
        ...prevItems,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.images[0],
          category: product.category,
          quantity: newQty,
          maxStock,
        },
      ];
    });

    if (result.ok) setIsCartOpen(true);
    return result;
  };

  const removeFromCart = (id: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number): AddToCartResult => {
    if (quantity <= 0) {
      removeFromCart(id);
      return { ok: true };
    }

    let result: AddToCartResult = { ok: true };

    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id !== id) return item;
        const capped = Math.min(quantity, item.maxStock);
        if (capped < quantity) {
          result = { ok: false, message: "Only the available quantity can be added." };
        }
        return { ...item, quantity: capped };
      })
    );

    return result;
  };

  const clearCart = () => setCartItems([]);

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
