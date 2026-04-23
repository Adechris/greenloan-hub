import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Role = "admin" | "officer" | "borrower";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: Role;
  state?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (email: string, _password: string, role: Role) => void;
  register: (data: Omit<AuthUser, "id"> & { password: string }) => void;
  logout: () => void;
  switchRole: (role: Role) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = "naijaloan_user";

const demoUsers: Record<Role, AuthUser> = {
  admin: { id: "u-admin", fullName: "Adaeze Okafor", email: "admin@naijaloan.ng", role: "admin", phone: "+234 803 000 0001" },
  officer: { id: "u-officer", fullName: "Tunde Bello", email: "officer@naijaloan.ng", role: "officer", phone: "+234 803 000 0002" },
  borrower: { id: "u-borrower", fullName: "Chiamaka Eze", email: "borrower@naijaloan.ng", role: "borrower", phone: "+234 803 000 0003", state: "Lagos" },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (raw) {
      try { setUser(JSON.parse(raw)); } catch { /* ignore */ }
    }
  }, []);

  const persist = (u: AuthUser | null) => {
    setUser(u);
    if (typeof window !== "undefined") {
      if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      else localStorage.removeItem(STORAGE_KEY);
    }
  };

  const login = (email: string, _password: string, role: Role) => {
    const base = demoUsers[role];
    persist({ ...base, email: email || base.email });
  };

  const register = (data: Omit<AuthUser, "id"> & { password: string }) => {
    const { password: _pw, ...rest } = data;
    void _pw;
    persist({ id: `u-${Date.now()}`, ...rest });
  };

  const logout = () => persist(null);
  const switchRole = (role: Role) => persist(demoUsers[role]);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
