import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`
  : "/api";

export type User = {
  id: number;
  firstName: string;
  email: string;
  emailVerified: boolean;
  walletSetupDone: boolean;
  plan: "free" | "premium";
  avatarUrl?: string | null;
  createdAt: string;
};

type AuthState = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
};

type AuthContextType = AuthState & {
  login: (email: string, password: string) => Promise<{ needsVerification?: boolean; needsWalletSetup?: boolean; error?: string }>;
  register: (firstName: string, email: string, password: string) => Promise<{ needsVerification?: boolean; error?: string }>;
  verifyEmail: (email: string, code: string) => Promise<{ needsWalletSetup?: boolean; error?: string }>;
  resendCode: (email: string) => Promise<void>;
  setupWallet: (lockAmount: number, period: string, goals: string[]) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User & { password?: string }>) => Promise<{ error?: string }>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

async function apiFetch(path: string, options: RequestInit = {}, token?: string | null) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  return res;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    const restore = async () => {
      try {
        const token = await AsyncStorage.getItem("auth_token");
        if (token) {
          const res = await apiFetch("/user/me", {}, token);
          if (res.ok) {
            const user = await res.json();
            setState({ user, token, isLoading: false, isAuthenticated: true });
            return;
          }
        }
      } catch {}
      setState(s => ({ ...s, isLoading: false }));
    };
    restore();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiFetch("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
    const data = await res.json();
    if (!res.ok) return { error: data.error || "Login failed" };
    await AsyncStorage.setItem("auth_token", data.token);
    setState({ user: data.user, token: data.token, isLoading: false, isAuthenticated: true });
    return { needsVerification: data.needsVerification, needsWalletSetup: data.needsWalletSetup };
  };

  const register = async (firstName: string, email: string, password: string) => {
    const res = await apiFetch("/auth/register", { method: "POST", body: JSON.stringify({ firstName, email, password }) });
    const data = await res.json();
    if (!res.ok) return { error: data.error || "Registration failed" };
    await AsyncStorage.setItem("auth_token", data.token);
    setState({ user: data.user, token: data.token, isLoading: false, isAuthenticated: true });
    return { needsVerification: data.needsVerification };
  };

  const verifyEmail = async (email: string, code: string) => {
    const res = await apiFetch("/auth/verify-email", { method: "POST", body: JSON.stringify({ email, code }) });
    const data = await res.json();
    if (!res.ok) return { error: data.error || "Invalid code" };
    await AsyncStorage.setItem("auth_token", data.token);
    setState({ user: data.user, token: data.token, isLoading: false, isAuthenticated: true });
    return { needsWalletSetup: data.needsWalletSetup };
  };

  const resendCode = async (email: string) => {
    await apiFetch("/auth/resend-code", { method: "POST", body: JSON.stringify({ email }) });
  };

  const setupWallet = async (lockAmount: number, period: string, goals: string[]) => {
    const res = await apiFetch("/user/setup-wallet", {
      method: "POST",
      body: JSON.stringify({ lockAmount, period, goals }),
    }, state.token);
    const data = await res.json();
    if (!res.ok) return { error: data.error || "Setup failed" };
    setState(s => ({ ...s, user: data }));
    return {};
  };

  const logout = async () => {
    await apiFetch("/auth/logout", { method: "POST" }, state.token);
    await AsyncStorage.removeItem("auth_token");
    setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
  };

  const updateUser = async (data: Partial<User & { password?: string }>) => {
    const res = await apiFetch("/user/me", { method: "PUT", body: JSON.stringify(data) }, state.token);
    const json = await res.json();
    if (!res.ok) return { error: json.error || "Update failed" };
    setState(s => ({ ...s, user: json }));
    return {};
  };

  const refreshUser = async () => {
    if (!state.token) return;
    const res = await apiFetch("/user/me", {}, state.token);
    if (res.ok) {
      const user = await res.json();
      setState(s => ({ ...s, user }));
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, verifyEmail, resendCode, setupWallet, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
