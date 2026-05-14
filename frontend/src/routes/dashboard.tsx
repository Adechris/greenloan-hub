import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import type { Loan, AppNotification } from "@/lib/mockData";
import { naira, formatDate } from "@/lib/format";
import { Wallet, TrendingDown, CalendarDays, Plus, ArrowRight, Bell } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: BorrowerDashboard,
  head: () => ({ meta: [{ title: "Dashboard — NaijaLoan" }] }),
});

function BorrowerDashboard() {
  const [loans, setLoans] = useState<Loan[] | null>(null);
  const [notes, setNotes] = useState<AppNotification[]>([]);

  useEffect(() => {
    api<{ loans: Loan[] }>("/loans/mine").then((r) => setLoans(r.loans)).catch(() => setLoans([]));
    api<{ notifications: AppNotification[] }>("/notifications").then((r) => setNotes(r.notifications)).catch(() => {});
  }, []);

  const myLoans = loans ?? [];
  const active = myLoans.filter((l) => ["active", "disbursed", "approved"].includes(l.status));
  const totalOutstanding = active.reduce((s, l) => s + Number(l.outstanding ?? 0), 0);
  const totalBorrowed = myLoans.reduce((s, l) => s + Number(l.amount), 0);
  const next = active.find((l) => l.next_due_date);

  return (
    <AppShell>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Welcome back 👋</h1>
          <p className="text-muted-foreground text-sm mt-1">Here's a snapshot of your loan activity.</p>
        </div>
        <Button asChild className="bg-primary hover:opacity-90 self-start">
          <Link to="/apply"><Plus className="h-4 w-4 mr-1.5" /> Apply for new loan</Link>
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active loans" value={active.length} icon={<Wallet className="h-5 w-5" />} accent="primary" />
        <StatCard label="Outstanding" value={naira(totalOutstanding)} icon={<TrendingDown className="h-5 w-5" />} accent="gold" />
        <StatCard label="Total borrowed" value={naira(totalBorrowed)} icon={<Wallet className="h-5 w-5" />} accent="info" />
        <StatCard label="Next repayment" value={next?.next_due_date ? formatDate(next.next_due_date) : "—"}
                  icon={<CalendarDays className="h-5 w-5" />} trend={next ? "Upcoming" : "No upcoming dues"} />
      </div>

      <div className="mt-6 grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>My loans</CardTitle>
            <Link to="/loans" className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {loans === null && <Skeleton className="h-24" />}
            {loans !== null && myLoans.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">No loans yet. Apply to get started.</p>
              </div>
            )}
            {myLoans.map((loan) => {
              const out = Number(loan.outstanding ?? 0);
              const repaid = Number(loan.amount) - out;
              const pct = Number(loan.amount) > 0 ? (repaid / Number(loan.amount)) * 100 : 0;
              return (
                <Link key={loan.id} to="/loans" className="block rounded-xl border p-4 hover:border-primary/40 transition-colors">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="font-semibold">{loan.product_name}</p>
                      <p className="text-xs text-muted-foreground">L-{loan.id} • {loan.tenure_months} months • {loan.interest_rate}% p.a.</p>
                    </div>
                    <StatusBadge status={loan.status} />
                  </div>
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="font-semibold text-lg">{naira(Number(loan.amount))}</span>
                    <span className="text-muted-foreground text-xs">{naira(Math.max(0, repaid))} repaid</span>
                  </div>
                  <Progress value={Math.max(0, Math.min(100, pct))} className="mt-2 h-1.5" />
                </Link>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Bell className="h-4 w-4" /> Notifications</CardTitle>
            <Link to="/notifications" className="text-sm text-primary font-medium hover:underline">All</Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {notes.length === 0 && <p className="text-sm text-muted-foreground">No notifications yet.</p>}
            {notes.slice(0, 4).map((n) => (
              <div key={n.id} className="flex gap-3 pb-3 border-b last:border-0 last:pb-0">
                <div className={`h-2 w-2 rounded-full mt-2 shrink-0 ${
                  n.type === "warning" ? "bg-warning" : n.type === "success" ? "bg-success" : n.type === "error" ? "bg-destructive" : "bg-info"
                }`} />
                <div className="min-w-0">
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{formatDate(n.created_at)}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
