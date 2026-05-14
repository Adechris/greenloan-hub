import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth, type Role } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Briefcase, ShieldCheck, User } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Sign in — NaijaLoan" }] }),
});

const roleCards: { role: Role; icon: typeof User; label: string; desc: string }[] = [
  { role: "borrower", icon: User, label: "Borrower", desc: "Apply & repay" },
  { role: "officer", icon: Briefcase, label: "Loan Officer", desc: "Review applications" },
  { role: "admin", icon: ShieldCheck, label: "Admin", desc: "Full control" },
];

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("borrower");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password, role);
      toast.success(`Welcome back!`);
      navigate({ to: role === "admin" ? "/admin" : role === "officer" ? "/officer" : "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex flex-col justify-between p-10 text-primary-foreground relative overflow-hidden"
           style={{ background: "var(--gradient-hero)" }}>
        <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-gold/25 blur-3xl" />
        <Logo variant="light" />
        <div className="relative">
          <h2 className="text-4xl font-bold leading-tight">Lending made simple for every Nigerian.</h2>
          <p className="mt-4 text-primary-foreground/80 max-w-md">
            From Lagos to Kano — apply for loans, manage your portfolio, or oversee operations,
            all from one secure dashboard.
          </p>
        </div>
        <p className="text-xs text-primary-foreground/60 relative">Secured with bank-grade encryption</p>
      </div>

      <div className="flex items-center justify-center p-6 lg:p-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-6"><Logo /></div>
          <h1 className="text-3xl font-bold">Sign in</h1>
          <p className="mt-2 text-muted-foreground text-sm">Choose your role and access your dashboard.</p>

          <div className="mt-6 grid grid-cols-3 gap-2">
            {roleCards.map((r) => {
              const Icon = r.icon;
              const active = role === r.role;
              return (
                <button
                  key={r.role}
                  type="button"
                  onClick={() => setRole(r.role)}
                  className={`rounded-xl border-2 p-3 text-left transition-all ${
                    active ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                  }`}
                >
                  <Icon className={`h-4 w-4 mb-1.5 ${active ? "text-primary" : "text-muted-foreground"}`} />
                  <p className="text-xs font-semibold">{r.label}</p>
                  <p className="text-[10px] text-muted-foreground">{r.desc}</p>
                </button>
              );
            })}
          </div>

          <Card className="mt-5">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@example.com" required value={email}
                         onChange={(e) => setEmail(e.target.value)} className="mt-1.5" />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <button type="button" className="text-xs text-primary font-medium hover:underline"
                            onClick={() => toast.info("OTP sent to your registered phone/email (demo).")}>
                      Forgot password?
                    </button>
                  </div>
                  <Input id="password" type="password" placeholder="••••••••" required value={password}
                         onChange={(e) => setPassword(e.target.value)} className="mt-1.5" />
                </div>
                <Button type="submit" className="w-full bg-primary hover:opacity-90" size="lg">
                  Sign in as {role}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Demo mode — any email/password works.
                </p>
              </form>
            </CardContent>
          </Card>

          <p className="mt-6 text-sm text-center text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary font-semibold hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
