import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import { NIGERIAN_STATES, NIGERIAN_BANKS } from "@/lib/nigeria";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
  head: () => ({ meta: [{ title: "Profile — NaijaLoan" }] }),
});

function ProfilePage() {
  const { user } = useAuth();
  const [bank, setBank] = useState({ name: "", account: "", holder: user?.fullName ?? "" });
  if (!user) return null;

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold">Profile & Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account information.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="p-6 text-center">
            <div className="h-24 w-24 mx-auto rounded-full grid place-items-center text-primary-foreground text-2xl font-bold"
                 style={{ background: "var(--gradient-primary)" }}>
              {user.fullName.split(" ").map(n => n[0]).slice(0, 2).join("")}
            </div>
            <h2 className="mt-4 font-bold text-lg">{user.fullName}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <div className="mt-3 inline-block rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold capitalize">
              {user.role}
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Contact information</CardTitle></CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div><Label>Full name</Label><Input className="mt-1.5" defaultValue={user.fullName} /></div>
              <div><Label>Email</Label><Input className="mt-1.5" type="email" defaultValue={user.email} /></div>
              <div><Label>Phone</Label><Input className="mt-1.5" defaultValue={user.phone} /></div>
              <div>
                <Label>State</Label>
                <Select defaultValue={user.state}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select state" /></SelectTrigger>
                  <SelectContent>{NIGERIAN_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button className="sm:col-span-2 bg-primary hover:opacity-90" onClick={() => toast.success("Profile updated")}>
                Save changes
              </Button>
            </CardContent>
          </Card>

          {user.role === "borrower" && (
            <Card>
              <CardHeader><CardTitle>Bank account for disbursement</CardTitle></CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label>Bank</Label>
                  <Select value={bank.name} onValueChange={(v) => setBank({ ...bank, name: v })}>
                    <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select bank" /></SelectTrigger>
                    <SelectContent>{NIGERIAN_BANKS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Account number</Label>
                  <Input className="mt-1.5" maxLength={10} inputMode="numeric"
                         value={bank.account} onChange={(e) => setBank({ ...bank, account: e.target.value.replace(/\D/g, "") })} />
                </div>
                <div>
                  <Label>Account holder</Label>
                  <Input className="mt-1.5" value={bank.holder} onChange={(e) => setBank({ ...bank, holder: e.target.value })} />
                </div>
                <Button className="sm:col-span-2 bg-primary hover:opacity-90" onClick={() => toast.success("Bank details saved")}>
                  Save bank details
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle>Security</CardTitle></CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div><Label>Current password</Label><Input className="mt-1.5" type="password" /></div>
              <div><Label>New password</Label><Input className="mt-1.5" type="password" /></div>
              <Button className="sm:col-span-2 bg-primary hover:opacity-90" onClick={() => toast.success("Password updated")}>
                Update password
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
