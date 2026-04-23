import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NIGERIAN_STATES } from "@/lib/nigeria";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
  head: () => ({ meta: [{ title: "Create account — NaijaLoan" }] }),
});

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "", email: "", phone: "", bvn: "", nin: "",
    state: "", employment: "", password: "",
  });

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.bvn.length !== 11) {
      toast.error("BVN must be 11 digits");
      return;
    }
    register({
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      role: "borrower",
      state: form.state,
      password: form.password,
    });
    toast.success("Account created! Welcome to NaijaLoan.");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <Logo />
          <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground">
            Already a member? <span className="text-primary font-semibold">Sign in</span>
          </Link>
        </div>

        <Card>
          <CardContent className="p-6 lg:p-8">
            <h1 className="text-2xl lg:text-3xl font-bold">Create your borrower account</h1>
            <p className="mt-2 text-muted-foreground text-sm">
              Quick onboarding — only takes a couple of minutes.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label>Full name</Label>
                <Input required placeholder="Chiamaka Eze" className="mt-1.5"
                       value={form.fullName} onChange={(e) => update("fullName", e.target.value)} />
              </div>
              <div>
                <Label>Phone number</Label>
                <Input required placeholder="+234 803 000 0000" className="mt-1.5"
                       value={form.phone} onChange={(e) => update("phone", e.target.value)} />
              </div>
              <div>
                <Label>Email</Label>
                <Input required type="email" placeholder="you@example.com" className="mt-1.5"
                       value={form.email} onChange={(e) => update("email", e.target.value)} />
              </div>
              <div>
                <Label>BVN <span className="text-destructive">*</span></Label>
                <Input required maxLength={11} inputMode="numeric" pattern="\d{11}" placeholder="11-digit BVN"
                       className="mt-1.5" value={form.bvn} onChange={(e) => update("bvn", e.target.value.replace(/\D/g, ""))} />
              </div>
              <div>
                <Label>NIN (optional)</Label>
                <Input maxLength={11} inputMode="numeric" placeholder="11-digit NIN" className="mt-1.5"
                       value={form.nin} onChange={(e) => update("nin", e.target.value.replace(/\D/g, ""))} />
              </div>
              <div>
                <Label>State of residence</Label>
                <Select value={form.state} onValueChange={(v) => update("state", v)}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select state" /></SelectTrigger>
                  <SelectContent>
                    {NIGERIAN_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Employment status</Label>
                <Select value={form.employment} onValueChange={(v) => update("employment", v)}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employed">Employed</SelectItem>
                    <SelectItem value="self-employed">Self-employed</SelectItem>
                    <SelectItem value="business-owner">Business owner</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="unemployed">Unemployed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label>Password</Label>
                <Input required type="password" minLength={6} className="mt-1.5"
                       value={form.password} onChange={(e) => update("password", e.target.value)} />
              </div>
              <Button type="submit" className="sm:col-span-2 mt-2 bg-primary hover:opacity-90" size="lg">
                Create account
              </Button>
              <p className="sm:col-span-2 text-xs text-center text-muted-foreground">
                By creating an account you agree to our Terms and Privacy Policy.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
