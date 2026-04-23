import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { mockLoans, mockNotifications } from "@/lib/mockData";
import { naira, formatDate } from "@/lib/format";
import { Wallet, TrendingDown, CalendarDays, Plus, ArrowRight, Bell } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: BorrowerDashboard,
  head: () => ({ meta: [{ title: "Dashboard — NaijaLoan" }] }),
});

function BorrowerDashboard() {
  const myLoans = mockLoans.filter((l) => l.borrowerId === "u-borrower");
  const active = myLoans.filter((l) => ["Active", "Disbursed", "Approved"].includes(l.status));
  const totalOutstanding = active.reduce((s, l) => s + l.outstanding, 0);
  const totalBorrowed = myLoans.reduce((s, l) => s + l.amount, 0);
  const next = active.find((l) => l.nextDueDate);

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
        <StatCard label="Next repayment" value={next ? formatDate(next.nextDueDate!) : "—"}
                  icon={<CalendarDays className="h-5 w-5" />} trend={next ? `${naira(45000)} due` : "No upcoming dues"} />
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
            {myLoans.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">No loans yet. Apply to get started.</p>
              </div>
            )}
            {myLoans.map((loan) => {
              const repaid = loan.amount - loan.outstanding;
              const pct = loan.amount > 0 ? (repaid / loan.amount) * 100 : 0;
              return (
                <Link key={loan.id} to="/loans" className="block rounded-xl border p-4 hover:border-primary/40 transition-colors">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="font-semibold">{loan.product}</p>
                      <p className="text-xs text-muted-foreground">{loan.id} • {loan.tenureMonths} months • {loan.interestRate}% p.a.</p>
                    </div>
                    <StatusBadge status={loan.status} />
                  </div>
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="font-semibold text-lg">{naira(loan.amount)}</span>
                    <span className="text-muted-foreground text-xs">{naira(repaid)} repaid</span>
                  </div>
                  <Progress value={pct} className="mt-2 h-1.5" />
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
            {mockNotifications.slice(0, 4).map((n) => (
              <div key={n.id} className="flex gap-3 pb-3 border-b last:border-0 last:pb-0">
                <div className={`h-2 w-2 rounded-full mt-2 shrink-0 ${
                  n.type === "warning" ? "bg-warning" : n.type === "success" ? "bg-success" : "bg-info"
                }`} />
                <div className="min-w-0">
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{n.body}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{formatDate(n.date)}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
