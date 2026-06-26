import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api, isAxiosError } from "@/lib/api";

export type AuthUser = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: "admin" | "customer";
};

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  refresh: () => Promise<AuthUser | null>;
  logout: (redirectTo?: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async (): Promise<AuthUser | null> => {
    try {
      const { data } = await api.get<{ user: AuthUser | null }>("/api/auth/me");
      const nextUser = data.user ?? null;
      setUser(nextUser);
      return nextUser;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const logout = async (redirectTo = "/login") => {
    try {
      await api.post("/api/auth/logout");
    } catch (error) {
      if (!isAxiosError(error)) throw error;
    }
    setUser(null);
    window.location.href = redirectTo;
  };

  return (
    <AuthContext.Provider value={{ user, loading, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
