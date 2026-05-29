"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type UserRole = "ADMIN_MANAGER" | "STOREKEEPER" | string;

export interface User {
  id: string;
  email: string;
  role: UserRole;
}

export interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdminManager: boolean;
  isStorekeeper: boolean;
  hasRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    document.cookie = `token=${newToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    document.cookie = "token=; path=/; max-age=0; SameSite=Lax";
    if (typeof window !== "undefined") {
      window.location.href = "/admin/login";
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        document.cookie = `token=${storedToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      }
    }
  }, []);

  const role = user?.role ?? null;
  const isAdminManager = role === "ADMIN_MANAGER";
  const isStorekeeper = role === "STOREKEEPER";

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        login,
        logout,
        isAuthenticated: !!token,
        isAdminManager,
        isStorekeeper,
        hasRole: (expectedRole: UserRole) => role === expectedRole,
      }}
    >
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
