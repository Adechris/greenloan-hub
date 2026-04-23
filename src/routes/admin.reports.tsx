import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import { mockLoans, monthlyDisbursement } from "@/lib/mockData";
import { naira, formatDate } from "@/lib/format";
import { toast } from "sonner";
import { Download, FileSpreadsheet, FileText } from "lucide-react";

export const Route = createFileRoute("/admin/reports")({
  component: ReportsPage,
  head: () => ({ meta: [{ title: "Reports — NaijaLoan" }] }),
});

function ReportsPage() {
  const defaulters = mockLoans.filter((l) => l.status === "Active").slice(0, 4);

  return (
    <AppShell>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Reports & Exports</h1>
          <p className="text-muted-foreground text-sm mt-1">Download portfolio insights and compliance reports.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.success("CSV exported")}>
            <FileSpreadsheet className="h-4 w-4 mr-1.5" /> CSV
          </Button>
          <Button className="bg-primary hover:opacity-90" onClick={() => toast.success("PDF generated")}>
            <FileText className="h-4 w-4 mr-1.5" /> PDF
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader><CardTitle>Loan performance trend</CardTitle></CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyDisbursement}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 150)" />
              <XAxis dataKey="month" stroke="oklch(0.5 0.02 155)" fontSize={12} />
              <YAxis stroke="oklch(0.5 0.02 155)" fontSize={12} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.01 150)" }} />
              <Line type="monotone" dataKey="disbursed" stroke="oklch(0.45 0.13 150)" strokeWidth={3} dot={{ r: 5 }} />
              <Line type="monotone" dataKey="repaid" stroke="oklch(0.76 0.15 85)" strokeWidth={3} dot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Defaulters watchlist</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => toast.success("Defaulter list exported")}>
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
                  <TableHead className="text-right">Outstanding</TableHead>
                  <TableHead>Next due</TableHead>
                  <TableHead>Days overdue</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {defaulters.map((l, i) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-mono text-xs">{l.id}</TableCell>
                    <TableCell className="font-medium">{l.borrowerName}</TableCell>
                    <TableCell className="text-right font-semibold">{naira(l.outstanding)}</TableCell>
                    <TableCell>{l.nextDueDate ? formatDate(l.nextDueDate) : "—"}</TableCell>
                    <TableCell><span className="text-destructive font-semibold">{(i + 1) * 7}</span></TableCell>
                    <TableCell><StatusBadge status="Overdue" /></TableCell>
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
