import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  PieChart, Pie, Cell,
} from "recharts";
import { mockLoans, monthlyDisbursement, portfolioBreakdown } from "@/lib/mockData";
import { naira, formatDate } from "@/lib/format";
import { Wallet, TrendingUp, Users, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
  head: () => ({ meta: [{ title: "Admin Dashboard — NaijaLoan" }] }),
});

const COLORS = ["oklch(0.45 0.13 150)", "oklch(0.76 0.15 85)", "oklch(0.6 0.13 230)"];

function AdminDashboard() {
  const totalDisbursed = mockLoans.filter((l) => ["Disbursed", "Active", "Repaid"].includes(l.status)).reduce((s, l) => s + l.amount, 0);
  const totalRepaid = totalDisbursed - mockLoans.reduce((s, l) => s + l.outstanding, 0);
  const activeBorrowers = new Set(mockLoans.filter((l) => l.status === "Active").map((l) => l.borrowerId)).size;
  const defaultRate = 4.2;

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold">Admin Overview</h1>
        <p className="text-muted-foreground text-sm mt-1">Real-time view of your lending portfolio.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Disbursed" value={naira(totalDisbursed)} icon={<Wallet className="h-5 w-5" />} accent="primary" trend="+12% this month" />
        <StatCard label="Repaid" value={naira(totalRepaid)} icon={<TrendingUp className="h-5 w-5" />} accent="gold" trend="+8% this month" />
        <StatCard label="Active borrowers" value={activeBorrowers} icon={<Users className="h-5 w-5" />} accent="info" />
        <StatCard label="Default rate" value={`${defaultRate}%`} icon={<AlertTriangle className="h-5 w-5" />} accent="destructive" trend="−0.3% vs last month" />
      </div>

      <div className="mt-6 grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Disbursements vs Repayments (₦M)</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyDisbursement}>
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
                <Pie data={portfolioBreakdown} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={3}>
                  {portfolioBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
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
                {mockLoans.slice(0, 7).map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-mono text-xs">{l.id}</TableCell>
                    <TableCell className="font-medium">{l.borrowerName}</TableCell>
                    <TableCell>{l.product}</TableCell>
                    <TableCell className="text-right font-semibold">{naira(l.amount)}</TableCell>
                    <TableCell className="text-sm">{l.officer ?? "—"}</TableCell>
                    <TableCell>{formatDate(l.appliedAt)}</TableCell>
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
