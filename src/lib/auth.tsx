import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, tokenStore } from "./api";

export type Role = "admin" | "officer" | "borrower";

export interface AuthUser {
  id: string | number;
  fullName: string;
  email: string;
  phone?: string;
  role: Role;
  state?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string, role: Role) => Promise<void>;
  register: (data: {
    fullName: string;
    email: string;
    phone?: string;
    password: string;
    bvn?: string;
    nin?: string;
    state?: string;
    employment?: string;
  }) => Promise<void>;
  logout: () => void;
  switchRole: (role: Role) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const USER_KEY = "naijaloan_user";

// Demo credentials seeded by backend/db/main.sql
const demoLogin: Record<Role, { email: string; password: string }> = {
  admin:    { email: "admin@naijaloan.ng",    password: "password123" },
  officer:  { email: "officer@naijaloan.ng",  password: "password123" },
  borrower: { email: "borrower@naijaloan.ng", password: "password123" },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = typeof window !== "undefined" ? localStorage.getItem(USER_KEY) : null;
    if (cached) {
      try { setUser(JSON.parse(cached)); } catch { /* ignore */ }
    }
    // Refresh from /me if we have a token
    if (tokenStore.get()) {
      api<{ user: AuthUser }>("/auth/me")
        .then((r) => persist(r.user))
        .catch(() => { tokenStore.clear(); persist(null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const persist = (u: AuthUser | null) => {
    setUser(u);
    if (typeof window === "undefined") return;
    if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
    else localStorage.removeItem(USER_KEY);
  };

  const login = async (email: string, password: string, role: Role) => {
    const res = await api<{ token: string; user: AuthUser }>("/auth/login", {
      method: "POST",
      body: { email, password, role },
      auth: false,
    });
    tokenStore.set(res.token);
    persist(res.user);
  };

  const register: AuthContextValue["register"] = async (data) => {
    const res = await api<{ token: string; user: AuthUser }>("/auth/register", {
      method: "POST",
      body: data,
      auth: false,
    });
    tokenStore.set(res.token);
    persist(res.user);
  };

  const logout = () => {
    tokenStore.clear();
    persist(null);
  };

  // Convenience for the demo role-switcher in the AppShell
  const switchRole = async (role: Role) => {
    const { email, password } = demoLogin[role];
    await login(email, password, role);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
