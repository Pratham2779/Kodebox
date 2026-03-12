import React, { createContext, useContext, useEffect, useState } from "react";
import { tokenStorage } from "../lib/tokenStorage";
import { authService } from "../lib/authService";


export type User = {
  id: number;
  full_name: string;
  username: string;
  email: string;
  avatar_key: string | null;
  avatar_url?: string;
  role: "admin" | "user";
  phone_number: string;
  is_email_verified: boolean;
  razorpay_customer_id: string | null;
  plan_id: number;
  created_at: string;
  updated_at: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User | null) => void;
};



const AuthContext = createContext<AuthContextType | null>(null);


export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  async function fetchMe() {
    const res = await authService.me();
    const payload = res.data?.data;

    if (!payload?.user) {
      throw new Error("Failed to fetch user");
    }

    const userWithAvatar: User = {
      ...payload.user,
      avatar_url: payload.avatar_url,
    };

    setUser(userWithAvatar);
    setIsAuthenticated(true);
    return userWithAvatar;
  }

  useEffect(() => {
    let mounted = true;

    async function boot() {
      try {
        const token = tokenStorage.get();
        if (!token) {
          setLoading(false);
          return;
        }

        const res = await authService.refresh();
        const newToken = res.data?.data?.accessToken;
        if (!newToken) throw new Error("Refresh failed");

        tokenStorage.set(newToken);

        if (mounted) {
          await fetchMe();
        }
      } catch {
        tokenStorage.clear();
        if (mounted) {
          setUser(null);
          setIsAuthenticated(false);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    boot();
    return () => {
      mounted = false;
    };
  }, []);


  async function login(
    email: string,
    password: string,
    rememberMe: boolean
  ) {
    const res = await authService.login(email, password, rememberMe);
    const token = res.data?.data?.accessToken;
    if (!token) throw new Error("Login failed");

    tokenStorage.set(token);
    await fetchMe();
  }


  async function logout() {
    try {
      await authService.logout();
    } catch {

    } finally {
      tokenStorage.clear();
      setUser(null);
      setIsAuthenticated(false);
    }
  }


  function updateUser(user: User | null) {
    setUser(user);
    setIsAuthenticated(Boolean(user));
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
