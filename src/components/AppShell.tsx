import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  LayoutDashboard, FileText, CreditCard, Bell, User, LogOut, Menu, X,
  Users, Settings, BarChart3, Package, ClipboardList, ShieldCheck,
} from "lucide-react";
import { useAuth, type Role } from "@/lib/auth";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navByRole: Record<Role, { to: string; label: string; icon: typeof LayoutDashboard }[]> = {
  borrower: [
    { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { to: "/apply", label: "Apply for Loan", icon: FileText },
    { to: "/loans", label: "My Loans", icon: CreditCard },
    { to: "/notifications", label: "Notifications", icon: Bell },
    { to: "/profile", label: "Profile", icon: User },
  ],
  officer: [
    { to: "/officer", label: "Dashboard", icon: LayoutDashboard },
    { to: "/officer/applications", label: "Applications", icon: ClipboardList },
    { to: "/notifications", label: "Notifications", icon: Bell },
    { to: "/profile", label: "Profile", icon: User },
  ],
  admin: [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/users", label: "Users", icon: Users },
    { to: "/admin/products", label: "Loan Products", icon: Package },
    { to: "/admin/reports", label: "Reports", icon: BarChart3 },
    { to: "/admin/settings", label: "Settings", icon: Settings },
    { to: "/notifications", label: "Notifications", icon: Bell },
    { to: "/profile", label: "Profile", icon: User },
  ],
};

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout, switchRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) {
    if (typeof window !== "undefined") navigate({ to: "/login" });
    return null;
  }

  const items = navByRole[user.role];

  const SidebarInner = (
    <div className="flex h-full flex-col">
      <div className="px-6 py-5 border-b border-sidebar-border">
        <Logo variant="light" />
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.to ||
            (item.to !== "/" && location.pathname.startsWith(item.to) && item.to.length > 1);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-gold"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 py-4 border-t border-sidebar-border space-y-2">
        <div className="px-3 py-2 text-xs text-sidebar-foreground/60 flex items-center gap-2">
          <ShieldCheck className="h-3 w-3" />
          Demo: switch role
        </div>
        <div className="grid grid-cols-3 gap-1 px-2">
          {(["borrower", "officer", "admin"] as Role[]).map((r) => (
            <button
              key={r}
              onClick={() => {
                switchRole(r);
                navigate({ to: r === "admin" ? "/admin" : r === "officer" ? "/officer" : "/dashboard" });
              }}
              className={cn(
                "rounded-md py-1.5 text-[11px] font-medium capitalize transition-colors",
                user.role === r
                  ? "bg-gold text-gold-foreground"
                  : "bg-sidebar-accent text-sidebar-foreground/80 hover:bg-sidebar-accent/70"
              )}
            >
              {r}
            </button>
          ))}
        </div>
        <button
          onClick={() => { logout(); navigate({ to: "/" }); }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent transition-colors"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 bg-sidebar text-sidebar-foreground">
        {SidebarInner}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-sidebar text-sidebar-foreground shadow-xl">
            {SidebarInner}
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-card/80 backdrop-blur px-4 lg:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <div className="flex-1 lg:hidden">
            <Logo />
          </div>
          <div className="hidden lg:block flex-1">
            <p className="text-sm text-muted-foreground">Welcome back,</p>
            <p className="text-sm font-semibold -mt-0.5">{user.fullName}</p>
          </div>
          <Link to="/notifications" className="relative p-2 rounded-md hover:bg-muted">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
          </Link>
          <div className="h-9 w-9 rounded-full grid place-items-center text-primary-foreground font-semibold text-sm"
               style={{ background: "var(--gradient-primary)" }}>
            {user.fullName.split(" ").map(n => n[0]).slice(0, 2).join("")}
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
