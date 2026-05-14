import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  PieChart, Pie, Cell,
} from "recharts";
import { api } from "@/lib/api";
import type { Loan } from "@/lib/mockData";
import { naira, formatDate } from "@/lib/format";
import { Wallet, TrendingUp, Users, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
  head: () => ({ meta: [{ title: "Admin Dashboard — NaijaLoan" }] }),
});

const COLORS = ["oklch(0.45 0.13 150)", "oklch(0.76 0.15 85)", "oklch(0.6 0.13 230)", "oklch(0.55 0.18 25)"];

interface Stats {
  totalDisbursed: number; totalRepaid: number; totalBorrowers: number; totalOfficers: number;
  totalLoans: number; activeLoans: number; defaultRate: number;
  portfolioMix: { name: string; value: number }[];
  monthlyTrend: { month: string; disbursed: number; repaid: number }[];
}

function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);

  useEffect(() => {
    api<Stats>("/admin/stats").then(setStats).catch(() => {});
    api<{ loans: Loan[] }>("/admin/loans").then((r) => setLoans(r.loans)).catch(() => {});
  }, []);

  if (!stats) return <AppShell><Skeleton className="h-64" /></AppShell>;

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold">Admin Overview</h1>
        <p className="text-muted-foreground text-sm mt-1">Real-time view of your lending portfolio.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Disbursed" value={naira(stats.totalDisbursed)} icon={<Wallet className="h-5 w-5" />} accent="primary" trend={`${stats.totalLoans} loans`} />
        <StatCard label="Repaid" value={naira(stats.totalRepaid)} icon={<TrendingUp className="h-5 w-5" />} accent="gold" />
        <StatCard label="Borrowers" value={stats.totalBorrowers} icon={<Users className="h-5 w-5" />} accent="info" trend={`${stats.totalOfficers} officers`} />
        <StatCard label="Default rate" value={`${stats.defaultRate}%`} icon={<AlertTriangle className="h-5 w-5" />} accent="destructive" />
      </div>

      <div className="mt-6 grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Disbursements vs Repayments (₦M)</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 150)" />
                <XAxis dataKey="month" stroke="oklch(0.5 0.02 155)" fontSize={12} />
                <YAxis stroke="oklch(0.5 0.02 155)" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.01 150)" }} />
                <Legend />
                <Bar dataKey="disbursed" fill="oklch(0.45 0.13 150)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="repaid" fill="oklch(0.76 0.15 85)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Portfolio mix</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.portfolioMix} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={3}>
                  {stats.portfolioMix.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle>Recent transactions</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Loan ID</TableHead>
                  <TableHead>Borrower</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Officer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans.slice(0, 8).map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-mono text-xs">L-{l.id}</TableCell>
                    <TableCell className="font-medium">{l.borrower_name}</TableCell>
                    <TableCell>{l.product_name}</TableCell>
                    <TableCell className="text-right font-semibold">{naira(Number(l.amount))}</TableCell>
                    <TableCell className="text-sm">{l.officer_name ?? "—"}</TableCell>
                    <TableCell>{formatDate(l.applied_at)}</TableCell>
                    <TableCell><StatusBadge status={l.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
