import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import type { Loan } from "@/lib/mockData";
import { naira, formatDate } from "@/lib/format";
import { ClipboardList, CheckCircle2, XCircle, AlertCircle, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/officer/")({
  component: OfficerDashboard,
  head: () => ({ meta: [{ title: "Officer Dashboard — NaijaLoan" }] }),
});

function OfficerDashboard() {
  const [loans, setLoans] = useState<Loan[] | null>(null);
  useEffect(() => { api<{ loans: Loan[] }>("/officer/queue").then((r) => setLoans(r.loans)).catch(() => setLoans([])); }, []);

  if (loans === null) return <AppShell><Skeleton className="h-64" /></AppShell>;

  const pending = loans.filter((l) => ["pending", "under_review"].includes(l.status));
  const approved = loans.filter((l) => ["approved", "disbursed", "active"].includes(l.status));
  const rejected = loans.filter((l) => l.status === "rejected");

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold">Loan Officer Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Review and manage loan applications.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total" value={loans.length} icon={<ClipboardList className="h-5 w-5" />} accent="primary" />
        <StatCard label="Pending review" value={pending.length} icon={<AlertCircle className="h-5 w-5" />} accent="gold" />
        <StatCard label="Approved" value={approved.length} icon={<CheckCircle2 className="h-5 w-5" />} accent="info" />
        <StatCard label="Rejected" value={rejected.length} icon={<XCircle className="h-5 w-5" />} accent="destructive" />
      </div>

      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent applications</CardTitle>
          <Link to="/officer/applications" className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Loan ID</TableHead>
                  <TableHead>Borrower</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans.slice(0, 8).map((l) => (
                  <TableRow key={l.id} className="hover:bg-muted/50">
                    <TableCell className="font-mono text-xs">L-{l.id}</TableCell>
                    <TableCell className="font-medium">{l.borrower_name}</TableCell>
                    <TableCell>{l.product_name}</TableCell>
                    <TableCell className="text-right font-semibold">{naira(Number(l.amount))}</TableCell>
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
