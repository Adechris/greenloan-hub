import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import { api } from "@/lib/api";
import type { Loan } from "@/lib/mockData";
import { naira, formatDate } from "@/lib/format";
import { toast } from "sonner";
import { Download, FileSpreadsheet, FileText } from "lucide-react";

export const Route = createFileRoute("/admin/reports")({
  component: ReportsPage,
  head: () => ({ meta: [{ title: "Reports — NaijaLoan" }] }),
});

interface Stats { monthlyTrend: { month: string; disbursed: number; repaid: number }[] }

function ReportsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);

  useEffect(() => {
    api<Stats>("/admin/stats").then(setStats);
    api<{ loans: Loan[] }>("/admin/loans").then((r) => setLoans(r.loans));
  }, []);

  const exportCsv = () => {
    const header = ["loan_id", "borrower", "product", "amount", "status", "applied_at"].join(",");
    const rows = loans.map((l) => [
      `L-${l.id}`, l.borrower_name, l.product_name, l.amount, l.status, l.applied_at,
    ].map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","));
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `naijaloan-loans-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  const watchlist = loans.filter((l) => ["active", "disbursed"].includes(l.status)).slice(0, 6);

  return (
    <AppShell>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Reports & Exports</h1>
          <p className="text-muted-foreground text-sm mt-1">Download portfolio insights and compliance reports.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCsv}>
            <FileSpreadsheet className="h-4 w-4 mr-1.5" /> CSV
          </Button>
          <Button className="bg-primary hover:opacity-90" onClick={() => { window.print(); }}>
            <FileText className="h-4 w-4 mr-1.5" /> Print PDF
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader><CardTitle>Loan performance trend (₦M)</CardTitle></CardHeader>
        <CardContent className="h-72">
          {!stats ? <Skeleton className="h-full" /> : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 150)" />
                <XAxis dataKey="month" stroke="oklch(0.5 0.02 155)" fontSize={12} />
                <YAxis stroke="oklch(0.5 0.02 155)" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.01 150)" }} />
                <Line type="monotone" dataKey="disbursed" stroke="oklch(0.45 0.13 150)" strokeWidth={3} dot={{ r: 5 }} />
                <Line type="monotone" dataKey="repaid" stroke="oklch(0.76 0.15 85)" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Active loans watchlist</CardTitle>
          <Button variant="ghost" size="sm" onClick={exportCsv}>
            <Download className="h-4 w-4 mr-1.5" /> Export
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Loan ID</TableHead>
                  <TableHead>Borrower</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {watchlist.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-mono text-xs">L-{l.id}</TableCell>
                    <TableCell className="font-medium">{l.borrower_name}</TableCell>
                    <TableCell className="text-right font-semibold">{naira(Number(l.amount))}</TableCell>
                    <TableCell>{formatDate(l.applied_at)}</TableCell>
                    <TableCell><StatusBadge status={l.status} /></TableCell>
                  </TableRow>
                ))}
                {watchlist.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground">No active loans</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
